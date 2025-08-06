import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
} from "lucide-react";
import { crushService } from "../api/crushService";
import { useToast } from "@/hooks/use-toast";

interface Crush {
  phone_number: string;
  priority: number;
}

const Dashboard = () => {
  const [crushes, setCrushes] = useState<Crush[]>([]);
  const [newCrush, setNewCrush] = useState("");
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addCrush = () => {
    if (!newCrush.trim()) {
      return toast({
        title: "Error",
        description: "Enter a phone number",
        variant: "destructive",
      });
    }
    if (crushes.length >= 4) {
      return toast({
        title: "Limit Reached",
        description: "Max 4 crushes allowed",
        variant: "destructive",
      });
    }

    const cleanedPhone = newCrush.replace(/\D/g, "");
    const formattedPhone = cleanedPhone.startsWith("+")
      ? cleanedPhone
      : `+${cleanedPhone}`;

    setCrushes((prev) => [
      ...prev,
      { phone_number: formattedPhone, priority: prev.length + 1 },
    ]);
    setNewCrush("");
  };

  const removeCrush = (index: number) => {
    const updated = crushes
      .filter((_, i) => i !== index)
      .map((c, idx) => ({ ...c, priority: idx + 1 }));
    setCrushes(updated);
  };

  const moveCrush = (index: number, dir: "up" | "down") => {
    const swapIdx = dir === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= crushes.length) return;
    const updated = [...crushes];
    [updated[index], updated[swapIdx]] = [updated[swapIdx], updated[index]];
    setCrushes(updated.map((c, idx) => ({ ...c, priority: idx + 1 })));
  };

  // const submitCrushes = async () => {
  //   try {
  //     await crushService.saveCrushes(crushes);
  //     toast({ title: "Success", description: "Your crushes have been saved" });
  //   } catch (err: any) {
  //     toast({
  //       title: "Error",
  //       description: err?.message || "Something went wrong",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const submitCrushes = async () => {
    try {
      // Replace with your backend API endpoint
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crushes }),
      });
      if (!res.ok) throw new Error("Failed to save crushes");
      toast({ title: "Success", description: "Your crushes have been saved" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const progressPercentage = (crushes.length / 4) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <Heart className="w-20 h-20 mx-auto text-primary mb-4" />
        <h1 className="text-4xl font-bold">Your Secret Crushes</h1>
        <p className="text-muted-foreground">
          Add up to 4 crushes and submit once ready.
        </p>
      </div>

      {/* Countdown */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" /> Love Window Timer
          </CardTitle>
          <CardDescription>Time left to submit crushes</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-bold font-mono mb-4">
            {formatTime(timeLeft)}
          </div>
          <Progress value={(timeLeft / (24 * 60 * 60)) * 100} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Add Crush */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Plus className="w-5 h-5 inline" /> Add Crush
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="crush">Phone Number</Label>
            <Input
              id="crush"
              type="tel"
              placeholder="+91 9876543210"
              value={newCrush}
              onChange={(e) => setNewCrush(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCrush()}
            />
            <Progress value={progressPercentage} />
            <Button onClick={addCrush} disabled={crushes.length >= 4}>
              Add Crush 💕
            </Button>
          </CardContent>
        </Card>

        {/* Crush List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Crushes</CardTitle>
          </CardHeader>
          <CardContent>
            {crushes.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No crushes yet
              </p>
            ) : (
              <div className="space-y-3">
                {crushes.map((crush, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      <Badge>{crush.priority}</Badge>
                      <span>{crush.phone_number}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveCrush(idx, "up")}
                        disabled={idx === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveCrush(idx, "down")}
                        disabled={idx === crushes.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCrush(idx)}
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

      {crushes.length > 0 && (
        <div className="text-center mt-8">
          <Button size="lg" onClick={submitCrushes}>
            Submit All Crushes 🚀
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
