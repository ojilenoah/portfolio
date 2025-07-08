import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Download, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import OthersModal from '@/components/OthersModal';
import LinkPreview from '@/components/LinkPreview';

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

export default function OthersSection() {
  const [selectedOtherId, setSelectedOtherId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: others, isLoading } = useQuery({
    queryKey: ['others'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('others')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Other[];
    },
  });



  const handleOtherClick = (otherId: number) => {
    setSelectedOtherId(otherId);
    setIsModalOpen(true);
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

  const truncateDescription = (description: string, maxLines: number = 2) => {
    const words = description.split(' ');
    // Approximate 10-12 words per line for two lines
    const maxWords = maxLines * 12;
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return description;
  };

  if (isLoading) {
    return null; // Don't show loading state, just render nothing
  }

  if (!others || others.length === 0) {
    return null; // Don't render section if no items
  }

  return (
    <>
      <section className="mb-2 px-4 py-1">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 pt-2 scrollbar-hide">
            {others.map((other) => (
              <Card 
                key={other.id}
                className="w-[320px] h-[120px] cursor-pointer transition-all duration-200 flex-shrink-0 others-card-glow"
                onClick={() => handleOtherClick(other.id)}
              >
                <CardContent className="p-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base leading-tight line-clamp-1 flex-1 pr-2">{other.title}</h3>
                      <Badge className={`flex-shrink-0 text-xs ${getTypeColor(other.item_type)}`}>
                        {other.item_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {truncateDescription(other.description)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <OthersModal
        isOpen={isModalOpen}
        otherId={selectedOtherId}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOtherId(null);
        }}
      />
    </>
  );
}