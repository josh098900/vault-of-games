
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import Library from "./pages/Library";
import Community from "./pages/Community";
import DiscussionDetail from "./pages/DiscussionDetail";
import Reviews from "./pages/Reviews";
import Leaderboards from "./pages/Leaderboards";
import GameDetail from "./pages/GameDetail";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/library" element={<Library />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/discussion/:id" element={<DiscussionDetail />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
