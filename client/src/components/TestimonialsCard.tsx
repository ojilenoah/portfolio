import { FaQuoteLeft } from "react-icons/fa";
import { HelpCircle } from "lucide-react";
import { useState } from "react";

// Interface for testimonial items
interface Testimonial {
  name: string;
  occupation: string;
  text: string;
}

// Mobile height adjustments for the testimonial card
const TESTIMONIAL_ROW_HEIGHT = "95px";

// Authentic testimonials from Nigerian students
import { useTestimonials, useFunFacts } from "../hooks/use-portfolio-data";

// TestimonialItem for horizontal scrolling
const TestimonialItem = ({ name, occupation, text, compact = false }: Testimonial & { compact?: boolean }) => {
  return (
    <div 
      className={`testimonial-item mx-2 px-3 py-2 border border-accent/20 rounded-lg bg-accent/5 whitespace-normal`}
      style={{ 
        width: '300px', 
        height: TESTIMONIAL_ROW_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <div className="flex items-center">
        <FaQuoteLeft className="text-accent mr-1 text-xs" />
        <div>
          <p className="text-xs font-mono font-bold theme-text-primary">
            {name} <span className="font-normal text-secondary">• {occupation}</span>
          </p>
        </div>
      </div>
      <div className="text-xs theme-text-primary mt-1">
        <p className="line-clamp-3">{text}</p>
      </div>
    </div>
  );
};

// FunFactItem for horizontal scrolling
const FunFactItem = ({ fact_text }: { fact_text: string }) => {
  return (
    <div 
      className={`testimonial-item mx-2 px-3 py-2 border border-accent/20 rounded-lg bg-accent/5 whitespace-normal`}
      style={{ 
        width: '300px', 
        height: TESTIMONIAL_ROW_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <div className="flex items-center">
        <span className="text-accent mr-2 text-lg">💡</span>
        <p className="text-xs font-mono text-secondary line-clamp-3">{fact_text}</p>
      </div>
    </div>
  );
};

interface TestimonialsCardProps {
  inGrid?: boolean;
}

export default function TestimonialsCard({ inGrid = false }: TestimonialsCardProps) {
  const [showFunFacts, setShowFunFacts] = useState(false);
  const { data: testimonialsData, isLoading: testimonialsLoading, error: testimonialsError } = useTestimonials();
  const { data: funFactsData, isLoading: funFactsLoading, error: funFactsError } = useFunFacts();

  const isLoading = testimonialsLoading || funFactsLoading;
  const error = testimonialsError || funFactsError;

  if (isLoading) {
    return (
      <div className="bg-cardBg p-0 h-full border border-accent/20 card-rounded flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2"></div>
          <p className="text-xs font-mono text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || (!testimonialsData && !funFactsData)) {
    return (
      <div className="bg-cardBg p-0 h-full border border-accent/20 card-rounded flex items-center justify-center">
        <p className="text-xs font-mono text-secondary">Failed to load</p>
      </div>
    );
  }

  const testimonials = testimonialsData || [];
  const funFacts = funFactsData || [];
  if (inGrid) {
    // For grid layout with double lines scrolling in opposite directions
    return (
      <div 
        className="bg-cardBg p-0 h-full border border-accent/20 overflow-hidden w-full card-rounded"
        style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}
      >
        <div 
          className="flex items-center justify-between px-4 py-1 border-b"
          style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}>
          <h2 className="text-base font-sequel theme-text-primary">
            {showFunFacts ? 'FUN FACTS' : 'WHAT PEOPLE SAY'}
          </h2>
          <button
            onClick={() => setShowFunFacts(!showFunFacts)}
            className="p-1 rounded-full hover:bg-accent/20 transition-colors duration-200"
            title={showFunFacts ? 'Show testimonials' : 'Show fun facts'}
          >
            <HelpCircle className="h-4 w-4 text-accent" />
          </button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-32px)]">
          {/* First row - scrolls left to right */}
          <div className="relative overflow-hidden flex-1 flex items-center" style={{ minHeight: TESTIMONIAL_ROW_HEIGHT }}>
            <div className="testimonial-scroll-right absolute flex animate-scroll" style={{ width: "max-content" }}>
              {showFunFacts ? (
                <>
                  {funFacts.slice(0, 4).map((funFact: any, index: number) => (
                    <FunFactItem 
                      key={`funfact-top-${index}`} 
                      fact_text={funFact.fact_text}
                    />
                  ))}
                  {/* Duplicate for seamless scrolling */}
                  {funFacts.slice(0, 4).map((funFact: any, index: number) => (
                    <FunFactItem 
                      key={`funfact-top-dup-${index}`} 
                      fact_text={funFact.fact_text}
                    />
                  ))}
                </>
              ) : (
                <>
                  {testimonials.slice(0, 4).map((testimonial: any, index: number) => (
                    <TestimonialItem 
                      key={`testimonial-top-${index}`} 
                      name={testimonial.name} 
                      occupation={testimonial.occupation} 
                      text={testimonial.text}
                      compact={true}
                    />
                  ))}
                  {/* Duplicate for seamless scrolling */}
                  {testimonials.slice(0, 4).map((testimonial: any, index: number) => (
                    <TestimonialItem 
                      key={`testimonial-top-dup-${index}`} 
                      name={testimonial.name} 
                      occupation={testimonial.occupation} 
                      text={testimonial.text}
                      compact={true}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
          
          {/* Second row - scrolls right to left */}
          <div className="relative overflow-hidden flex-1 flex items-center" style={{ minHeight: TESTIMONIAL_ROW_HEIGHT }}>
            <div className="testimonial-scroll-left absolute flex animate-scroll-reverse" style={{ width: "max-content" }}>
              {showFunFacts ? (
                <>
                  {funFacts.slice(3).map((funFact: any, index: number) => (
                    <FunFactItem 
                      key={`funfact-bottom-${index}`} 
                      fact_text={funFact.fact_text}
                    />
                  ))}
                  {/* Duplicate for seamless scrolling */}
                  {funFacts.slice(3).map((funFact: any, index: number) => (
                    <FunFactItem 
                      key={`funfact-bottom-dup-${index}`} 
                      fact_text={funFact.fact_text}
                    />
                  ))}
                </>
              ) : (
                <>
                  {testimonials.slice(3).map((testimonial: any, index: number) => (
                    <TestimonialItem 
                      key={`testimonial-bottom-${index}`} 
                      name={testimonial.name} 
                      occupation={testimonial.occupation} 
                      text={testimonial.text}
                      compact={true}
                    />
                  ))}
                  {/* Duplicate for seamless scrolling */}
                  {testimonials.slice(3).map((testimonial: any, index: number) => (
                    <TestimonialItem 
                      key={`testimonial-bottom-dup-${index}`} 
                      name={testimonial.name} 
                      occupation={testimonial.occupation} 
                      text={testimonial.text}
                      compact={true}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } 
  
  // Default horizontal testimonials for bottom of page
  return (
    <div className="bg-transparent p-0 h-auto overflow-hidden w-full card-rounded">
      <div className="flex items-center px-4 pt-2 pb-1">
        <h2 className="text-base font-mono theme-text-primary">What people have to say</h2>
      </div>
      
      <div className="relative overflow-hidden h-[105px] flex items-center">
        <div className="testimonial-scroll absolute flex animate-scroll" style={{ width: "max-content" }}>
          {testimonials.map((testimonial: any, index: number) => (
            <TestimonialItem 
              key={`testimonial-${index}`} 
              name={testimonial.name} 
              occupation={testimonial.occupation} 
              text={testimonial.text} 
            />
          ))}
          {/* Duplicate items for seamless scrolling */}
          {testimonials.map((testimonial: any, index: number) => (
            <TestimonialItem 
              key={`testimonial-dup-${index}`} 
              name={testimonial.name} 
              occupation={testimonial.occupation} 
              text={testimonial.text} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}