import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, Phone, MessageCircle, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_priority: number;
  user2_priority: number;
  created_at: string;
  user1?: {
    phone_number: string;
  };
  user2?: {
    phone_number: string;
  };
}

interface MatchesPageProps {
  onBack: () => void;
}

const MatchesPage = ({ onBack }: MatchesPageProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      setCurrentUser(user);

      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately for each match
      const matchesWithProfiles = await Promise.all(
        (data || []).map(async (match) => {
          const [user1Profile, user2Profile] = await Promise.all([
            supabase.from('profiles').select('phone_number').eq('user_id', match.user1_id).single(),
            supabase.from('profiles').select('phone_number').eq('user_id', match.user2_id).single()
          ]);
          
          return {
            ...match,
            user1: user1Profile.data,
            user2: user2Profile.data
          };
        })
      );
      
      setMatches(matchesWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-yellow-500 text-yellow-900";
      case 2: return "bg-gray-400 text-gray-900";
      case 3: return "bg-orange-600 text-orange-100";
      case 4: return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_blank');
  };

  const handleMessage = (phoneNumber: string) => {
    window.open(`sms:${phoneNumber}`, '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Matches
          </h1>
          <p className="text-muted-foreground">
            People who added you back! 💕
          </p>
        </div>
      </div>

      {matches.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="text-center py-16">
            <Heart className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
            <h3 className="text-2xl font-semibold mb-4">No Matches Yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Don't worry! Matches are processed regularly. Keep adding people you're interested in and check back soon.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold mb-1">Be Patient</h4>
                <p className="text-sm text-muted-foreground">
                  Good things take time. Your perfect match might be just around the corner.
                </p>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold mb-1">Stay Active</h4>
                <p className="text-sm text-muted-foreground">
                  The more people you add, the higher your chances of finding a match.
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold mb-1">Trust the Process</h4>
                <p className="text-sm text-muted-foreground">
                  Our algorithm works in the background to find mutual connections.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => {
            const isUser1 = match.user1_id === currentUser?.id;
            const otherUserProfile = isUser1 ? match.user2 : match.user1;
            const yourPriority = isUser1 ? match.user1_priority : match.user2_priority;
            const theirPriority = isUser1 ? match.user2_priority : match.user1_priority;
            
            return (
              <Card key={match.id} className="shadow-romantic hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-6 h-6 text-primary animate-heartbeat" />
                      New Match!
                    </CardTitle>
                    <Badge variant="secondary">
                      {formatTimeAgo(match.created_at)}
                    </Badge>
                  </div>
                  <CardDescription>
                    You both added each other to your crush lists 💕
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="text-center p-6 bg-gradient-soft rounded-lg">
                    <div className="text-6xl mb-4">💕</div>
                    <h3 className="text-xl font-semibold mb-2">
                      {otherUserProfile?.phone_number || 'Unknown'}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        Your Priority: 
                        <Badge className={getPriorityBadgeColor(yourPriority)}>
                          #{yourPriority}
                        </Badge>
                      </span>
                      <span className="flex items-center gap-1">
                        Their Priority: 
                        <Badge className={getPriorityBadgeColor(theirPriority)}>
                          #{theirPriority}
                        </Badge>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleCall(otherUserProfile?.phone_number || '')}
                      className="flex-1"
                      variant="love"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button 
                      onClick={() => handleMessage(otherUserProfile?.phone_number || '')}
                      className="flex-1"
                      variant="outline"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;