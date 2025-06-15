
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gamepad } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

export const HeroSection = ({ searchQuery, setSearchQuery, onSearch }: HeroSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch();
    }
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-green-600/20 to-pink-600/20 animate-pulse-rgb"></div>
      <div className="container mx-auto text-center relative z-10">
        <div className="animate-float mb-8">
          <Gamepad className="w-16 h-16 mx-auto text-primary mb-4 morphing-icon" />
        </div>
        <h1 className="text-6xl font-bold mb-6 text-gradient animate-fade-in-up">
          GameVault
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {user 
            ? `Welcome back, ${user.user_metadata?.username || user.email?.split('@')[0]}! Track, rate, and discover your next favorite game.`
            : "The Ultimate Gaming Social Paradise. Track, rate, and discover your next favorite game with the community."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 morphing-icon" />
            <Input
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 glass-card border-white/20 backdrop-blur-sm micro-interaction"
            />
          </div>
          {user ? (
            <Button 
              className="bg-primary hover:bg-primary/80 glow-blue micro-interaction"
              onClick={handleSearch}
            >
              <Search className="w-4 h-4 mr-2 morphing-icon" />
              Search Games
            </Button>
          ) : (
            <Button 
              className="bg-primary hover:bg-primary/80 glow-blue micro-interaction"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
