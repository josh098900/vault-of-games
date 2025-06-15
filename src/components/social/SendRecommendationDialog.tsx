
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Heart } from "lucide-react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useFriends } from "@/hooks/useFriends";
import { useGames } from "@/hooks/useGames";
import { toast } from "@/hooks/use-toast";

const recommendationSchema = z.object({
  recipientId: z.string().min(1, "Please select a friend"),
  gameId: z.string().min(1, "Please select a game"),
  message: z.string().optional(),
});

type RecommendationFormData = z.infer<typeof recommendationSchema>;

interface SendRecommendationDialogProps {
  children: React.ReactNode;
}

export const SendRecommendationDialog = ({ children }: SendRecommendationDialogProps) => {
  const [open, setOpen] = useState(false);
  const { following } = useFriends();
  const { games = [] } = useGames();
  const { sendRecommendation } = useRecommendations();

  const form = useForm<RecommendationFormData>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (data: RecommendationFormData) => {
    try {
      await sendRecommendation.mutateAsync({
        recipientId: data.recipientId,
        gameId: data.gameId,
        message: data.message,
      });

      toast({
        title: "Success!",
        description: "Game recommendation sent successfully",
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send recommendation",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Send Game Recommendation
          </DialogTitle>
          <DialogDescription>
            Recommend a game to one of your friends with a personal message.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Send to</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a friend" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {following.map((follow) => (
                        <SelectItem key={follow.following_id} value={follow.following_id}>
                          <div className="flex items-center gap-2">
                            <span>
                              {follow.profiles.display_name || follow.profiles.username || "Unknown User"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gameId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game to recommend</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a game" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {games.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          <div className="flex items-center gap-2">
                            {game.cover_image_url && (
                              <img 
                                src={game.cover_image_url} 
                                alt={game.title}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            <span>{game.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal message (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Why do you recommend this game?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={sendRecommendation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {sendRecommendation.isPending ? "Sending..." : "Send Recommendation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
