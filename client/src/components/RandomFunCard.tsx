import { useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { useRandomFunFact } from "../hooks/use-portfolio-data";

export default function RandomFunCard() {
  const [fact, setFact] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const { refetch, data: funFactData, isLoading, error } = useRandomFunFact();

  // Initialize with the first random fact from database
  useEffect(() => {
    if (funFactData) {
      setFact(funFactData);
    }
  }, [funFactData]);

  const getNewFact = async () => {
    if (isAnimating || isLoading) return;
    
    setIsAnimating(true);
    
    // Fade out, get new fact, fade in
    setTimeout(async () => {
      try {
        const result = await refetch();
        if (result.data) {
          setFact(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch new fun fact:', err);
      }
      setTimeout(() => setIsAnimating(false), 300);
    }, 300);
  };

  if (error || (!isLoading && !fact)) {
    return (
      <div className="bg-cardBg p-0 h-full border border-accent/20 card-rounded flex items-center justify-center">
        <p className="text-xs font-mono text-secondary">Failed to load</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-cardBg p-0 h-full overflow-hidden border border-accent/20 card-rounded"
      style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}
    >
      <div 
        className="flex items-center px-4 py-2 border-b"
        style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}>
        <h2 className="text-base font-sequel theme-text-primary">FUN FACT</h2>
      </div>
      
      <div className="p-4 flex flex-col h-[calc(100%-38px)]">
        <div 
          className="border p-3 mb-3 flex-grow card-rounded"
          style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.3))' }}>
          <p 
            className={`text-xs font-mono transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
          >
            <span className="theme-text-primary">❯</span> {fact}
          </p>
        </div>
        
        <button 
          onClick={getNewFact}
          className="text-[10px] font-sequel bg-accent/10 hover:bg-accent/15 text-foreground flex items-center justify-center w-full py-1.5 transition-colors card-rounded border border-accent/40"
          style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.4))' }}
        >
          <FaSyncAlt className="mr-1 theme-text-primary" /> NEW FACT
        </button>
      </div>
    </div>
  );
}
