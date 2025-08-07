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
import { Heart, Phone, Lock, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthService, crushService } from "@/api/crushService";

interface AuthPageProps {
  authMode: "signup" | "signin";
  onAuthSuccess: () => void;
  onSwitchMode: () => void;
  onBack: () => void;
}

const AuthPage = ({
  authMode,
  onAuthSuccess,
  onSwitchMode,
  onBack,
}: AuthPageProps) => {
  const [step, setStep] = useState<"details" | "phone" | "otp">(
    authMode === "signup" ? "details" : "phone"
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [workingPhone, setWorkingPhone] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep("phone");
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format phone number
      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+1${phone.replace(/\D/g, "")}`;

      const response = await AuthService.requestOtp({
        ownerPhone: formattedPhone,
        // You might want to add an isSignup flag here for your backend
        isSignup: authMode === "signup",
      });

      console.log("response", response.data.otpSessionId);

      if (response.status !== 200) {
        throw new Error("Failed to send OTP");
      }

      setWorkingPhone(formattedPhone);
      setOtpSessionId(response.data.otpSessionId);
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
      const payload = {
        ownerName: authMode === "signup" ? name : undefined,
        ownerPhone: workingPhone,
        otpCode: otp,
        otpSessionId: otpSessionId,
        isSignup: authMode === "signup",
      };

      console.log("payload", payload);

      const response = await AuthService.verify(
        payload.otpCode,
        payload.otpSessionId,
        payload.ownerName
      );

      if (response.status === 200) {
        toast({
          title:
            authMode === "signup" ? "Welcome to CrushMatch!" : "Welcome back!",
          description: `${
            authMode === "signup" ? "Account created" : "Signed in"
          } successfully`,
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
    }
  };

  const getTitle = () => {
    if (authMode === "signup") {
      switch (step) {
        case "details":
          return "Create Your Account";
        case "phone":
          return "Verify Your Number";
        case "otp":
          return "Enter Verification Code";
      }
    } else {
      switch (step) {
        case "phone":
          return "Welcome Back";
        case "otp":
          return "Enter Verification Code";
      }
    }
  };

  const getDescription = () => {
    if (authMode === "signup") {
      switch (step) {
        case "details":
          return "Let's start with your basic information";
        case "phone":
          return "We'll send you a verification code";
        case "otp":
          return "Enter the code sent to your phone";
      }
    } else {
      switch (step) {
        case "phone":
          return "Enter your phone number to sign in";
        case "otp":
          return "Enter the code sent to your phone";
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-romantic">
        <CardHeader className="text-center">
          <div className="animate-heartbeat mb-4">
            <Heart className="w-16 h-16 mx-auto text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Signup - Details Step */}
          {authMode === "signup" && step === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="love"
                className="w-full"
                disabled={!name.trim()}
              >
                Continue
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={onSwitchMode}
                  className="text-sm"
                >
                  Already have an account? Sign In
                </Button>
              </div>
            </form>
          )}

          {/* Phone Step (both signup and signin) */}
          {step === "phone" && (
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

              <div className="space-y-2">
                {authMode === "signup" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep("details")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Details
                  </Button>
                )}

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={onSwitchMode}
                    className="text-sm"
                  >
                    {authMode === "signup"
                      ? "Already have an account? Sign In"
                      : "Don't have an account? Sign Up"}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* OTP Step (both signup and signin) */}
          {step === "otp" && (
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
                {loading
                  ? "Verifying..."
                  : authMode === "signup"
                  ? "Create Account"
                  : "Sign In"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("phone")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Phone Number
              </Button>
            </form>
          )}

          {/* Back to Landing Page */}
          <div className="mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
