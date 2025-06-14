
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad, User, Bell, Search } from "lucide-react";

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Gamepad className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-gradient">GameVault</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-sm hover:text-primary transition-colors">
            Discover
          </a>
          <a href="#" className="text-sm hover:text-primary transition-colors">
            Reviews
          </a>
          <a href="#" className="text-sm hover:text-primary transition-colors">
            Community
          </a>
          <a href="#" className="text-sm hover:text-primary transition-colors">
            Leaderboards
          </a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-pink-500">
                  3
                </Badge>
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                GamerTag_Pro
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/80 glow-blue">
                Join GameVault
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
