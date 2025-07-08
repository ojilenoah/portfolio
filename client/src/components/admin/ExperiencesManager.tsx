import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies?: string;
  company_url?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function ExperiencesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    period: '',
    description: '',
    technologies: '',
    company_url: '',
    sort_order: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: experiences, isLoading } = useQuery({
    queryKey: ['admin-experiences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Experience[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('experiences')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: 'Experience added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding experience', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const { error } = await supabase
        .from('experiences')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      setIsDialogOpen(false);
      setEditingExperience(null);
      resetForm();
      toast({ title: 'Experience updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating experience', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      toast({ title: 'Experience deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting experience', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      period: '',
      description: '',
      technologies: '',
      company_url: '',
      sort_order: 0,
    });
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({
      title: experience.title,
      company: experience.company,
      period: experience.period,
      description: experience.description,
      technologies: experience.technologies || '',
      company_url: experience.company_url || '',
      sort_order: experience.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExperience) {
      updateMutation.mutate({ id: editingExperience.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this experience?')) {
      deleteMutation.mutate(id);
    }
  };

  const parseTechnologies = (techString?: string) => {
    if (!techString) return [];
    try {
      return JSON.parse(techString);
    } catch {
      return techString.split(',').map(t => t.trim());
    }
  };

  if (isLoading) {
    return <div>Loading experiences...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Experience Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingExperience ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period">Period *</Label>
                  <Input
                    id="period"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="2022 - Present"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_url">Company URL</Label>
                  <Input
                    id="company_url"
                    type="url"
                    value={formData.company_url}
                    onChange={(e) => setFormData({ ...formData, company_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies (JSON array format)</Label>
                <Textarea
                  id="technologies"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder='["Python", "Django", "PostgreSQL"]'
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingExperience(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingExperience ? 'Update' : 'Add'} Experience
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {experiences?.map((experience) => (
          <Card key={experience.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {experience.title}
                    <Badge variant="outline">{experience.company}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{experience.period}</p>
                  <p className="text-sm mt-2">{experience.description}</p>
                </div>
                <div className="flex gap-2">
                  {experience.company_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={experience.company_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="icon" onClick={() => handleEdit(experience)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(experience.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {experience.technologies && (
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-2">
                  {parseTechnologies(experience.technologies).map((tech: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Sort Order: {experience.sort_order} | Created: {new Date(experience.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}