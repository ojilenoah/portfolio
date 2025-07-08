import { useState } from 'react';
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, User, Globe, Github, Linkedin, Twitter, Palette, Instagram, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: number;
  name: string;
  title: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  cv_download_url?: string;
  profile_image_url?: string;
  profile_image_hover_url?: string;
  social_github?: string;
  social_linkedin?: string;
  social_twitter?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_medium?: string;
  theme_color: string;
  created_at: string;
  updated_at: string;
}

export default function ProfileManager() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    cv_download_url: '',
    profile_image_url: '',
    profile_image_hover_url: '',
    social_github: '',
    social_linkedin: '',
    social_twitter: '',
    social_instagram: '',
    social_facebook: '',
    social_medium: '',
    theme_color: '#00754f',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        title: profile.title || '',
        bio: profile.bio || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        cv_download_url: profile.cv_download_url || '',
        profile_image_url: profile.profile_image_url || '',
        profile_image_hover_url: profile.profile_image_hover_url || '',
        social_github: profile.social_github || '',
        social_linkedin: profile.social_linkedin || '',
        social_twitter: profile.social_twitter || '',
        social_instagram: profile.social_instagram || '',
        social_facebook: profile.social_facebook || '',
        social_medium: profile.social_medium || '',
        theme_color: profile.theme_color || '#00754f',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('profile')
        .update(data)
        .eq('id', profile?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({ title: 'Profile updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('profile')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({ title: 'Profile created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating profile', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Management</h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {profile ? 'Profile Exists' : 'No Profile'}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Full-Stack Developer"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                placeholder="Brief description about yourself..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Images & Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile_image_url">Profile Image URL</Label>
              <Input
                id="profile_image_url"
                type="url"
                value={formData.profile_image_url}
                onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_image_hover_url">Profile Image Hover URL</Label>
              <Input
                id="profile_image_hover_url"
                type="url"
                value={formData.profile_image_hover_url}
                onChange={(e) => setFormData({ ...formData, profile_image_hover_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv_download_url">CV Download URL</Label>
              <Input
                id="cv_download_url"
                type="url"
                value={formData.cv_download_url}
                onChange={(e) => setFormData({ ...formData, cv_download_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="social_github" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Label>
              <Input
                id="social_github"
                type="url"
                value={formData.social_github}
                onChange={(e) => setFormData({ ...formData, social_github: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="social_linkedin"
                type="url"
                value={formData.social_linkedin}
                onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_twitter" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter
              </Label>
              <Input
                id="social_twitter"
                type="url"
                value={formData.social_twitter}
                onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="social_instagram"
                type="url"
                value={formData.social_instagram}
                onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                placeholder="https://instagram.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_facebook" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </Label>
              <Input
                id="social_facebook"
                type="url"
                value={formData.social_facebook}
                onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                placeholder="https://facebook.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_medium" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Medium
              </Label>
              <Input
                id="social_medium"
                type="url"
                value={formData.social_medium}
                onChange={(e) => setFormData({ ...formData, social_medium: e.target.value })}
                placeholder="https://medium.com/@username"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="theme_color">Theme Color</Label>
              <div className="flex gap-2">
                <Input
                  id="theme_color"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  placeholder="#00754f"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  className="w-12 h-10 rounded border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={updateMutation.isPending || createMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {profile ? 'Update' : 'Create'} Profile
          </Button>
        </div>
      </form>
    </div>
  );
}