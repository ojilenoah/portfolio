import { useState, useRef, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useProjects } from "../hooks/use-portfolio-data";

interface ProjectsCarouselProps {
  onProjectClick: (projectId: number) => void;
}

export default function ProjectsCarousel({ onProjectClick }: ProjectsCarouselProps) {
  // All hooks must be called at the top level
  const { data: projects, isLoading, error } = useProjects();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'ArrowLeft') {
          scrollLeft();
        } else if (e.key === 'ArrowRight') {
          scrollRight();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Update scroll state
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    const updateScrollState = () => {
      const scrollLeft = carousel.scrollLeft;
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
      
      setScrollPosition(scrollLeft);
      setMaxScroll(maxScrollLeft);
      setCanScrollLeft(scrollLeft > 10); // Small tolerance
      setCanScrollRight(scrollLeft < maxScrollLeft - 10); // Small tolerance
    };
    
    updateScrollState();
    carousel.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    
    return () => {
      carousel.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  // Handle loading and error states after all hooks
  if (isLoading) {
    return (
      <div className="bg-cardBg h-full border border-accent/20 card-rounded flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
          <p className="text-sm font-mono text-secondary">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error || !projects) {
    return (
      <div className="bg-cardBg h-full border border-accent/20 card-rounded flex items-center justify-center">
        <p className="text-sm font-mono text-secondary">Failed to load projects</p>
      </div>
    );
  }

  return (
    <div className="bg-cardBg p-0 h-full col-span-1 sm:col-span-2 border border-accent/20 overflow-hidden card-rounded"
         style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-accent/20"
           style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}>
        <h2 className="text-base font-sequel theme-text-primary">PROJECTS</h2>
        <div className="flex space-x-2">
          <button 
            className={`h-6 w-6 border border-accent/20 flex items-center justify-center transition-colors card-rounded ${
              canScrollLeft ? 'hover:border-accent/50 theme-text-secondary' : 'opacity-30 cursor-not-allowed'
            }`}
            style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}
            aria-label="Previous project"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <FaChevronLeft className="h-3 w-3" />
          </button>
          <button 
            className={`h-6 w-6 border border-accent/20 flex items-center justify-center transition-colors card-rounded ${
              canScrollRight ? 'hover:border-accent/50 theme-text-secondary' : 'opacity-30 cursor-not-allowed'
            }`}
            style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}
            aria-label="Next project"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <FaChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <div 
        className="carousel h-[calc(100%-38px)] overflow-x-auto overflow-y-hidden relative scrollbar-hide" 
        ref={carouselRef}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div 
          className="flex px-4 py-3 h-[calc(100%-6px)]"
          style={{
            width: `${(projects || []).length * 220}px` // Each card is 200px wide + 20px gap
          }}
        >
          {(projects || []).map((project) => (
            <div 
              key={project.id}
              className="min-w-[200px] w-[200px] h-full mx-[10px] cursor-pointer border border-accent/20 hover:border-accent/40 transition-all duration-200 card-rounded overflow-hidden flex flex-col"
              style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}
              onClick={() => onProjectClick(project.id)}
            >
              <div className="h-1/2 border-b border-accent/20 overflow-hidden flex items-center justify-center relative"
                   style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.25))' }}>
                {project.imageUrl ? (
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h16v2H4z" />
                    </svg>
                  </div>
                )}
                {/* Project number indicator */}
                <div className="absolute top-2 right-2 bg-cardBg border border-accent/40 px-2 py-0.5 text-[10px] font-mono theme-text-primary z-10 shadow-sm card-rounded"
                     style={{ borderColor: 'var(--border-accent-color, rgba(0, 117, 79, 0.4))' }}>
                  <span className="text-accent font-bold">#{project.sortOrder}</span>
                  <span className="opacity-70"> of {projects.length}</span>
                </div>
              </div>
              <div className="p-3 flex flex-col h-1/2">
                <h3 className="text-xs font-sequel mb-1 truncate theme-text-primary">{project.title}</h3>
                <p className="text-secondary text-[10px] font-mono truncate">{project.technologies.slice(0, 3).join(" · ")}</p>
                <div className="flex-grow"></div>
                <div className="text-[9px] opacity-50 font-mono">Click to view details</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
