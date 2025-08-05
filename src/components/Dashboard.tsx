import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Trash2, ArrowUp, ArrowDown, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Crush {
  id: string;
  phone_number: string;
  priority: number;
  created_at: string;
}

const Dashboard = () => {
  const [crushes, setCrushes] = useState<Crush[]>([]);
  const [newCrush, setNewCrush] = useState("");
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCrushes();
    
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchCrushes = async () => {
    try {
      const { data, error } = await supabase
        .from('crushes')
        .select('*')
        .order('priority');

      if (error) throw error;
      setCrushes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load crushes",
        variant: "destructive",
      });
    }
  };

  const addCrush = async () => {
    if (!newCrush.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    if (crushes.length >= 4) {
      toast({
        title: "Limit Reached",
        description: "You can only have 4 crushes maximum",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Format phone number
      const formattedPhone = newCrush.startsWith('+') ? newCrush : `+1${newCrush.replace(/\D/g, '')}`;
      
      const { error } = await supabase
        .from('crushes')
        .insert({
          phone_number: formattedPhone,
          priority: crushes.length + 1,
          user_id: user.id
        });

      if (error) throw error;

      setNewCrush("");
      fetchCrushes();
      toast({
        title: "Crush Added",
        description: "Your secret crush has been added to the list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCrush = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crushes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reorder remaining crushes
      const remainingCrushes = crushes.filter(c => c.id !== id);
      for (let i = 0; i < remainingCrushes.length; i++) {
        await supabase
          .from('crushes')
          .update({ priority: i + 1 })
          .eq('id', remainingCrushes[i].id);
      }

      fetchCrushes();
      toast({
        title: "Crush Removed",
        description: "Crush removed from your list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveCrush = async (id: string, direction: 'up' | 'down') => {
    const crushIndex = crushes.findIndex(c => c.id === id);
    const newIndex = direction === 'up' ? crushIndex - 1 : crushIndex + 1;
    
    if (newIndex < 0 || newIndex >= crushes.length) return;

    try {
      // Swap priorities
      const crush1 = crushes[crushIndex];
      const crush2 = crushes[newIndex];

      await supabase
        .from('crushes')
        .update({ priority: crush2.priority })
        .eq('id', crush1.id);

      await supabase
        .from('crushes')
        .update({ priority: crush1.priority })
        .eq('id', crush2.id);

      fetchCrushes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((4 - crushes.length) / 4) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="animate-heartbeat mb-4">
          <Heart className="w-20 h-20 mx-auto text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Your Secret Crushes
        </h1>
        <p className="text-muted-foreground">
          Add up to 4 people you're interested in. Privacy guaranteed!
        </p>
      </div>

      {/* Countdown Timer */}
      <Card className="mb-8 shadow-soft">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            Love Window Timer
          </CardTitle>
          <CardDescription>
            Time remaining to find your perfect match
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-bold text-primary mb-4 font-mono">
            {formatTime(timeLeft)}
          </div>
          <Progress value={(timeLeft / (24 * 60 * 60)) * 100} className="mb-4" />
          {timeLeft === 0 && (
            <div className="p-4 border-2 border-dashed border-primary rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-lg font-semibold">Love Window Closed</p>
              <p className="text-sm text-muted-foreground mb-4">
                Time to check your matches!
              </p>
              <Button variant="love" size="lg">
                Check My Matches 💕
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Add New Crush */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add a Secret Crush
            </CardTitle>
            <CardDescription>
              Enter a phone number to add to your list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crush">Phone Number</Label>
              <Input
                id="crush"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={newCrush}
                onChange={(e) => setNewCrush(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCrush()}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{crushes.length}/4 crushes</span>
              </div>
              <Progress value={progressPercentage} />
            </div>

            <Button 
              onClick={addCrush} 
              className="w-full" 
              variant="love"
              disabled={loading || crushes.length >= 4}
            >
              {loading ? "Adding..." : "Add Crush 💕"}
            </Button>
          </CardContent>
        </Card>

        {/* Crushes List */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Your Secret Crushes
            </CardTitle>
            <CardDescription>
              Priority order matters for matching
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
                  <div
                    key={crush.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {crush.priority}
                      </Badge>
                      <span className="font-medium">{crush.phone_number}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveCrush(crush.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveCrush(crush.id, 'down')}
                        disabled={index === crushes.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCrush(crush.id)}
                        className="text-destructive hover:text-destructive"
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
    </div>
  );
};

export default Dashboard;