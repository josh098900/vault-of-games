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
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, Trophy, Target, Clock, Gamepad2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useChallenges } from "@/hooks/useChallenges";
import { useGames } from "@/hooks/useGames";
import { toast } from "@/hooks/use-toast";

const challengeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  challenge_type: z.enum(["game_completion", "hours_played", "achievement", "custom"]),
  target_value: z.number().min(1).optional(),
  game_id: z.string().optional(),
  end_date: z.date().optional(),
  is_group_challenge: z.boolean().default(false),
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface CreateChallengeDialogProps {
  children: React.ReactNode;
}

export const CreateChallengeDialog = ({ children }: CreateChallengeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const { createChallenge } = useChallenges();
  const { games = [] } = useGames();

  const form = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: "",
      description: "",
      challenge_type: "game_completion",
      is_group_challenge: false,
    },
  });

  const challengeType = form.watch("challenge_type");
  const isGroupChallenge = form.watch("is_group_challenge");

  const onSubmit = async (data: ChallengeFormData) => {
    try {
      await createChallenge.mutateAsync({
        title: data.title,
        description: data.description,
        challenge_type: data.challenge_type,
        target_value: data.target_value,
        game_id: data.game_id,
        end_date: data.end_date?.toISOString(),
        is_group_challenge: data.is_group_challenge,
      });

      toast({
        title: "Success!",
        description: "Challenge created successfully",
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive",
      });
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case "game_completion":
        return <Trophy className="w-4 h-4" />;
      case "hours_played":
        return <Clock className="w-4 h-4" />;
      case "achievement":
        return <Target className="w-4 h-4" />;
      default:
        return <Gamepad2 className="w-4 h-4" />;
    }
  };

  const getChallengeTypeDescription = (type: string) => {
    switch (type) {
      case "game_completion":
        return "Challenge to complete a specific game";
      case "hours_played":
        return "Challenge to play for a certain number of hours";
      case "achievement":
        return "Challenge to unlock specific achievements";
      default:
        return "Create your own custom challenge";
    }
  };

  const shouldShowTargetValue = challengeType === "hours_played" || challengeType === "achievement";
  const shouldShowGameSelection = challengeType !== "custom";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Challenge
          </DialogTitle>
          <DialogDescription>
            Create a gaming challenge for yourself or your group. Set goals and compete with friends!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter challenge title..." {...field} />
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
                      placeholder="Describe your challenge..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional details about your challenge
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="challenge_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select challenge type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="game_completion">
                        <div className="flex items-center gap-2">
                          {getChallengeTypeIcon("game_completion")}
                          <div>
                            <div className="font-medium">Game Completion</div>
                            <div className="text-xs text-muted-foreground">
                              {getChallengeTypeDescription("game_completion")}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="hours_played">
                        <div className="flex items-center gap-2">
                          {getChallengeTypeIcon("hours_played")}
                          <div>
                            <div className="font-medium">Hours Played</div>
                            <div className="text-xs text-muted-foreground">
                              {getChallengeTypeDescription("hours_played")}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="achievement">
                        <div className="flex items-center gap-2">
                          {getChallengeTypeIcon("achievement")}
                          <div>
                            <div className="font-medium">Achievement</div>
                            <div className="text-xs text-muted-foreground">
                              {getChallengeTypeDescription("achievement")}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          {getChallengeTypeIcon("custom")}
                          <div>
                            <div className="font-medium">Custom</div>
                            <div className="text-xs text-muted-foreground">
                              {getChallengeTypeDescription("custom")}
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

            {shouldShowGameSelection && (
              <FormField
                control={form.control}
                name="game_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Game</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a game for this challenge" />
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
            )}

            {shouldShowTargetValue && (
              <FormField
                control={form.control}
                name="target_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Target {challengeType === "hours_played" ? "Hours" : "Points"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder={challengeType === "hours_played" ? "Enter hours to play" : "Enter target points"}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {challengeType === "hours_played" 
                        ? "How many hours should be played to complete this challenge?"
                        : "How many points or achievements are needed?"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                            <span>Set challenge deadline</span>
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
                    When should this challenge end? Leave empty for ongoing challenges.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_group_challenge"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Group Challenge</FormLabel>
                    <FormDescription>
                      Allow others to join this challenge and compete together
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                disabled={createChallenge.isPending}
                className="bg-primary hover:bg-primary/80"
              >
                {createChallenge.isPending ? "Creating..." : "Create Challenge"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
