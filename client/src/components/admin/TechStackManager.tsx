import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface TechStack {
  id: number;
  tech_name: string;
  icon_class?: string;
  color?: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export default function TechStackManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<TechStack | null>(null);
  const [formData, setFormData] = useState({
    tech_name: '',
    icon_class: '',
    color: '',
    sort_order: 0,
    is_visible: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: techStack, isLoading } = useQuery({
    queryKey: ['admin-techstack'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tech_stack')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as TechStack[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('tech_stack')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-techstack'] });
      queryClient.invalidateQueries({ queryKey: ['/api/techstack'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: 'Technology added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding technology', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const { error } = await supabase
        .from('tech_stack')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-techstack'] });
      queryClient.invalidateQueries({ queryKey: ['/api/techstack'] });
      setIsDialogOpen(false);
      setEditingTech(null);
      resetForm();
      toast({ title: 'Technology updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating technology', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('tech_stack')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-techstack'] });
      queryClient.invalidateQueries({ queryKey: ['/api/techstack'] });
      toast({ title: 'Technology deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting technology', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      tech_name: '',
      icon_class: '',
      color: '',
      sort_order: 0,
      is_visible: true,
    });
  };

  const handleEdit = (tech: TechStack) => {
    setEditingTech(tech);
    setFormData({
      tech_name: tech.tech_name,
      icon_class: tech.icon_class || '',
      color: tech.color || '',
      sort_order: tech.sort_order,
      is_visible: tech.is_visible,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTech) {
      updateMutation.mutate({ id: editingTech.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this technology?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading tech stack...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tech Stack Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Technology
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTech ? 'Edit Technology' : 'Add New Technology'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tech_name">Technology Name *</Label>
                <Input
                  id="tech_name"
                  value={formData.tech_name}
                  onChange={(e) => setFormData({ ...formData, tech_name: e.target.value })}
                  placeholder="JavaScript"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon_class">Icon Class</Label>
                <Input
                  id="icon_class"
                  value={formData.icon_class}
                  onChange={(e) => setFormData({ ...formData, icon_class: e.target.value })}
                  placeholder="FaJs (React Icons name)"
                />
                <p className="text-xs text-muted-foreground">
                  React Icons class name (e.g., FaJs, FaPython, FaReact)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#f7df1e"
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={formData.color || '#000000'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded border"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Hex color code for the technology icon
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                  />
                  <Label htmlFor="is_visible">Visible</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingTech(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTech ? 'Update' : 'Add'} Technology
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {techStack?.map((tech) => (
          <Card key={tech.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: tech.color || '#gray' }}
                  >
                    <Code className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tech.tech_name}</CardTitle>
                    <div className="flex gap-1 mt-1">
                      {!tech.is_visible && <Badge variant="secondary">Hidden</Badge>}
                      {tech.icon_class && <Badge variant="outline" className="text-xs">{tech.icon_class}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(tech)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(tech.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <div>Color: {tech.color || 'Not set'}</div>
                <div>Sort Order: {tech.sort_order}</div>
                <div>Created: {new Date(tech.created_at).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}