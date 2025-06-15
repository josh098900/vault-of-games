
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Gamepad, 
  LogOut, 
  Settings, 
  Library, 
  Search, 
  Users, 
  Trophy, 
  Star,
  MessageCircle,
  Menu
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NavigationDropdown } from "./NavigationDropdown";
import { NotificationDropdown } from "./NotificationDropdown";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const discoverItems = [
    {
      label: "Browse Games",
      path: "/discover",
      icon: <Search className="w-4 h-4" />,
      description: "Find your next favorite game"
    },
    {
      label: "Reviews",
      path: "/reviews",
      icon: <Star className="w-4 h-4" />,
      description: "Read and write game reviews"
    }
  ];

  const communityItems = [
    {
      label: "Discussions",
      path: "/community",
      icon: <MessageCircle className="w-4 h-4" />,
      description: "Join conversations with gamers"
    },
    {
      label: "Leaderboards",
      path: "/leaderboards",
      icon: <Trophy className="w-4 h-4" />,
      description: "See top players and achievements"
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <Gamepad className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-gradient">GameVault</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <NavigationDropdown
            title="Discover"
            icon={<Search className="w-4 h-4" />}
            items={discoverItems}
          />
          <NavigationDropdown
            title="Community"
            icon={<Users className="w-4 h-4" />}
            items={communityItems}
          />
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border border-white/20">
              <DropdownMenuItem onClick={() => navigate("/discover")}>
                <Search className="w-4 h-4 mr-2" />
                Discover Games
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/community")}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Community
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/reviews")}>
                <Star className="w-4 h-4 mr-2" />
                Reviews
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/leaderboards")}>
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboards
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem onClick={() => navigate("/library")}>
                  <Library className="w-4 h-4 mr-2" />
                  My Library
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.user_metadata?.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">
                      {user.user_metadata?.username || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border border-white/20">
                  <DropdownMenuItem onClick={() => navigate("/library")}>
                    <Library className="w-4 h-4 mr-2" />
                    My Library
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
