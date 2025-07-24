import { useState, useEffect } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateLinkPreview, LinkPreview as LinkPreviewType, getPlatformIcon } from '@/utils/linkPreview';

interface LinkPreviewProps {
  url: string;
  title?: string;
  description?: string;
  className?: string;
  showFullPreview?: boolean;
  itemType?: string;
  markdownContent?: string;
}

export default function LinkPreview({ 
  url, 
  title, 
  description, 
  className = '',
  showFullPreview = false,
  itemType = 'other',
  markdownContent
}: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewType | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (url || markdownContent) {
      const linkPreview = generateLinkPreview(url, title, description, itemType, markdownContent);
      setPreview(linkPreview);
    }
  }, [url, title, description, itemType, markdownContent]);

  if (!preview) return null;

  const handleImageError = () => {
    setImageError(true);
  };

  const isVideo = preview.type === 'youtube' || preview.type === 'vimeo';
  const isPlayable = preview.isPlayable || false;
  const hasImage = preview.image && !imageError;

  if (showFullPreview) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          {/* Media Embed for Full Preview */}
          {isPlayable && preview.embedUrl ? (
            <div className={`${preview.type === 'instagram' ? 'aspect-square' : 'aspect-video'} bg-black`}>
              <iframe
                src={preview.embedUrl}
                title={preview.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : hasImage ? (
            <div className="relative group">
              <img
                src={preview.image}
                alt={preview.title}
                className="w-full h-48 object-cover"
                onError={handleImageError}
              />
              {isPlayable && !showFullPreview && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                  <Play className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">{getPlatformIcon(preview.type)}</div>
                <div className="text-sm text-muted-foreground">{preview.platform || 'External Link'}</div>
              </div>
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{preview.title}</h3>
                {preview.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{preview.description}</p>
                )}
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {preview.category}
              </Badge>
            </div>
            
            {!isPlayable && preview.originalUrl && preview.originalUrl !== '#' && (
              <Button 
                asChild 
                size="sm" 
                className="w-full mt-3"
                variant="outline"
              >
                <a
                  href={preview.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Link
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact preview for cards - just the banner image
  return (
    <div className={`overflow-hidden ${className} h-full w-full`}>
      {hasImage ? (
        <div className="relative h-full w-full">
          <img
            src={preview.image}
            alt={preview.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          {isPlayable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/30 transition-colors">
              <Play className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-1">{getPlatformIcon(preview.type)}</div>
            <div className="text-xs text-muted-foreground">{preview.platform || preview.type}</div>
          </div>
        </div>
      )}
    </div>
  );
}