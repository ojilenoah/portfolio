import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowUp, ArrowDown, Save, RotateCcw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Project {
  id: number;
  title: string;
  sort_order: number;
  image_url?: string;
}

interface ProjectReorderManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectReorderManager({ isOpen, onClose }: ProjectReorderManagerProps) {
  const [reorderedProjects, setReorderedProjects] = useState<Project[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects-reorder'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, sort_order, image_url')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Project[];
    },
  });

  // Initialize reordered projects when data loads
  useEffect(() => {
    if (projects) {
      setReorderedProjects([...projects]);
      setHasChanges(false);
    }
  }, [projects]);

  const updateOrdersMutation = useMutation({
    mutationFn: async (projectsToUpdate: Project[]) => {
      const updates = projectsToUpdate.map((project, index) => ({
        id: project.id,
        sort_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('projects')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects-reorder'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'featured'] });
      setHasChanges(false);
      toast({ 
        title: 'Project order updated successfully',
        description: 'The project positions have been saved.'
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating project order', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const moveProject = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= reorderedProjects.length) return;
    
    const newProjects = [...reorderedProjects];
    const [movedProject] = newProjects.splice(fromIndex, 1);
    newProjects.splice(toIndex, 0, movedProject);
    
    setReorderedProjects(newProjects);
    setHasChanges(true);
  };

  const moveUp = (index: number) => {
    moveProject(index, index - 1);
  };

  const moveDown = (index: number) => {
    moveProject(index, index + 1);
  };

  const handleSave = () => {
    updateOrdersMutation.mutate(reorderedProjects);
  };

  const handleReset = () => {
    if (projects) {
      setReorderedProjects([...projects]);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reorder Projects</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Use the arrow buttons to reorder projects. Changes will reflect on the main site after saving.
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
                You have unsaved changes. Click "Save Order" to apply the new project positions.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading projects...</div>
            </div>
          ) : (
            <div className="space-y-2">
              {reorderedProjects.map((project, index) => (
                <Card key={project.id} className="relative">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Position indicator */}
                      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-md">
                        <span className="text-sm font-mono">{index + 1}</span>
                      </div>

                      {/* Project image */}
                      <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        {project.image_url ? (
                          <img 
                            src={project.image_url} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900" />
                        )}
                      </div>

                      {/* Project title */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{project.title}</h3>
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
                          disabled={index === reorderedProjects.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {reorderedProjects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No projects found. Add some projects first.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}