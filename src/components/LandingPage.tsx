import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Timer, Users, Zap } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="animate-float mb-8">
            <Heart className="w-20 h-20 mx-auto text-primary animate-heartbeat" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CrushMatch
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover if your secret crush likes you back. Add your top 4 crushes during the Love Window 
            and find out if the feeling is mutual!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="love" size="lg" className="text-lg px-8 py-4">
              Start Your Love Journey
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How CrushMatch Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-soft hover:shadow-romantic transition-smooth text-center">
              <CardHeader>
                <Timer className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Love Window</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  You have 24 hours to add your top 4 secret crushes with their mobile numbers
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-romantic transition-smooth text-center">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Add Crushes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Select up to 4 people you have feelings for and add their contact information
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-romantic transition-smooth text-center">
              <CardHeader>
                <Zap className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our priority-based algorithm finds mutual matches when both people like each other
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-romantic transition-smooth text-center">
              <CardHeader>
                <Heart className="w-12 h-12 mx-auto text-primary mb-4 animate-heartbeat" />
                <CardTitle>Reveal Love</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get notified when you have a mutual match and connect with your secret crush!
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Match?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of people who have found their perfect match through CrushMatch
          </p>
          <Button variant="romantic" size="lg" className="text-lg px-12 py-4 animate-pulse-glow">
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;