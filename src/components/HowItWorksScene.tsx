
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  Gamepad, 
  Star, 
  Users, 
  Library, 
  MessageCircle, 
  Trophy,
  Search,
  Heart,
  Zap,
  ArrowRight,
  Play
} from "lucide-react";

interface HowItWorksSceneProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

export const HowItWorksScene = ({ isOpen, onClose }: HowItWorksSceneProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: Step[] = [
    {
      id: 1,
      title: "Discover Amazing Games",
      description: "Explore thousands of games across all platforms and genres",
      icon: <Search className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Browse curated game collections",
        "Search by genre, platform, or developer",
        "Get personalized recommendations",
        "View detailed game information"
      ]
    },
    {
      id: 2,
      title: "Build Your Gaming Library",
      description: "Track your gaming journey and organize your collection",
      icon: <Library className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      features: [
        "Add games to your personal library",
        "Track completion status",
        "Log hours played",
        "Rate your favorite games"
      ]
    },
    {
      id: 3,
      title: "Share Reviews & Ratings",
      description: "Help the community with honest reviews and ratings",
      icon: <Star className="w-8 h-8" />,
      color: "from-yellow-500 to-orange-500",
      features: [
        "Write detailed game reviews",
        "Rate games out of 5 stars",
        "Read community reviews",
        "Discover hidden gems"
      ]
    },
    {
      id: 4,
      title: "Connect with Gamers",
      description: "Join a vibrant community of passionate gamers",
      icon: <Users className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      features: [
        "Follow other gamers",
        "Share gaming achievements",
        "Join discussions",
        "Exchange recommendations"
      ]
    },
    {
      id: 5,
      title: "Compete & Achieve",
      description: "Challenge yourself and climb the leaderboards",
      icon: <Trophy className="w-8 h-8" />,
      color: "from-amber-500 to-yellow-500",
      features: [
        "View global leaderboards",
        "Earn gaming achievements",
        "Complete challenges",
        "Track your progress"
      ]
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, steps.length]);

  const nextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
      setIsAnimating(false);
    }, 200);
  };

  const currentStepData = steps[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-background/20 hover:bg-background/40 backdrop-blur-sm border border-white/20"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Main Content */}
        <Card className="gaming-card border-0 bg-gradient-to-br from-background/90 to-background/95 backdrop-blur-xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="text-center py-8 px-6 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20">
              <div className="flex items-center justify-center mb-4">
                <Gamepad className="w-12 h-12 text-primary mr-3 animate-pulse" />
                <h1 className="text-4xl font-bold text-gradient">Welcome to GameVault</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Your ultimate gaming social paradise
              </p>
            </div>

            {/* Step Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Step Info */}
                <div className={`space-y-6 transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${currentStepData.color} text-white shadow-lg`}>
                      {currentStepData.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                      <p className="text-muted-foreground">{currentStepData.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentStepData.features.map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-card/50 border border-white/10 backdrop-blur-sm"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side - Visual */}
                <div className="relative">
                  <div className={`gaming-card p-6 bg-gradient-to-br ${currentStepData.color} text-white transform transition-all duration-500 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        {currentStepData.icon}
                      </div>
                      <h3 className="text-xl font-bold">{currentStepData.title}</h3>
                      <div className="flex justify-center space-x-2">
                        <Heart className="w-5 h-5 animate-pulse" />
                        <Star className="w-5 h-5 animate-pulse" />
                        <MessageCircle className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Icons */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center animate-bounce">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center animate-pulse">
                    <Trophy className="w-4 h-4 text-secondary" />
                  </div>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center space-x-2 mt-8">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-primary scale-125' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <Button variant="outline" onClick={nextStep} className="border-primary/50 hover:border-primary">
                  Next Feature
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button onClick={onClose} className="bg-primary hover:bg-primary/80 glow-blue">
                  Start Gaming!
                  <Gamepad className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
