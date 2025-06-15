
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp } from "lucide-react";

const trendingGames = [
  { title: "Baldur's Gate 3", rating: 4.9, reviews: 2847 },
  { title: "Spider-Man 2", rating: 4.7, reviews: 1923 },
  { title: "Alan Wake 2", rating: 4.5, reviews: 1456 },
  { title: "Super Mario Wonder", rating: 4.8, reviews: 1234 }
];

export const TrendingSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center animate-fade-in-up">
            <TrendingUp className="w-8 h-8 mr-3 text-green-400 morphing-icon" />
            Trending Now
          </h2>
          <Button variant="outline" className="glass-card border-white/20 hover:border-primary/50 micro-interaction">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingGames.map((game, index) => (
            <Card key={index} className="glass-card group micro-interaction" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs glass-card">
                    #{index + 1}
                  </Badge>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current mr-1 morphing-icon" />
                    <span className="font-bold animate-counter">{game.rating}</span>
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {game.reviews.toLocaleString()} reviews
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
