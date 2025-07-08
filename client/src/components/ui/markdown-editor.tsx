import { useState } from 'react';
import { Textarea } from './textarea';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Eye, Edit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Write your markdown content here..."}
            className="min-h-[300px] font-mono"
            rows={15}
          />
          <div className="mt-2 text-xs text-muted-foreground">
            Supports GitHub Flavored Markdown: **bold**, *italic*, `code`, tables, links, images, videos, and more!
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <div className="min-h-[300px] border rounded-md p-4 bg-background">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="text-muted-foreground italic">Nothing to preview yet. Start writing in the Edit tab!</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          img({ src, alt, ...props }: any) {
            // Special handling for GitHub profile badges and shields
            if (src && (src.includes('komarev.com') || src.includes('shields.io') || src.includes('img.shields.io'))) {
              return (
                <img 
                  src={src} 
                  alt={alt} 
                  className="inline-block mx-1 my-1"
                  loading="lazy"
                  {...props}
                />
              );
            }
            
            // Regular images
            return (
              <img 
                src={src} 
                alt={alt} 
                className="rounded-lg max-w-full h-auto my-4"
                loading="lazy"
                {...props}
              />
            );
          },
          a({ href, children, ...props }: any) {
            // Enhanced link detection - check for Instagram, YouTube, Vimeo, and other embeddable content
            if (href && (
              href.includes('youtube.com') || 
              href.includes('youtu.be') || 
              href.includes('vimeo.com') ||
              href.includes('instagram.com')
            )) {
              return <VideoEmbed url={href} title={children} />;
            }
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
          table({ children, ...props }: any) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="border-collapse border border-gray-300 dark:border-gray-700 w-full" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }: any) {
            return (
              <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left" {...props}>
                {children}
              </th>
            );
          },
          td({ children, ...props }: any) {
            return (
              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props}>
                {children}
              </td>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function VideoEmbed({ url, title }: { url: string; title: any }) {
  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop()?.split('?')[0]
        : new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Instagram posts/reels - Enhanced detection
    if (url.includes('instagram.com')) {
      // Match various Instagram URL patterns
      const postMatch = url.match(/\/p\/([A-Za-z0-9_-]+)|\/reel\/([A-Za-z0-9_-]+)|\/tv\/([A-Za-z0-9_-]+)/);
      if (postMatch) {
        const postId = postMatch[1] || postMatch[2] || postMatch[3];
        // Use the proper Instagram embed URL format
        return `https://www.instagram.com/p/${postId}/embed/`;
      }
      
      // Handle URLs with query parameters (like your example)
      const urlWithoutQuery = url.split('?')[0];
      const simpleMatch = urlWithoutQuery.match(/\/p\/([A-Za-z0-9_-]+)|\/reel\/([A-Za-z0-9_-]+)/);
      if (simpleMatch) {
        const postId = simpleMatch[1] || simpleMatch[2];
        return `https://www.instagram.com/p/${postId}/embed/`;
      }
    }
    
    return null;
  };

  const embedUrl = getEmbedUrl(url);
  
  // Handle Instagram embeds separately (different aspect ratio)
  if (embedUrl && url.includes('instagram.com')) {
    return (
      <div className="my-4 flex justify-center">
        <div className="w-full max-w-md">
          <iframe
            src={embedUrl}
            width="400"
            height="480"
            title={String(title)}
            className="rounded-lg border-0"
            frameBorder="0"
            scrolling="no"
            allowTransparency={true}
          />
        </div>
      </div>
    );
  }
  
  // Handle webpage screenshots for regular links
  if (!embedUrl) {
    const isWebpage = url.startsWith('http') && !url.includes('instagram.com');
    
    if (isWebpage) {
      // Multiple screenshot services as fallbacks (free options)
      const screenshotServices = [
        `https://mini.s-shot.ru/1024x768/PNG/1024/Z100/?${encodeURIComponent(url)}`,
        `https://webshot.deam.io/${encodeURIComponent(url)}/?width=1200&height=800`,
        `https://api.thumbnail.ws/api/capture?url=${encodeURIComponent(url)}&width=1200`
      ];
      
      // Special handling for Medium articles
      if (url.includes('medium.com') || url.includes('towardsdatascience.com')) {
        return (
          <div className="my-4 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <img 
              src={screenshotServices[0]}
              alt={`Medium article: ${title}`}
              className="w-full h-auto"
              onError={(e) => {
                // Try next service
                const target = e.target as HTMLImageElement;
                const currentSrc = target.src;
                const currentIndex = screenshotServices.findIndex(s => s === currentSrc);
                if (currentIndex < screenshotServices.length - 1) {
                  target.src = screenshotServices[currentIndex + 1];
                } else {
                  target.style.display = 'none';
                  const fallback = target.nextSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }
              }}
            />
            <div className="p-4 bg-green-50 dark:bg-green-900/30" style={{ display: 'none' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Medium Article</span>
              </div>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:underline font-medium"
              >
                {title} →
              </a>
            </div>
          </div>
        );
      }
      
      // Regular webpage screenshot
      return (
        <div className="my-4 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          <img 
            src={screenshotServices[0]}
            alt={`Screenshot of ${title}`}
            className="w-full h-auto"
            onError={(e) => {
              // Try next service
              const target = e.target as HTMLImageElement;
              const currentSrc = target.src;
              const currentIndex = screenshotServices.findIndex(s => s === currentSrc);
              if (currentIndex < screenshotServices.length - 1) {
                target.src = screenshotServices[currentIndex + 1];
              } else {
                target.style.display = 'none';
                const fallback = target.nextSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }
            }}
          />
          <div className="p-4 bg-gray-50 dark:bg-gray-800" style={{ display: 'none' }}>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {title} →
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        {title}
      </a>
    );
  }

  return (
    <div className="my-4">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={String(title)}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}