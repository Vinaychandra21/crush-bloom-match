import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart, Timer, Phone, User, Plus, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Crush {
  id: string;
  phone: string;
  priority: number;
}

const Dashboard = () => {
  const [crushes, setCrushes] = useState<Crush[]>([]);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [newCrush, setNewCrush] = useState({ phone: "" });
  const { toast } = useToast();

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addCrush = () => {
    if (!newCrush.phone) {
      toast({
        title: "Missing Information",
        description: "Please enter a phone number",
        variant: "destructive"
      });
      return;
    }

    if (crushes.length >= 4) {
      toast({
        title: "Maximum Reached",
        description: "You can only add up to 4 crushes",
        variant: "destructive"
      });
      return;
    }

    const crush: Crush = {
      id: Date.now().toString(),
      phone: newCrush.phone,
      priority: crushes.length + 1
    };

    setCrushes(prev => [...prev, crush]);
    setNewCrush({ phone: "" });
    
    toast({
      title: "Crush Added! 💕",
      description: "Phone number has been added to your list",
    });
  };

  const removeCrush = (id: string) => {
    setCrushes(prev => prev.filter(crush => crush.id !== id).map((crush, index) => ({
      ...crush,
      priority: index + 1
    })));
    
    toast({
      title: "Crush Removed",
      description: "Crush has been removed from your list",
    });
  };

  const moveCrushUp = (id: string) => {
    setCrushes(prev => {
      const crushIndex = prev.findIndex(c => c.id === id);
      if (crushIndex <= 0) return prev;
      
      const newCrushes = [...prev];
      [newCrushes[crushIndex], newCrushes[crushIndex - 1]] = [newCrushes[crushIndex - 1], newCrushes[crushIndex]];
      
      return newCrushes.map((crush, index) => ({
        ...crush,
        priority: index + 1
      }));
    });
  };

  const moveCrushDown = (id: string) => {
    setCrushes(prev => {
      const crushIndex = prev.findIndex(c => c.id === id);
      if (crushIndex >= prev.length - 1) return prev;
      
      const newCrushes = [...prev];
      [newCrushes[crushIndex], newCrushes[crushIndex + 1]] = [newCrushes[crushIndex + 1], newCrushes[crushIndex]];
      
      return newCrushes.map((crush, index) => ({
        ...crush,
        priority: index + 1
      }));
    });
  };

  const progressValue = (crushes.length / 4) * 100;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 mx-auto text-primary animate-heartbeat mb-4" />
          <h1 className="text-4xl font-bold mb-2">Your Love Window</h1>
          <p className="text-muted-foreground">Add your top 4 secret crushes before time runs out!</p>
        </div>

        {/* Timer Card */}
        <Card className="mb-8 shadow-romantic animate-pulse-glow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Time Remaining</CardTitle>
            </div>
            <div className="text-4xl font-mono font-bold text-primary">
              {formatTime(timeLeft)}
            </div>
            <CardDescription>
              {timeLeft > 0 ? "Your Love Window is active!" : "Love Window has closed"}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Crush Form */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add a Secret Crush
              </CardTitle>
              <CardDescription>
                Add someone special to your list (up to 4 people)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crushPhone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="crushPhone"
                    placeholder="Enter their phone number"
                    className="pl-10"
                    value={newCrush.phone}
                    onChange={(e) => setNewCrush(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={timeLeft === 0}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  🔒 Complete privacy - no names stored, only phone numbers
                </p>
              </div>

              <div className="space-y-2">
                <Label>Progress</Label>
                <Progress value={progressValue} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {crushes.length} of 4 crushes added
                </p>
              </div>

              <Button 
                onClick={addCrush} 
                variant="love" 
                className="w-full"
                disabled={crushes.length >= 4 || timeLeft === 0}
              >
                Add Crush 💕
              </Button>
            </CardContent>
          </Card>

          {/* Crush List */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Your Secret Crushes
              </CardTitle>
              <CardDescription>
                Priority order matters for matching algorithm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {crushes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No crushes added yet</p>
                  <p className="text-sm">Start by adding someone special!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {crushes.map((crush, index) => (
                    <div key={crush.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                          {crush.priority}
                        </div>
                        <div>
                          <p className="font-medium">Crush #{crush.priority}</p>
                          <p className="text-sm text-muted-foreground">{crush.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveCrushUp(crush.id)}
                          disabled={index === 0 || timeLeft === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveCrushDown(crush.id)}
                          disabled={index === crushes.length - 1 || timeLeft === 0}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCrush(crush.id)}
                          disabled={timeLeft === 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-y-4">
          {timeLeft === 0 ? (
            <div className="p-6 bg-muted rounded-lg">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Love Window Closed</h3>
              <p className="text-muted-foreground mb-4">
                The matching process is now active. Check your matches to see if any of your crushes like you back!
              </p>
              <Button variant="romantic">
                Check My Matches
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="lg">
              Save & Check Matches Later
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;