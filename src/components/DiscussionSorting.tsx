
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Clock, Heart, MessageCircle, Eye, TrendingUp } from "lucide-react";

export type SortOption = 
  | "newest" 
  | "oldest" 
  | "most_liked" 
  | "most_replies" 
  | "most_views" 
  | "recently_active";

interface DiscussionSortingProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  currentTimeFilter: string;
  onTimeFilterChange: (filter: string) => void;
}

const sortOptions: Array<{
  value: SortOption;
  label: string;
  icon: React.ReactNode;
}> = [
  { value: "newest", label: "Newest First", icon: <Clock className="w-4 h-4" /> },
  { value: "oldest", label: "Oldest First", icon: <Clock className="w-4 h-4" /> },
  { value: "most_liked", label: "Most Liked", icon: <Heart className="w-4 h-4" /> },
  { value: "most_replies", label: "Most Replies", icon: <MessageCircle className="w-4 h-4" /> },
  { value: "most_views", label: "Most Views", icon: <Eye className="w-4 h-4" /> },
  { value: "recently_active", label: "Recently Active", icon: <TrendingUp className="w-4 h-4" /> },
];

const timeFilters = ["All Time", "Today", "This Week", "This Month"];

export const DiscussionSorting = ({ 
  currentSort, 
  onSortChange, 
  currentTimeFilter, 
  onTimeFilterChange 
}: DiscussionSortingProps) => {
  const currentSortOption = sortOptions.find(option => option.value === currentSort);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-white/20 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">Sort by:</span>
              {currentSortOption?.icon}
              <span>{currentSortOption?.label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background/95 backdrop-blur-md border border-white/20">
            {sortOptions.map((option) => (
              <DropdownMenuItem 
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {option.icon}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2">
        {timeFilters.map((filter) => (
          <Badge
            key={filter}
            variant={currentTimeFilter === filter ? "default" : "outline"}
            className={`cursor-pointer ${
              currentTimeFilter === filter ? "bg-primary" : "border-white/20"
            }`}
            onClick={() => onTimeFilterChange(filter)}
          >
            {filter}
          </Badge>
        ))}
      </div>
    </div>
  );
};
