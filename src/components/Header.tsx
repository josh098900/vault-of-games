
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad, User, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <Gamepad className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-gradient">GameVault</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/discover" className="text-sm hover:text-primary transition-colors">
            Discover
          </Link>
          <Link to="/reviews" className="text-sm hover:text-primary transition-colors">
            Reviews
          </Link>
          <Link to="/community" className="text-sm hover:text-primary transition-colors">
            Community
          </Link>
          <Link to="/leaderboards" className="text-sm hover:text-primary transition-colors">
            Leaderboards
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-pink-500">
                  3
                </Badge>
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                {user.user_metadata?.username || user.email?.split('@')[0]}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/80 glow-blue" onClick={() => navigate("/auth")}>
                Join GameVault
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
