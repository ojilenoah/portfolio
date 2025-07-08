// Link preview utility functions
export interface LinkPreview {
  type: 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'linkedin' | 'medium' | 'github' | 'pdf' | 'audio' | 'app' | 'generic';
  title?: string;
  description?: string;
  image?: string;
  embedUrl?: string;
  originalUrl: string;
  platform?: string;
  isPlayable?: boolean;
  mediaType?: 'video' | 'audio' | 'document' | 'app' | 'social' | 'article' | 'code';
  category?: string;
}

export const detectLinkType = (url: string): LinkPreview['type'] => {
  if (!url) return 'generic';
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    
    // Video platforms
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'youtube';
    if (domain.includes('vimeo.com')) return 'vimeo';
    
    // Social media
    if (domain.includes('twitter.com') || domain.includes('x.com')) return 'twitter';
    if (domain.includes('instagram.com')) return 'instagram';
    if (domain.includes('linkedin.com')) return 'linkedin';
    
    // Content platforms
    if (domain.includes('medium.com')) return 'medium';
    if (domain.includes('github.com')) return 'github';
    
    // File types
    if (pathname.endsWith('.pdf')) return 'pdf';
    if (pathname.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/)) return 'audio';
    
    // App stores
    if (domain.includes('play.google.com') || domain.includes('apps.apple.com') || domain.includes('microsoft.com')) return 'app';
    
    return 'generic';
  } catch {
    return 'generic';
  }
};

export const extractVideoId = (url: string): { id: string; platform: 'youtube' | 'vimeo' } | null => {
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  const vimeoPatterns = [
    /vimeo\.com\/(?:video\/)?(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ];
  
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) return { id: match[1], platform: 'youtube' };
  }
  
  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match) return { id: match[1], platform: 'vimeo' };
  }
  
  return null;
};

export const getVideoEmbedUrl = (url: string): string | null => {
  const video = extractVideoId(url);
  if (!video) return null;
  
  if (video.platform === 'youtube') {
    return `https://www.youtube.com/embed/${video.id}`;
  } else if (video.platform === 'vimeo') {
    return `https://player.vimeo.com/video/${video.id}`;
  }
  
  return null;
};

export const getVideoThumbnail = (url: string): string | null => {
  const video = extractVideoId(url);
  if (!video) return null;
  
  if (video.platform === 'youtube') {
    return `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
  } else if (video.platform === 'vimeo') {
    // Vimeo thumbnails require API call, return placeholder
    return `https://vumbnail.com/${video.id}.jpg`;
  }
  
  return null;
};

export const generateLinkPreview = (url: string, title?: string, description?: string, itemType?: string): LinkPreview => {
  // Handle case where no URL is provided
  if (!url || url === '#') {
    return {
      type: 'generic',
      originalUrl: url || '#',
      title: title || 'Untitled',
      description: description || '',
      category: itemType || 'other',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHA="',
      mediaType: 'article',
      isPlayable: false
    };
  }

  const type = detectLinkType(url);
  
  const preview: LinkPreview = {
    type,
    originalUrl: url,
    title: title || getDefaultTitle(type, url),
    description: description || getDefaultDescription(type),
    category: itemType || 'other'
  };
  
  // Add platform-specific data
  switch (type) {
    case 'youtube':
    case 'vimeo':
      preview.embedUrl = getVideoEmbedUrl(url);
      preview.image = getVideoThumbnail(url);
      preview.isPlayable = true;
      preview.mediaType = 'video';
      break;
      
    case 'twitter':
      preview.image = getTwitterEmbedPreview(url);
      preview.mediaType = 'social';
      preview.platform = 'Twitter/X';
      break;
      
    case 'instagram':
      preview.image = getInstagramEmbedPreview(url);
      preview.embedUrl = getInstagramEmbedUrl(url);
      preview.isPlayable = true;
      preview.mediaType = 'social';
      preview.platform = 'Instagram';
      break;
      
    case 'linkedin':
      preview.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgOGE2IDYgMCAwIDEgNiA2djdoLTR2LTdhMiAyIDAgMCAwLTItMiAyIDIgMCAwIDAtMiAydjdoLTR2LTdhNiA2IDAgMCAxIDYtNnoiIGZpbGw9IiMwMDc3YjUiLz48cmVjdCB4PSIyIiB5PSI5IiB3aWR0aD0iNCIgaGVpZ2h0PSIxMiIgZmlsbD0iIzAwNzdiNSIvPjxjaXJjbGUgY3g9IjQiIGN5PSI0IiByPSIyIiBmaWxsPSIjMDA3N2I1Ii8+PC9zdmc+';
      preview.mediaType = 'social';
      preview.platform = 'LinkedIn';
      break;
      
    case 'medium':
      preview.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI3IiBjeT0iMTIiIHI9IjciIGZpbGw9IiMxYWExNDQiLz48ZWxsaXBzZSBjeD0iMTgiIGN5PSIxMiIgcng9IjMiIHJ5PSI3IiBmaWxsPSIjMWFhMTQ0Ii8+PGVsbGlwc2UgY3g9IjIxLjUiIGN5PSIxMiIgcng9IjEuNSIgcnk9IjciIGZpbGw9IiMxYWExNDQiLz48L3N2Zz4=';
      preview.mediaType = 'article';
      preview.platform = 'Medium';
      break;
      
    case 'github':
      preview.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOSAxOWMtNSAxLjUtNS0yLjUtNy0zbTE0IDZ2LTMuODdhMy4zNyAzLjM3IDAgMCAwLS45NC0yLjYxYzMuMTQtLjM1IDYuNDQtMS41NCA2LjQ0LTdsQTUuNDQgNS40NCAwIDAgMCAyMCAzLjc2IDUuMDcgNS4wNyAwIDAgMCAxOS45MSAyLjVzLS43NC0uMTgtMi4wMy44NmMtMS4xOS0uMzItMi41Ni0uMzItMy43NSAwQzEyLjA5IDEuOTIgMTEuMjIgMiAxMS4yMiAyYTUuMDggNS4wOCAwIDAgMC0xLjM2IDMuNjQgNS40NCA1LjQ0IDAgMCAwLTEuNDcgMy44NGMwIDUuNDEgMy4yNyA2LjY0IDYuMzkgN2EzLjM3IDMuMzcgMCAwIDAtLjk0IDIuNTggdjMuODciIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=';
      preview.mediaType = 'code';
      preview.platform = 'GitHub';
      break;
      
    case 'pdf':
      preview.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMmg0YTIgMiAwIDAgMSAyIDJ2MTZhMiAyIDAgMCAxLTIgMkg2YTIgMiAwIDAgMS0yLTJWNGEyIDIgMCAwIDEgMi0yaDgiLz48cGF0aCBkPSJNMTQgMnY2aDYiLz48cGF0aCBkPSJNMTYgMTN2Ni00aDIuNXYtNGgtMi41eiIgZmlsbD0iI2ZmMDAwMCIvPjwvc3ZnPg==';
      preview.mediaType = 'document';
      break;
      
    case 'audio':
      preview.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtOSAxOGgzdjVoLTN6bTMtMnY0aDJ2LTRIN2gybTktNnYyYzAgMS4xLS45IDItMiAycy0yLS45LTItMmMwLTEuMS45LTIgMi0yczIgLjkgMiAyeiIgZmlsbD0iIzEwYjk4MSIvPjxwYXRoIGQ9Ik0zIDEwdjRjMCAxLjEuOSAyIDIgMnMyLS45IDItMnYtNGMwLTEuMS0uOS0yLTItMnMtMiAuOS0yIDJ6IiBmaWxsPSIjMTBiOTgxIi8+PC9zdmc+';
      preview.isPlayable = true;
      preview.mediaType = 'audio';
      break;
      
    case 'app':
      preview.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI1IiB5PSIyIiB3aWR0aD0iMTQiIGhlaWdodD0iMjAiIHJ4PSIyIiByeT0iMiIgZmlsbD0iIzMzNzNkYyIvPjxwYXRoIGQ9Im0xMiA2IDAgMTIiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';
      preview.mediaType = 'app';
      break;
      
    default:
      preview.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHA="';
      preview.mediaType = 'article';
      break;
  }
  
  return preview;
};

const getDefaultTitle = (type: LinkPreview['type'], url: string): string => {
  switch (type) {
    case 'youtube':
      return 'YouTube Video';
    case 'vimeo':
      return 'Vimeo Video';
    case 'twitter':
      return 'Twitter Post';
    case 'instagram':
      return 'Instagram Post';
    case 'linkedin':
      return 'LinkedIn Post';
    case 'medium':
      return 'Medium Article';
    case 'github':
      return 'GitHub Repository';
    default:
      try {
        const domain = new URL(url).hostname;
        return `Link to ${domain}`;
      } catch {
        return 'External Link';
      }
  }
};

const getDefaultDescription = (type: LinkPreview['type']): string => {
  switch (type) {
    case 'youtube':
    case 'vimeo':
      return 'Click to watch video';
    case 'twitter':
      return 'View post on Twitter/X';
    case 'instagram':
      return 'View post on Instagram';
    case 'linkedin':
      return 'View post on LinkedIn';
    case 'medium':
      return 'Read article on Medium';
    case 'github':
      return 'View repository on GitHub';
    default:
      return 'Click to visit link';
  }
};

export const getInstagramEmbedUrl = (url: string): string | null => {
  try {
    // Convert Instagram URL to embed URL
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('instagram.com')) {
      // Extract post ID from URL patterns like /p/PostID/ or /reel/ReelID/
      const match = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
      if (match) {
        return `https://www.instagram.com/${match[1]}/${match[2]}/embed/`;
      }
    }
    return null;
  } catch {
    return null;
  }
};

export const getInstagramEmbedPreview = (url: string): string => {
  // For Instagram, we'll use a placeholder that indicates it's a real post
  // In a real app, you'd use Instagram's oEmbed API
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHJ4PSI1IiByeT0iNSIgc3Ryb2tlPSIjZTA0ZjU3IiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJtOSA5IDMgM0w5IDE1IiBmaWxsPSIjZTA0ZjU3Ii8+PC9zdmc+';
};

export const getTwitterEmbedPreview = (url: string): string => {
  // For Twitter, we'll use a placeholder that indicates it's a real tweet
  // In a real app, you'd use Twitter's oEmbed API
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjMgM2EuNzMuNzMgMCAwIDEtLjY1LjEzIDEuMDQgMS4wNCAwIDAgMS0uMTQtLjEzQzE5LjY3IDUuNSAxOCA4IDE4IDh2MmMwIDcuNS02IDEzLTIyIDEzUzIgMTcuNSAyIDEwVjguNTZjMC0xIDEuNzUtMS41IDUuMDItLjVBNy4yNCA3LjI0IDAgMCAwIDcgOFY2czItMi41IDUtNS41YTIuNzMgMi43MyAwIDAgMSAzLjU3LS4yQy0uNDMtLjMgMTUuNS0uMyAxNy42NyAwYTcuOCA3LjggMCAwIDEgNSAzeiIgZmlsbD0iIzFkYTFmMiIvPjwvc3ZnPg==';
};

export const getPlatformIcon = (type: LinkPreview['type']): string => {
  switch (type) {
    case 'youtube':
      return '🎥';
    case 'vimeo':
      return '🎬';
    case 'twitter':
      return '🐦';
    case 'instagram':
      return '📸';
    case 'linkedin':
      return '💼';
    case 'medium':
      return '📝';
    case 'github':
      return '💻';
    case 'pdf':
      return '📄';
    case 'audio':
      return '🎵';
    case 'app':
      return '📱';
    default:
      return '🔗';
  }
};