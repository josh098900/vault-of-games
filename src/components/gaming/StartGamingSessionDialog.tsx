
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Play, Users, Eye } from "lucide-react";
import { useGames } from "@/hooks/useGames";
import { useCreateGamingSession } from "@/hooks/useLiveGamingSessions";

export const StartGamingSessionDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [sessionType, setSessionType] = useState<"playing" | "streaming" | "looking_for_party">("playing");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>();
  const [isPublic, setIsPublic] = useState(true);

  const { data: games = [] } = useGames();
  const createSession = useCreateGamingSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId) return;

    createSession.mutate({
      gameId: selectedGameId,
      sessionType,
      description: description || undefined,
      maxParticipants,
      isPublic
    }, {
      onSuccess: () => {
        setOpen(false);
        // Reset form
        setSelectedGameId("");
        setSessionType("playing");
        setDescription("");
        setMaxParticipants(undefined);
        setIsPublic(true);
      }
    });
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'streaming':
        return <Eye className="w-4 h-4" />;
      case 'looking_for_party':
        return <Users className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Play className="w-4 h-4 mr-2" />
          Start Gaming Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Live Gaming Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="game">Game</Label>
            <Select value={selectedGameId} onValueChange={setSelectedGameId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Session Type</Label>
            <Select value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="playing">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Playing
                  </div>
                </SelectItem>
                <SelectItem value="streaming">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Streaming/Spectating
                  </div>
                </SelectItem>
                <SelectItem value="looking_for_party">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Looking for Party
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you up to? Any specific goals or activities?"
              rows={3}
            />
          </div>

          {sessionType !== 'streaming' && (
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="2"
                max="20"
                value={maxParticipants || ""}
                onChange={(e) => setMaxParticipants(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Leave empty for unlimited"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="isPublic">Public Session</Label>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedGameId || createSession.isPending}
              className="flex-1"
            >
              {createSession.isPending ? "Starting..." : "Start Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
