import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface FunFact {
  id: number;
  fact_text: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export default function FunFactsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFact, setEditingFact] = useState<FunFact | null>(null);
  const [formData, setFormData] = useState({
    fact_text: '',
    is_active: true,
    sort_order: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: funFacts, isLoading } = useQuery({
    queryKey: ['admin-funfacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fun_facts')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as FunFact[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('fun_facts')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-funfacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/funfacts'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: 'Fun fact added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding fun fact', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const { error } = await supabase
        .from('fun_facts')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-funfacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/funfacts'] });
      setIsDialogOpen(false);
      setEditingFact(null);
      resetForm();
      toast({ title: 'Fun fact updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating fun fact', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('fun_facts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-funfacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/funfacts'] });
      toast({ title: 'Fun fact deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting fun fact', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      fact_text: '',
      is_active: true,
      sort_order: 0,
    });
  };

  const handleEdit = (fact: FunFact) => {
    setEditingFact(fact);
    setFormData({
      fact_text: fact.fact_text,
      is_active: fact.is_active,
      sort_order: fact.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFact) {
      updateMutation.mutate({ id: editingFact.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this fun fact?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading fun facts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fun Facts Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fun Fact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingFact ? 'Edit Fun Fact' : 'Add New Fun Fact'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fact_text">Fun Fact Text *</Label>
                <Textarea
                  id="fact_text"
                  value={formData.fact_text}
                  onChange={(e) => setFormData({ ...formData, fact_text: e.target.value })}
                  rows={3}
                  placeholder="Did you know..."
                  required
                />
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
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingFact(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingFact ? 'Update' : 'Add'} Fun Fact
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {funFacts?.map((fact) => (
          <Card key={fact.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Fun Fact #{fact.id}
                    {!fact.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(fact)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(fact.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{fact.fact_text}</p>
              <div className="text-sm text-muted-foreground">
                Sort Order: {fact.sort_order} | Created: {new Date(fact.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}