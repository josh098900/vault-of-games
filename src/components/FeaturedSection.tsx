import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Users, Calendar } from "lucide-react";

export const FeaturedSection = () => {
  const featuredContent = [
    {
      type: "Game of the Month",
      title: "Baldur's Gate 3",
      description: "The community's current obsession. Epic RPG storytelling meets tactical combat.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop",
      rating: 4.9,
      reviews: 15420,
      icon: Star
    },
    {
      type: "Rising Star",
      title: "Pizza Tower",
      description: "This indie platformer is climbing the charts with its unique art style.",
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop",
      rating: 4.7,
      reviews: 3240,
      icon: TrendingUp
    },
    {
      type: "Community Choice",
      title: "Hollow Knight",
      description: "The most recommended indie game by our community members.",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop",
      rating: 4.8,
      reviews: 8950,
      icon: Users
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-card/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gradient">
            Community Highlights
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover what the GameVault community is talking about this month
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredContent.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={index} className="gaming-card group overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <Badge className="absolute top-3 left-3 bg-primary/80 text-primary-foreground">
                    <IconComponent className="w-4 h-4" />
                    <span className="ml-1">{item.type}</span>
                  </Badge>

                  <div className="absolute bottom-3 right-3 flex items-center bg-black/80 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-bold text-white mr-2">{item.rating}</span>
                    <span className="text-xs text-gray-300">
                      {item.reviews.toLocaleString()}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80">
                    Explore Game
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-white/10">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-blue-400" />
            <h4 className="font-bold text-lg mb-1">This Week</h4>
            <p className="text-2xl font-bold text-primary">847</p>
            <p className="text-sm text-muted-foreground">New reviews posted</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-white/10">
            <Users className="w-8 h-8 mx-auto mb-3 text-green-400" />
            <h4 className="font-bold text-lg mb-1">Active Now</h4>
            <p className="text-2xl font-bold text-green-400">1,240</p>
            <p className="text-sm text-muted-foreground">Gamers online</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-white/10">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-pink-400" />
            <h4 className="font-bold text-lg mb-1">Trending</h4>
            <p className="text-2xl font-bold text-pink-400">RPG</p>
            <p className="text-sm text-muted-foreground">Most played genre</p>
          </div>
        </div>
      </div>
    </section>
  );
};
