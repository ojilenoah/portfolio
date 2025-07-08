import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Other {
  id: number;
  title: string;
  sort_order: number;
  item_type: string;
}

interface OthersReorderManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OthersReorderManager({ isOpen, onClose }: OthersReorderManagerProps) {
  const [reorderedOthers, setReorderedOthers] = useState<Other[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: others, isLoading } = useQuery({
    queryKey: ['admin-others-reorder'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('others')
        .select('id, title, sort_order, item_type')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Other[];
    },
  });

  // Initialize reordered others when data loads
  useEffect(() => {
    if (others) {
      setReorderedOthers([...others]);
      setHasChanges(false);
    }
  }, [others]);

  const updateOrdersMutation = useMutation({
    mutationFn: async (othersToUpdate: Other[]) => {
      const updates = othersToUpdate.map((other, index) => ({
        id: other.id,
        sort_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('others')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-others'] });
      queryClient.invalidateQueries({ queryKey: ['admin-others-reorder'] });
      queryClient.invalidateQueries({ queryKey: ['others'] });
      setHasChanges(false);
      toast({ 
        title: 'Others order updated successfully',
        description: 'The item positions have been saved.'
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating others order', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const moveOther = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= reorderedOthers.length) return;
    
    const newOthers = [...reorderedOthers];
    const [movedOther] = newOthers.splice(fromIndex, 1);
    newOthers.splice(toIndex, 0, movedOther);
    
    setReorderedOthers(newOthers);
    setHasChanges(true);
  };

  const moveUp = (index: number) => {
    moveOther(index, index - 1);
  };

  const moveDown = (index: number) => {
    moveOther(index, index + 1);
  };

  const handleSave = () => {
    updateOrdersMutation.mutate(reorderedOthers);
  };

  const handleReset = () => {
    if (others) {
      setReorderedOthers([...others]);
      setHasChanges(false);
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading others...</div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reorder Others</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Use the arrow buttons to reorder others. Changes will reflect on the main site after saving.
            </p>
            
            <div className="flex gap-2">
              {hasChanges && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || updateOrdersMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateOrdersMutation.isPending ? 'Saving...' : 'Save Order'}
              </Button>
            </div>
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You have unsaved changes. Click "Save Order" to apply the new item positions.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading others...</div>
            </div>
          ) : (
            <div className="space-y-2">
              {reorderedOthers.map((other, index) => (
                <Card key={other.id} className="relative">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Position indicator */}
                      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-md">
                        <span className="text-sm font-mono">{index + 1}</span>
                      </div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate">{other.title}</h3>
                          <Badge className={`text-xs ${getTypeColor(other.item_type)}`}>
                            {other.item_type}
                          </Badge>
                        </div>
                      </div>

                      {/* Move buttons */}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveDown(index)}
                          disabled={index === reorderedOthers.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {reorderedOthers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No others found. Add some items first.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}