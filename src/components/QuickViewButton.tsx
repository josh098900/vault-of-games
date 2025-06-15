
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface QuickViewButtonProps {
  onQuickView: () => void;
}

export const QuickViewButton = ({ onQuickView }: QuickViewButtonProps) => {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={onQuickView}
      className="bg-black/50 backdrop-blur-sm border-white/20"
    >
      <Eye className="w-3 h-3" />
    </Button>
  );
};
