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
import { Plus, Edit, Trash2, ExternalLink, Eye, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import ProjectReorderManager from './ProjectReorderManager';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string;
  link?: string;
  download_url?: string;
  image_url?: string;
  video_url?: string;
  project_type: 'web' | 'mobile' | 'desktop';
  is_featured: boolean;
  sort_order: number;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export default function ProjectsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    link: '',
    download_url: '',
    image_url: '',
    video_url: '',
    project_type: 'web' as 'web' | 'mobile' | 'desktop',
    is_featured: false,
    sort_order: 0,
    status: 'active' as 'active' | 'draft' | 'archived',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Project[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Get the highest sort_order to append the new project at the end
      const { data: maxSortData, error: maxSortError } = await supabase
        .from('projects')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      if (maxSortError) throw maxSortError;
      
      const nextSortOrder = maxSortData && maxSortData.length > 0 
        ? maxSortData[0].sort_order + 1 
        : 1;
      
      const projectData = {
        ...data,
        sort_order: nextSortOrder
      };
      
      const { error } = await supabase
        .from('projects')
        .insert([projectData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'featured'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: 'Project created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating project', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const { error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'featured'] });
      // Invalidate all individual project queries
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false });
      setIsDialogOpen(false);
      setEditingProject(null);
      resetForm();
      toast({ title: 'Project updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating project', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Starting deletion of project ID:', id);
      
      // First, get the sort_order of the project being deleted
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('sort_order')
        .eq('id', id)
        .single();
      
      if (projectError) {
        console.error('Error fetching project data:', projectError);
        throw projectError;
      }
      
      console.log('Project to delete has sort_order:', projectData.sort_order);
      
      // Delete the project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error deleting project:', deleteError);
        throw deleteError;
      }
      
      console.log('Project deleted successfully');
      
      // Get all projects that come after the deleted one and update their sort_order
      const { data: projectsToUpdate, error: fetchError } = await supabase
        .from('projects')
        .select('id, sort_order')
        .gt('sort_order', projectData.sort_order)
        .order('sort_order', { ascending: true });
      
      if (fetchError) {
        console.error('Error fetching projects to update:', fetchError);
        throw fetchError;
      }
      
      console.log('Projects to update:', projectsToUpdate);
      
      // Update each project's sort_order by decrementing by 1
      if (projectsToUpdate && projectsToUpdate.length > 0) {
        const updates = projectsToUpdate.map(project => ({
          id: project.id,
          sort_order: project.sort_order - 1
        }));
        
        console.log('Updating sort orders:', updates);
        
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('projects')
            .update({ sort_order: update.sort_order })
            .eq('id', update.id);
          
          if (updateError) {
            console.error('Error updating project sort_order:', updateError);
            throw updateError;
          }
        }
        
        console.log('All sort orders updated successfully');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'featured'] });
      toast({ title: 'Project deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting project', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      technologies: '',
      link: '',
      download_url: '',
      image_url: '',
      video_url: '',
      project_type: 'web' as 'web' | 'mobile' | 'desktop',
      is_featured: false,
      sort_order: 0,
      status: 'active' as 'active' | 'draft' | 'archived',
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      link: project.link || '',
      download_url: project.download_url || '',
      image_url: project.image_url || '',
      video_url: project.video_url || '',
      project_type: project.project_type,
      is_featured: project.is_featured,
      sort_order: project.sort_order,
      status: project.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id);
    }
  };

  const parseTechnologies = (techString: string) => {
    try {
      return JSON.parse(techString);
    } catch {
      return techString.split(',').map(t => t.trim());
    }
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsReorderModalOpen(true)}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Reorder Projects
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={resetForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
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
                  <Label htmlFor="project_type">Type</Label>
                  <Select value={formData.project_type} onValueChange={(value: any) => setFormData({ ...formData, project_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="technologies">Technologies (JSON array format) *</Label>
                <Textarea
                  id="technologies"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder='["React", "TypeScript", "Node.js"]'
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link">Project Link</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="download_url">Download URL</Label>
                  <Input
                    id="download_url"
                    type="url"
                    value={formData.download_url}
                    onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                    {editingProject 
                      ? `Current: ${editingProject.sort_order}`
                      : `Will be added as: ${(projects?.length || 0) + 1}`
                    }
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProject(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProject ? 'Update' : 'Create'} Project
                </Button>
              </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {projects?.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {project.title}
                    {project.is_featured && <Badge variant="secondary">Featured</Badge>}
                    <Badge variant="outline">{project.status}</Badge>
                    <Badge variant="default">{project.project_type}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                </div>
                <div className="flex gap-2">
                  {project.link && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="icon" onClick={() => handleEdit(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-2">
                {parseTechnologies(project.technologies).map((tech: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Position: {project.sort_order} | Created: {new Date(project.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Reorder Modal */}
      <ProjectReorderManager 
        isOpen={isReorderModalOpen} 
        onClose={() => setIsReorderModalOpen(false)} 
      />
    </div>
  );
}