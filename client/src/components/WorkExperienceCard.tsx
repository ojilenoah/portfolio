import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useExperiences } from "../hooks/use-portfolio-data";
import { transformDatabaseExperience } from "../types/database";

export default function WorkExperienceCard() {
  // All hooks must be declared at the top level
  const { data: experiencesData, isLoading, error } = useExperiences();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  // Handle loading and error states
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

  if (error || !experiencesData) {
    return (
      <div className="bg-cardBg p-0 h-full border border-accent/20 card-rounded flex items-center justify-center">
        <p className="text-xs font-mono text-secondary">Failed to load</p>
      </div>
    );
  }

  const experiences = experiencesData;

  return (
    <div 
      className="bg-cardBg p-0 h-full overflow-hidden border border-accent/20 card-rounded"
      style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}
    >
      <div 
        className="flex items-center px-4 py-2 border-b"
        style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}>
        <h2 className="text-base font-sequel theme-text-primary">EXPERIENCE</h2>
      </div>
      
      <div className="p-4 space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          {experiences.map((experience: any, index: number) => (
            <div 
              key={index} 
              className="relative pl-4 border-l-2"
              style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.4))' }}
            >
              <div 
                className="absolute w-2 h-2 border bg-background -left-[4px] rounded-full"
                style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.6))' }}
              ></div>
              <div className="mb-1">
                <div 
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleExpand(index)}
                >
                  <h3 className="text-xs font-sequel group-hover:text-neonGreen transition-colors">{experience.title}</h3>
                  <button 
                    className="text-xs text-secondary hover:text-neonGreen transition-colors"
                    aria-label={expandedIndex === index ? "Collapse details" : "Expand details"}
                  >
                    {expandedIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono theme-text-primary">{experience.company}</span>
                  <span 
                    className="text-xs font-mono text-secondary card-rounded px-1 py-0.5 text-[10px] bg-accent/5 border border-accent/30"
                    style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.3))' }}
                  >{experience.period}</span>
                </div>
                {expandedIndex === index && (
                  <div className="overflow-hidden transition-all duration-300 ease-in-out">
                    <p 
                      className="text-xs font-mono text-secondary italic mt-1 pl-1 border-l"
                      style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.3))' }}
                    >
                      {experience.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
