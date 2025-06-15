
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, StarOff, ExternalLink, Plus } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { CreateEventDialog } from "./CreateEventDialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const EventsTab = () => {
  const { events, interestedEvents, isLoading, markInterested, removeInterest, isInterested } = useEvents();

  const handleToggleInterest = async (eventId: string) => {
    try {
      if (isInterested(eventId)) {
        await removeInterest.mutateAsync(eventId);
        toast({
          title: "Success",
          description: "Removed from your interested events.",
        });
      } else {
        await markInterested.mutateAsync(eventId);
        toast({
          title: "Success",
          description: "Added to your interested events!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interest.",
        variant: "destructive",
      });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "release":
        return "bg-green-500";
      case "tournament":
        return "bg-yellow-500";
      case "sale":
        return "bg-red-500";
      case "update":
        return "bg-blue-500";
      case "dlc":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "release":
        return "Game Release";
      case "tournament":
        return "Tournament";
      case "sale":
        return "Sale";
      case "update":
        return "Game Update";
      case "dlc":
        return "DLC Release";
      default:
        return "Event";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-6 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse h-6 bg-muted rounded w-3/4"></div>
                <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gaming Events</h2>
          <p className="text-muted-foreground">Stay updated with the latest gaming events and releases</p>
        </div>
        <CreateEventDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </CreateEventDialog>
      </div>

      {interestedEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">My Interested Events ({interestedEvents.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interestedEvents.map((event) => (
              <Card key={event.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {getEventTypeLabel(event.event_type)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleInterest(event.id)}
                    >
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.start_date), "MMM dd, yyyy")}</span>
                    </div>
                    
                    {event.games && (
                      <div>
                        <span className="text-muted-foreground">Game: </span>
                        <span className="font-medium">{event.games.title}</span>
                      </div>
                    )}
                    
                    {event.external_url && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={event.external_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Learn More
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className={getEventTypeColor(event.event_type)}>
                    {getEventTypeLabel(event.event_type)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleInterest(event.id)}
                  >
                    {isInterested(event.id) ? (
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(event.start_date), "MMM dd, yyyy")}</span>
                  </div>
                  
                  {event.games && (
                    <div>
                      <span className="text-muted-foreground">Game: </span>
                      <span className="font-medium">{event.games.title}</span>
                    </div>
                  )}
                  
                  {event.external_url && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={event.external_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Learn More
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
