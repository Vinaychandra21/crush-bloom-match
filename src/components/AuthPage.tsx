import { useState } from "react";
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
import { Heart, Phone, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format phone number
      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+1${phone.replace(/\D/g, "")}`;

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Check your phone for the verification code",
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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+1${phone.replace(/\D/g, "")}`;

      // Use our custom verify-otp function
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: {
          phone: formattedPhone,
          token: otp,
          type: "signup",
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Welcome!",
          description: "Authentication successful",
        });
        onAuthSuccess();
      } else {
        throw new Error("Verification failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      onAuthSuccess(); // remove this line if you don't want to auto-redirect after OTP verification
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-romantic">
        <CardHeader className="text-center">
          <div className="animate-heartbeat mb-4">
            <Heart className="w-16 h-16 mx-auto text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "phone" ? "Join CrushMatch" : "Verify Your Phone"}
          </CardTitle>
          <CardDescription>
            {step === "phone"
              ? "Enter your phone number to get started"
              : "Enter the verification code sent to your phone"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="love"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="pl-10 text-center text-lg tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="love"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("phone")}
              >
                Back to Phone Number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
