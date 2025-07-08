import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import ProjectsCarousel from "@/components/ProjectsCarousel";
import ContactButton from "@/components/ContactButton";
import DownloadCVButton from "@/components/DownloadCVButton";
import TechStackCard from "@/components/TechStackCard";
import SkillsCard from "@/components/SkillsCard";
import WorkExperienceCard from "@/components/WorkExperienceCard";
import TestimonialsCard from "@/components/TestimonialsCard";
import ProjectModal from "@/components/ProjectModal";
import ContactModal from "@/components/ContactModal";
import OthersSection from "@/components/OthersSection";
import Header from "@/components/Header";


export default function Home() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [, setLocation] = useLocation();
  
  // Check admin session on component mount
  useEffect(() => {
    const checkAdminSession = () => {
      const adminSession = localStorage.getItem('adminSession');
      const sessionTime = localStorage.getItem('adminSessionTime');
      
      if (adminSession === 'authenticated' && sessionTime) {
        const now = Date.now();
        const sessionStart = parseInt(sessionTime);
        const hoursElapsed = (now - sessionStart) / (1000 * 60 * 60);
        
        // Session valid for 24 hours
        if (hoursElapsed <= 24) {
          setIsAdminLoggedIn(true);
        } else {
          // Session expired, clean up
          localStorage.removeItem('adminSession');
          localStorage.removeItem('adminSessionTime');
          setIsAdminLoggedIn(false);
        }
      }
    };
    
    checkAdminSession();
    
    // Check session periodically
    const interval = setInterval(checkAdminSession, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const handleProjectClick = (projectId: number) => {
    setSelectedProject(projectId);
    setIsProjectModalOpen(true);
  };
  
  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };
  
  const handleAdminAccess = () => {
    setLocation('/admin');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Admin Access Button - Only visible when logged in */}
      {isAdminLoggedIn && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={handleAdminAccess}
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm border-accent/40 hover:border-accent/60"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin Panel
          </Button>
        </div>
      )}
      
      <main className="mx-auto p-3 md:p-4 max-w-7xl flex-1">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          {/* Row 1 - Profile card takes up first column for both rows */}
          <div className="col-span-1 md:col-span-1 row-span-2 h-full">
            <ProfileCard />
          </div>
          
          {/* Projects carousel takes up rest of first row */}
          <div className="col-span-1 md:col-span-3 h-full">
            <ProjectsCarousel onProjectClick={handleProjectClick} />
          </div>
          
          {/* Row 2 - Skills, Experience, and Testimonial cards */}
          <div className="col-span-1 md:col-span-1 h-full">
            <SkillsCard />
          </div>
          
          <div className="col-span-1 md:col-span-1 h-full">
            <WorkExperienceCard />
          </div>
          
          <div className="col-span-1 md:col-span-1 h-full min-h-[200px]">
            <TestimonialsCard inGrid={true} />
          </div>
        </div>
        
        {/* Tech Stack - Full Width */}
        <div className="mt-4">
          <TechStackCard />
        </div>
        
        {/* Contact and Download CV Buttons */}
        <div className="mt-4 flex justify-center">
          <div className="w-full max-w-md flex space-x-3">
            <div className="flex-grow">
              <ContactButton onClick={handleContactClick} />
            </div>
            <div className="w-44"> {/* Fixed width for the Download CV button */}
              <DownloadCVButton />
            </div>
          </div>
        </div>
        
        {/* Others Section */}
        <div className="mt-2">
          <OthersSection />
        </div>
        
        {/* Footer */}
        <footer className="mt-6 border-t border-neonGreen/30 pt-3 text-center text-[10px] text-secondary">
          <p>© 2025 <span className="text-neonGreen font-mono font-bold">noah.ojile</span> • BSc Computer Science</p>
          <p className="text-neonGreen/50 mt-1 font-mono">[ React • Tailwind • TypeScript ]</p>
        </footer>
        
        {/* Modals */}
        <ProjectModal 
          isOpen={isProjectModalOpen}
          projectId={selectedProject}
          onClose={() => setIsProjectModalOpen(false)}
        />
        
        <ContactModal 
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </main>
    </div>
  );
}
