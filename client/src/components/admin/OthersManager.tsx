import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import OthersReorderManager from './OthersReorderManager';
import MarkdownEditor from '@/components/ui/markdown-editor';

interface Other {
  id: number;
  title: string;
  description: string;
  link?: string;
  item_type: string;
  markdown_content?: string;
  card_image?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function OthersManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOther, setEditingOther] = useState<Other | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    item_type: '',
    markdown_content: '',
    card_image: '',
    sort_order: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: others, isLoading } = useQuery({
    queryKey: ['admin-others'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('others')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Other[];
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link: '',
      item_type: '',
      markdown_content: '',
      card_image: '',
      sort_order: 0,
    });
    setEditingOther(null);
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Get the highest sort_order to append the new item at the end
      const { data: maxSortData, error: maxSortError } = await supabase
        .from('others')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      if (maxSortError) throw maxSortError;
      
      const nextSortOrder = maxSortData && maxSortData.length > 0 
        ? maxSortData[0].sort_order + 1 
        : 1;
      
      const otherData = {
        ...data,
        sort_order: nextSortOrder
      };
      
      const { error } = await supabase
        .from('others')
        .insert([otherData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-others'] });
      queryClient.invalidateQueries({ queryKey: ['others'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: 'Other item created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating item', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const { error } = await supabase
        .from('others')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-others'] });
      queryClient.invalidateQueries({ queryKey: ['others'] });
      queryClient.invalidateQueries({ queryKey: ['others'], exact: false });
      setIsDialogOpen(false);
      setEditingOther(null);
      resetForm();
      toast({ title: 'Other item updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating item', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // First, get the sort_order of the item being deleted
      const { data: otherData, error: otherError } = await supabase
        .from('others')
        .select('sort_order')
        .eq('id', id)
        .single();
      
      if (otherError) throw otherError;
      
      // Delete the item
      const { error: deleteError } = await supabase
        .from('others')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Get all items that come after the deleted one and update their sort_order
      const { data: othersToUpdate, error: fetchError } = await supabase
        .from('others')
        .select('id, sort_order')
        .gt('sort_order', otherData.sort_order)
        .order('sort_order', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      // Update each item's sort_order by decrementing by 1
      if (othersToUpdate && othersToUpdate.length > 0) {
        const updates = othersToUpdate.map(other => ({
          id: other.id,
          sort_order: other.sort_order - 1
        }));
        
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('others')
            .update({ sort_order: update.sort_order })
            .eq('id', update.id);
          
          if (updateError) throw updateError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-others'] });
      queryClient.invalidateQueries({ queryKey: ['others'] });
      toast({ title: 'Other item deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting item', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (other: Other) => {
    setEditingOther(other);
    setFormData({
      title: other.title,
      description: other.description,
      link: other.link || '',
      item_type: other.item_type,
      markdown_content: other.markdown_content || '',
      card_image: other.card_image || '',
      sort_order: other.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOther) {
      updateMutation.mutate({ id: editingOther.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };



  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'tool': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resource': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'tutorial': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'template': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'guide': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'library': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      case 'framework': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'plugin': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return <div>Loading other items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Others Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsReorderModalOpen(true)}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Reorder Others
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={resetForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add Other Item
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOther ? 'Edit Other Item' : 'Add New Other Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item_type">Type *</Label>
                  <Input
                    id="item_type"
                    value={formData.item_type}
                    onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                    placeholder="e.g., tool, resource, tutorial, template, etc."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card_image">Card Image URL (Optional)</Label>
                <Input
                  id="card_image"
                  type="url"
                  value={formData.card_image}
                  onChange={(e) => setFormData({ ...formData, card_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">Image URL to display in the card banner. If not provided, will attempt to extract from markdown content.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="markdown_content">Content (Markdown)</Label>
                <MarkdownEditor
                  value={formData.markdown_content}
                  onChange={(value) => setFormData({ ...formData, markdown_content: value })}
                  placeholder="Write your markdown content here... Supports headers, tables, code blocks, videos, images, and more!"
                />
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                  {editingOther 
                    ? `Current: ${editingOther.sort_order}`
                    : `Will be added as: ${(others?.length || 0) + 1}`
                  }
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingOther(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingOther ? 'Update' : 'Create'} Item
                </Button>
              </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {others?.map((other) => (
          <Card key={other.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {other.title}
                    <Badge className={`text-xs ${getTypeColor(other.item_type)}`}>
                      {other.item_type}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{other.description}</p>
                </div>
                <div className="flex gap-2">
                  {other.link && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={other.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="icon" onClick={() => handleEdit(other)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(other.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Position: {other.sort_order} | Created: {new Date(other.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Others Reorder Modal */}
      <OthersReorderManager 
        isOpen={isReorderModalOpen} 
        onClose={() => setIsReorderModalOpen(false)} 
      />
    </div>
  );
}