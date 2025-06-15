
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { HowItWorksScene } from "./HowItWorksScene";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const HowItWorksButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 glow-blue"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>How GameVault Works</p>
        </TooltipContent>
      </Tooltip>

      <HowItWorksScene 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </TooltipProvider>
  );
};
