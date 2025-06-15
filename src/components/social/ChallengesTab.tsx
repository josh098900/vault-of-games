
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Clock, Plus } from "lucide-react";
import { useChallenges } from "@/hooks/useChallenges";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const ChallengesTab = () => {
  const { challenges, myChallenges, isLoading, joinChallenge } = useChallenges();

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge.mutateAsync(challengeId);
      toast({
        title: "Success",
        description: "You have joined the challenge!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join challenge.",
        variant: "destructive",
      });
    }
  };

  const isInChallenge = (challengeId: string) => {
    return myChallenges.some(challenge => challenge.id === challengeId);
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
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case "game_completion":
        return "Game Completion";
      case "hours_played":
        return "Hours Played";
      case "achievement":
        return "Achievement";
      default:
        return "Custom";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-6 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
          <h2 className="text-2xl font-bold">Gaming Challenges</h2>
          <p className="text-muted-foreground">Take on challenges and compete with friends</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      {myChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">My Active Challenges ({myChallenges.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myChallenges.map((challenge) => (
              <Card key={challenge.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getChallengeTypeIcon(challenge.challenge_type)}
                      {challenge.title}
                    </CardTitle>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">
                        {getChallengeTypeLabel(challenge.challenge_type)}
                      </Badge>
                    </div>
                    
                    {challenge.games && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Game:</span>
                        <span className="font-medium">{challenge.games.title}</span>
                      </div>
                    )}
                    
                    {challenge.end_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ends:</span>
                        <span>{format(new Date(challenge.end_date), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Available Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges
            .filter(challenge => !isInChallenge(challenge.id))
            .map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getChallengeTypeIcon(challenge.challenge_type)}
                    {challenge.title}
                  </CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">
                        {getChallengeTypeLabel(challenge.challenge_type)}
                      </Badge>
                    </div>
                    
                    {challenge.games && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Game:</span>
                        <span className="font-medium">{challenge.games.title}</span>
                      </div>
                    )}
                    
                    {challenge.target_value && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Target:</span>
                        <span>{challenge.target_value} {challenge.challenge_type === "hours_played" ? "hours" : "points"}</span>
                      </div>
                    )}
                    
                    {challenge.end_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ends:</span>
                        <span>{format(new Date(challenge.end_date), "MMM dd, yyyy")}</span>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={joinChallenge.isPending}
                    >
                      Join Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};
