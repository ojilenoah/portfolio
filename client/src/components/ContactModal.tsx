import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { FaEnvelope, FaPhoneAlt, FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useCreateContact } from "../hooks/use-portfolio-data";

import { z } from "zod";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

// Custom DialogContent without the default close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
CustomDialogContent.displayName = "CustomDialogContent";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [copy, isCopied] = useCopyToClipboard();
  const { toast } = useToast();
  
  const contactMutation = useCreateContact();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate the form data
      contactFormSchema.parse(formData);
      
      // Submit form
      contactMutation.mutate(formData, {
        onSuccess: () => {
          setIsSubmitted(true);
          toast({
            title: "Message sent successfully!",
            description: "Thank you for your message. I'll get back to you soon.",
          });
        },
        onError: (error) => {
          toast({
            title: "Failed to send message",
            description: "Please try again later or contact me directly.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map(err => `${err.message}`).join(", ");
        toast({
          title: "Validation Error",
          description: fieldErrors,
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyText = (text: string, label: string) => {
    copy(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to clipboard`,
    });
  };

  const resetAndClose = () => {
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <CustomDialogContent className="bg-modalBg border border-neonGreen/20 text-foreground max-w-md p-0 card-rounded">
        <div className="border-b border-neonGreen/10 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2">{isSubmitted ? "✅" : "📨"}</span>
            <DialogTitle className="text-base font-sequel theme-text-primary">
              {isSubmitted ? "MESSAGE SENT!" : "CONTACT"}
            </DialogTitle>
          </div>
          <DialogClose asChild>
            <button 
              onClick={resetAndClose} 
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
          </DialogClose>
        </div>
        
        <div className="p-4">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-xs font-sequel mb-1 theme-text-primary">NAME</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-background border border-neonGreen/20 text-foreground w-full p-1.5 text-xs font-mono card-rounded focus:border-neonGreen/50 focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-sequel mb-1 theme-text-primary">EMAIL</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-background border border-neonGreen/20 text-foreground w-full p-1.5 text-xs font-mono card-rounded focus:border-neonGreen/50 focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-sequel mb-1 theme-text-primary">MESSAGE</label>
                <textarea 
                  id="message" 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3} 
                  className="bg-background border border-neonGreen/20 text-foreground w-full p-1.5 text-xs font-mono card-rounded focus:border-neonGreen/50 focus:outline-none" 
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-neonGreen/10 hover:bg-neonGreen/20 text-foreground border border-neonGreen/30 text-xs font-sequel py-1.5 transition-all duration-300 card-rounded"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-sequel mb-2 theme-text-primary">Message Sent Successfully!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Thank you for reaching out. I'll get back to you as soon as possible.
              </p>
              <button 
                onClick={resetAndClose}
                className="bg-neonGreen/10 hover:bg-neonGreen/20 text-foreground border border-neonGreen/30 text-xs font-sequel py-2 px-4 transition-all duration-300 card-rounded"
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          )}
          
          {!isSubmitted && (
            <div className="mt-4 pt-3 border-t border-neonGreen/10">
            <p className="text-xs mb-2 theme-text-primary font-sequel">// DIRECT CONTACT</p>
            <div 
              className="flex items-center mb-2 text-xs font-mono cursor-pointer hover:opacity-80 transition-opacity group theme-text-primary"
              onClick={() => handleCopyText("noahojile04@gmail.com", "Email")}
            >
              <FaEnvelope className="mr-2 theme-text-primary" />
              <span className="group-hover:underline">noahojile04@gmail.com</span>
            </div>
            <div 
              className="flex items-center mb-3 text-xs font-mono cursor-pointer hover:opacity-80 transition-opacity group theme-text-primary"
              onClick={() => handleCopyText("+2349125378893", "Phone")}
            >
              <FaPhoneAlt className="mr-2 theme-text-primary" />
              <span className="group-hover:underline">+2349125378893</span>
            </div>
            <div className="flex space-x-4 border-t border-neonGreen/10 pt-2">
              <a 
                href="https://github.com/ojilenoah" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="opacity-50 hover:opacity-100 transition-opacity"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a 
                href="https://www.instagram.com/0xno4h/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a 
                href="https://x.com/oxno4h" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="opacity-50 hover:opacity-100 transition-opacity"
                aria-label="X (Twitter)"
              >
                <FaXTwitter />
              </a>
            </div>
          </div>
          )}
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
