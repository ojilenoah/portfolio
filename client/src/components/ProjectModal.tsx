import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProject } from "@/hooks/use-portfolio-data";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function to convert YouTube URLs to embeddable format
const getEmbeddableVideoUrl = (url: string): string | null => {
  if (!url) return null;
  
  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  // Vimeo URL patterns
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // If it's already an embed URL, return as is
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return url;
  }
  
  return null;
};

interface ProjectModalProps {
  isOpen: boolean;
  projectId: number | null;
  onClose: () => void;
}

export default function ProjectModal({ isOpen, projectId, onClose }: ProjectModalProps) {
  // Get project details from Supabase
  const { data: project, isLoading, error } = useProject(projectId || 0);
  
  // Use ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  
  if (!isOpen || !projectId) return null;
  
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (error || !project) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Project not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Parse technologies from JSON string
  const technologies = (() => {
    try {
      return typeof project.technologies === 'string' 
        ? JSON.parse(project.technologies) 
        : project.technologies;
    } catch {
      return typeof project.technologies === 'string' 
        ? project.technologies.split(',').map(t => t.trim()) 
        : [];
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{project.title}</DialogTitle>
        </DialogHeader>

        {/* Project content */}
        <div className="space-y-4">
          {/* Project image if available */}
          {project.imageUrl && (
            <div className="w-full rounded-lg overflow-hidden">
              <img 
                src={project.imageUrl} 
                alt={project.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Project video if available */}
          {project.videoUrl && getEmbeddableVideoUrl(project.videoUrl) && (
            <div className="w-full rounded-lg overflow-hidden">
              <iframe
                src={getEmbeddableVideoUrl(project.videoUrl)!}
                title={`${project.title} Video`}
                className="w-full h-64"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Technologies */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Project Type and Status */}
          {(project.type || project.status) && (
            <div className="flex gap-4">
              {project.type && (
                <div>
                  <h3 className="font-semibold text-sm mb-1">Type</h3>
                  <span className="px-2 py-1 text-xs rounded-md bg-secondary/50 text-secondary-foreground capitalize">
                    {project.type}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            {project.link && (
              <Button asChild className="flex-1">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Project
                </a>
              </Button>
            )}
            {project.downloadUrl && (
              <Button variant="secondary" asChild className="flex-1">
                <a
                  href={project.downloadUrl}
                  download
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}