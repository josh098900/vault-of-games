
import { Calendar, Users, TrendingUp } from "lucide-react";

export const QuickStats = () => {
  return (
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
  );
};
