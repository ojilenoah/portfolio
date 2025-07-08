import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const handleOpenInNewTab = () => {
    window.open('/', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Portfolio Preview</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 border rounded-lg overflow-hidden">
          <iframe
            src="/"
            className="w-full h-full"
            title="Portfolio Preview"
            style={{ minHeight: '70vh' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}