
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
          <Gamepad className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          <span className="text-xl md:text-2xl font-bold text-gradient">GameVault</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4">
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

        {/* User Actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {user ? (
            <>
              {/* Notifications - always visible for logged in users */}
              <NotificationDropdown />
              
              {/* Desktop User Menu */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {user.user_metadata?.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">
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
              </div>

              {/* Mobile Menu for logged in users */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {user.user_metadata?.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md border border-white/20">
                    <DropdownMenuItem onClick={() => navigate("/discover")}>
                      <Search className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>Discover Games</span>
                        <span className="text-xs text-muted-foreground">Find your next favorite</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/community")}>
                      <MessageCircle className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>Community</span>
                        <span className="text-xs text-muted-foreground">Join discussions</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/reviews")}>
                      <Star className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>Reviews</span>
                        <span className="text-xs text-muted-foreground">Read & write reviews</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/leaderboards")}>
                      <Trophy className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>Leaderboards</span>
                        <span className="text-xs text-muted-foreground">Top players</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/library")}>
                      <Library className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>My Library</span>
                        <span className="text-xs text-muted-foreground">Your games</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <Settings className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>Edit Profile</span>
                        <span className="text-xs text-muted-foreground">Account settings</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>Sign Out</span>
                        <span className="text-xs text-muted-foreground">Logout from GameVault</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/80 glow-blue" onClick={() => navigate("/auth")}>
                  Join GameVault
                </Button>
              </div>
              
              {/* Mobile Auth Menu */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
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
                    <DropdownMenuItem onClick={() => navigate("/auth")}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign In
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
