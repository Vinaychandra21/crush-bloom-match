import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Phone, Sparkles, Users, ArrowLeft } from "lucide-react";

interface Match {
  id: string;
  name: string;
  phone: string;
  mutualPriority: number;
  matchedAt: Date;
  connectionStatus: 'new' | 'contacted' | 'connected';
}

interface MatchesPageProps {
  onBack: () => void;
}

const MatchesPage = ({ onBack }: MatchesPageProps) => {
  const [matches] = useState<Match[]>([
    {
      id: "1",
      name: "Alex Chen",
      phone: "+1 (555) 123-4567",
      mutualPriority: 1,
      matchedAt: new Date(),
      connectionStatus: 'new'
    },
    {
      id: "2", 
      name: "Sam Rodriguez",
      phone: "+1 (555) 987-6543",
      mutualPriority: 3,
      matchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      connectionStatus: 'contacted'
    }
  ]);

  const updateConnectionStatus = (matchId: string, status: Match['connectionStatus']) => {
    // TODO: Update match status in database
    console.log(`Updating match ${matchId} to status: ${status}`);
  };

  const getPriorityBadgeColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-gradient-to-r from-pink-500 to-rose-500 text-white";
      case 2: return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case 3: return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
      case 4: return "bg-gradient-to-r from-green-500 to-blue-500 text-white";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours === 0) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-12 h-12 text-primary animate-heartbeat" />
              <Sparkles className="w-8 h-8 text-accent animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Your Matches!</h1>
            <p className="text-muted-foreground">
              Congratulations! These people also added you to their crush list
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          // No Matches State
          <Card className="shadow-soft text-center py-16">
            <CardContent>
              <Heart className="w-24 h-24 mx-auto mb-6 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold mb-4">No Matches Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Don't worry! Matches can appear anytime during the Love Window period. 
                Your crushes might still be adding their lists!
              </p>
              <Button variant="romantic" onClick={onBack}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Match Summary */}
            <Card className="mb-8 shadow-romantic animate-pulse-glow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Users className="w-6 h-6" />
                  {matches.length} Mutual {matches.length === 1 ? 'Match' : 'Matches'} Found!
                </CardTitle>
                <CardDescription>
                  These are your mutual crushes based on priority matching
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Matches List */}
            <div className="space-y-6">
              {matches.map((match, index) => (
                <Card 
                  key={match.id} 
                  className="shadow-soft hover:shadow-romantic transition-smooth overflow-hidden"
                >
                  <CardHeader className="relative">
                    <div className="absolute top-4 right-4">
                      <Badge className={getPriorityBadgeColor(match.mutualPriority)}>
                        Priority #{match.mutualPriority} Match
                      </Badge>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-love rounded-full flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white animate-heartbeat" />
                      </div>
                      
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-1">{match.name}</CardTitle>
                        <CardDescription className="text-base">
                          Matched {formatTimeAgo(match.matchedAt)}
                        </CardDescription>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-mono">{match.phone}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg mb-4">
                      <p className="text-sm text-center">
                        🎉 <strong>Mutual Crush Alert!</strong> You both added each other to your lists. 
                        This is a {match.mutualPriority === 1 ? 'TOP' : `#${match.mutualPriority}`} priority match!
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        variant="love" 
                        className="flex-1"
                        onClick={() => {
                          window.open(`tel:${match.phone}`, '_blank');
                          updateConnectionStatus(match.id, 'contacted');
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                      
                      <Button 
                        variant="romantic" 
                        className="flex-1"
                        onClick={() => {
                          window.open(`sms:${match.phone}?body=Hey! I just saw we matched on CrushMatch! 💕`, '_blank');
                          updateConnectionStatus(match.id, 'contacted');
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => updateConnectionStatus(match.id, 'connected')}
                      >
                        Mark as Connected
                      </Button>
                    </div>
                    
                    {match.connectionStatus === 'contacted' && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm text-center">
                        ✅ You've reached out to this match!
                      </div>
                    )}
                    
                    {match.connectionStatus === 'connected' && (
                      <div className="mt-3 p-2 bg-pink-50 border border-pink-200 rounded text-pink-700 text-sm text-center">
                        💕 You're connected with this match!
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tips Section */}
            <Card className="mt-8 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Tips for Your First Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">📱 Making Contact</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Be genuine and mention CrushMatch</li>
                      <li>• Start with a simple "Hey! We matched!"</li>
                      <li>• Suggest meeting for coffee or a casual activity</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">💕 Building Connection</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Be yourself and stay relaxed</li>
                      <li>• Ask about their interests and hobbies</li>
                      <li>• Take it slow and enjoy getting to know them</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;