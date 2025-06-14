
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    display_name: "",
    bio: "",
    location: "",
    website: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile({
          username: data.username || "",
          display_name: data.display_name || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          avatar_url: data.avatar_url || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: "Failed to load your profile information.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      
      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error uploading avatar",
        description: "Failed to upload your profile picture.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <User className="w-6 h-6 mr-2 text-primary" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/80 text-white rounded-full p-2 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              {uploading && (
                <p className="text-sm text-muted-foreground">Uploading...</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={profile.display_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Where are you located?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profile.website}
                  onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://your-website.com"
                />
              </div>
            </div>

            <Button 
              onClick={updateProfile}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/80 glow-blue"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
