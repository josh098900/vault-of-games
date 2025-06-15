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
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Star, Calendar as CalendarLucide, Clock, DollarSign, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/useEvents";
import { useGames } from "@/hooks/useGames";
import { toast } from "@/hooks/use-toast";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  event_type: z.enum(["release", "tournament", "sale", "update", "dlc"]),
  game_id: z.string().optional(),
  start_date: z.date(),
  end_date: z.date().optional(),
  external_url: z.string().url().optional().or(z.literal("")),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventDialogProps {
  children: React.ReactNode;
}

export const CreateEventDialog = ({ children }: CreateEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const { createEvent } = useEvents();
  const { data: games = [] } = useGames();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      event_type: "release",
      external_url: "",
    },
  });

  const eventType = form.watch("event_type");

  const onSubmit = async (data: EventFormData) => {
    try {
      await createEvent.mutateAsync({
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        game_id: data.game_id,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date?.toISOString(),
        external_url: data.external_url || undefined,
      });

      toast({
        title: "Success!",
        description: "Event created successfully",
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "release":
        return <Download className="w-4 h-4" />;
      case "tournament":
        return <Star className="w-4 h-4" />;
      case "sale":
        return <DollarSign className="w-4 h-4" />;
      case "update":
        return <CalendarLucide className="w-4 h-4" />;
      case "dlc":
        return <Plus className="w-4 h-4" />;
      default:
        return <CalendarLucide className="w-4 h-4" />;
    }
  };

  const getEventTypeDescription = (type: string) => {
    switch (type) {
      case "release":
        return "Game release or launch event";
      case "tournament":
        return "Gaming tournament or competition";
      case "sale":
        return "Game sale or discount event";
      case "update":
        return "Game update or patch release";
      case "dlc":
        return "Downloadable content release";
      default:
        return "General gaming event";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Create a gaming event to share with the community. Add tournaments, releases, sales, and more!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your event..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional details about the event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="release">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon("release")}
                          <div>
                            <div className="font-medium">Game Release</div>
                            <div className="text-xs text-muted-foreground">
                              {getEventTypeDescription("release")}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="tournament">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon("tournament")}
                          <div>
                            <div className="font-medium">Tournament</div>
                            <div className="text-xs text-muted-foreground">
                              {getEventTypeDescription("tournament")}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="sale">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon("sale")}
                          <div>
                            <div className="font-medium">Sale</div>
                            <div className="text-xs text-muted-foreground">
                              {getEventTypeDescription("sale")}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="update">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon("update")}
                          <div>
                            <div className="font-medium">Game Update</div>
                            <div className="text-xs text-muted-foreground">
                              {getEventTypeDescription("update")}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="dlc">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon("dlc")}
                          <div>
                            <div className="font-medium">DLC Release</div>
                            <div className="text-xs text-muted-foreground">
                              {getEventTypeDescription("dlc")}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="game_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Game (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a game for this event" />
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
                  <FormDescription>
                    Link this event to a specific game
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick event start date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setStartDateOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When does this event start?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick event end date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setEndDateOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When does this event end? Leave empty for single-day events.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="external_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/event-details"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link to external website with more event details
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createEvent.isPending}
                className="bg-primary hover:bg-primary/80"
              >
                {createEvent.isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
