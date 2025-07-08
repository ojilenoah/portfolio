import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Skill {
  id: number;
  category: string;
  skill_list: string;
  highlighted_skills?: string;
  sort_order: number;
  created_at: string;
}

export default function SkillsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    skill_list: '',
    highlighted_skills: '',
    sort_order: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills, isLoading } = useQuery({
    queryKey: ['admin-skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Skill[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('skills')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: 'Skill category added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding skill category', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const { error } = await supabase
        .from('skills')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setIsDialogOpen(false);
      setEditingSkill(null);
      resetForm();
      toast({ title: 'Skill category updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating skill category', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({ title: 'Skill category deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting skill category', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      category: '',
      skill_list: '',
      highlighted_skills: '',
      sort_order: 0,
    });
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      category: skill.category,
      skill_list: skill.skill_list,
      highlighted_skills: skill.highlighted_skills || '',
      sort_order: skill.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSkill) {
      updateMutation.mutate({ id: editingSkill.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this skill category?')) {
      deleteMutation.mutate(id);
    }
  };

  const parseSkills = (skillString: string) => {
    return skillString.split(',').map(s => s.trim()).filter(s => s);
  };

  const parseHighlightedSkills = (highlightedString?: string) => {
    if (!highlightedString) return [];
    return highlightedString.split(',').map(s => s.trim()).filter(s => s);
  };

  if (isLoading) {
    return <div>Loading skills...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Skills Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSkill ? 'Edit Skill Category' : 'Add New Skill Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category Name *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="WEB DEVELOPMENT"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill_list">Skills (comma-separated) *</Label>
                <Textarea
                  id="skill_list"
                  value={formData.skill_list}
                  onChange={(e) => setFormData({ ...formData, skill_list: e.target.value })}
                  placeholder="JavaScript, TypeScript, React, Node.js, NextJS"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="highlighted_skills">Highlighted Skills (comma-separated)</Label>
                <Input
                  id="highlighted_skills"
                  value={formData.highlighted_skills}
                  onChange={(e) => setFormData({ ...formData, highlighted_skills: e.target.value })}
                  placeholder="TypeScript, NextJS"
                />
                <p className="text-xs text-muted-foreground">
                  These skills will be highlighted with accent color
                </p>
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
                  setEditingSkill(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingSkill ? 'Update' : 'Add'} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {skills?.map((skill) => (
          <Card key={skill.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{skill.category}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {parseSkills(skill.skill_list).map((skillName, index) => {
                      const isHighlighted = parseHighlightedSkills(skill.highlighted_skills).includes(skillName);
                      return (
                        <Badge 
                          key={index} 
                          variant={isHighlighted ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {skillName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(skill)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(skill.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Sort Order: {skill.sort_order} | Created: {new Date(skill.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}