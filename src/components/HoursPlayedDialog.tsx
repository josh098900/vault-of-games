
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HoursPlayedDialogProps {
  currentHours: number | null;
  onUpdateHours: (hours: number) => void;
  isUpdating: boolean;
}

export const HoursPlayedDialog = ({ 
  currentHours, 
  onUpdateHours, 
  isUpdating 
}: HoursPlayedDialogProps) => {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(currentHours?.toString() || "0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNumber = parseFloat(hours);
    
    if (isNaN(hoursNumber) || hoursNumber < 0) {
      toast({
        title: "Invalid hours",
        description: "Please enter a valid number of hours.",
        variant: "destructive",
      });
      return;
    }

    onUpdateHours(hoursNumber);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-black/50 backdrop-blur-sm border-white/20"
        >
          <Clock className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Hours Played</DialogTitle>
          <DialogDescription>
            Update the number of hours you've played this game.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="hours">Hours Played</Label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Enter hours played"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Hours"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
