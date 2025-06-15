
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, Save, Upload, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
}

export const ProfileManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            ...updatedProfile,
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      // Update profile with new avatar URL
      if (isEditing) {
        setFormData({ ...formData, avatar_url: publicUrl });
      } else {
        await updateProfileMutation.mutateAsync({ avatar_url: publicUrl });
      }

      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been successfully uploaded.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEdit = () => {
    setFormData(profile || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card className="gaming-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 w-20 bg-muted rounded-full mx-auto"></div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="gaming-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src={isEditing ? formData.avatar_url || undefined : profile?.avatar_url || undefined} 
              alt={profile?.display_name || profile?.username || "User"} 
            />
            <AvatarFallback className="text-lg">
              {(profile?.display_name || profile?.username || user.email || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="w-full max-w-sm space-y-2">
            {isEditing && (
              <Input
                placeholder="Avatar URL"
                value={formData.avatar_url || ''}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              />
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Upload Avatar'}
            </Button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Username</label>
                <Input
                  placeholder="Enter username"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Display Name</label>
                <Input
                  placeholder="Enter display name"
                  value={formData.display_name || ''}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Input
                  placeholder="Enter location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Website</label>
                <Input
                  placeholder="Enter website URL"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold">
                  {profile?.display_name || profile?.username || "Anonymous User"}
                </h3>
                {profile?.username && profile?.display_name && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
              </div>
              
              {profile?.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
              
              {profile?.location && (
                <p className="text-sm text-muted-foreground">📍 {profile.location}</p>
              )}
              
              {profile?.website && (
                <p className="text-sm text-muted-foreground">
                  🌐 <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {profile.website}
                  </a>
                </p>
              )}
              
              <p className="text-sm text-muted-foreground">
                📧 {user.email}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave} 
                disabled={updateProfileMutation.isPending}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} className="w-full">
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
