
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GamingEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: "release" | "tournament" | "sale" | "update" | "dlc";
  game_id: string | null;
  start_date: string;
  end_date: string | null;
  external_url: string | null;
  created_by: string | null;
  created_at: string;
  games?: {
    id: string;
    title: string;
    cover_image_url: string | null;
  };
}

export const useEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gaming_events")
        .select(`
          *,
          games (
            id,
            title,
            cover_image_url
          )
        `)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as GamingEvent[];
    },
  });

  const { data: interestedEvents = [], isLoading: isLoadingInterested } = useQuery({
    queryKey: ["interestedEvents", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("event_interests")
        .select(`
          *,
          gaming_events (
            *,
            games (
              id,
              title,
              cover_image_url
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(item => item.gaming_events) as GamingEvent[];
    },
    enabled: !!user,
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: {
      title: string;
      description?: string;
      event_type: "release" | "tournament" | "sale" | "update" | "dlc";
      game_id?: string;
      start_date: string;
      end_date?: string;
      external_url?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("gaming_events")
        .insert({
          ...eventData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const markInterested = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("event_interests")
        .insert({
          event_id: eventId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interestedEvents", user?.id] });
    },
  });

  const removeInterest = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("event_interests")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interestedEvents", user?.id] });
    },
  });

  const isInterested = (eventId: string) => {
    return interestedEvents.some(event => event.id === eventId);
  };

  return {
    events,
    interestedEvents,
    isLoading,
    isLoadingInterested,
    createEvent,
    markInterested,
    removeInterest,
    isInterested,
  };
};
