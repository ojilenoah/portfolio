import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, Download, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { MarkdownRenderer } from '@/components/ui/markdown-editor';

interface OthersModalProps {
  isOpen: boolean;
  otherId: number | null;
  onClose: () => void;
}

interface Other {
  id: number;
  title: string;
  description: string;
  link?: string;
  item_type: string;
  markdown_content?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function OthersModal({ isOpen, otherId, onClose }: OthersModalProps) {
  const { data: other, isLoading } = useQuery({
    queryKey: ['others', otherId],
    queryFn: async () => {
      if (!otherId) return null;
      
      const { data, error } = await supabase
        .from('others')
        .select('*')
        .eq('id', otherId)
        .single();
      
      if (error) throw error;
      return data as Other;
    },
    enabled: !!otherId,
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);



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



  if (!isOpen || !other) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {other.title}
              <Badge className={`text-xs ${getTypeColor(other.item_type)}`}>
                {other.item_type}
              </Badge>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Markdown Content */}
          {other.markdown_content && other.markdown_content.trim() ? (
            <MarkdownRenderer content={other.markdown_content} />
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {other.description}
              </p>
              {other.link && (
                <div className="mt-4">
                  <Button asChild>
                    <a
                      href={other.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Link
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}