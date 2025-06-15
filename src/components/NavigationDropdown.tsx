
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Trophy, BookOpen, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationDropdownProps {
  title: string;
  icon: React.ReactNode;
  items: Array<{
    label: string;
    path: string;
    icon: React.ReactNode;
    description?: string;
  }>;
}

export const NavigationDropdown = ({ title, icon, items }: NavigationDropdownProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-sm">
          {icon}
          <span className="hidden sm:inline">{title}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-md border border-white/20">
        <DropdownMenuLabel className="text-primary">{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem 
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {item.icon}
            <div className="flex flex-col">
              <span>{item.label}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">{item.description}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
