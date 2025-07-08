import { FaEnvelope } from "react-icons/fa";

interface ContactButtonProps {
  onClick: () => void;
}

export default function ContactButton({ onClick }: ContactButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="bg-accent/10 hover:bg-accent/15 text-foreground border border-accent/40 flex items-center justify-center py-3 w-full transition-all duration-300 rounded-md shadow-sm hover:shadow-md"
      style={{
        borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.4))'
      }}
    >
      <FaEnvelope className="mr-2 text-accent" />
      <span className="font-bold tracking-wide">CONTACT ME</span>
    </button>
  );
}
