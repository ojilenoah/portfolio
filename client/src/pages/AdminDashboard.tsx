import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, Eye, Settings, Users, Briefcase, Star, MessageSquare, Lightbulb, Code, Mail, Grid3X3, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThemeSwitch from '@/components/ThemeSwitch';
import ProjectsManager from '@/components/admin/ProjectsManager';
import ExperiencesManager from '@/components/admin/ExperiencesManager';
import SkillsManager from '@/components/admin/SkillsManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import TechStackManager from '@/components/admin/TechStackManager';
import FunFactsManager from '@/components/admin/FunFactsManager';
import ContactsManager from '@/components/admin/ContactsManager';
import ProfileManager from '@/components/admin/ProfileManager';
import OthersManager from '@/components/admin/OthersManager';


export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const adminSession = localStorage.getItem('adminSession');
    const sessionTime = localStorage.getItem('adminSessionTime');
    
    if (!adminSession || adminSession !== 'authenticated') {
      setLocation('/');
      return;
    }
    
    // Check if session is expired (24 hours)
    if (sessionTime) {
      const now = Date.now();
      const sessionStart = parseInt(sessionTime);
      const hoursElapsed = (now - sessionStart) / (1000 * 60 * 60);
      
      if (hoursElapsed > 24) {
        handleLogout();
        return;
      }
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminSessionTime');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    setLocation('/');
  };

  const handlePreview = () => {
    // Navigate to main site instead of opening modal
    setLocation('/');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'others', label: 'Others', icon: Grid3X3 },
    { id: 'experiences', label: 'Experience', icon: Star },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'techstack', label: 'Tech Stack', icon: Code },
    { id: 'funfacts', label: 'Fun Facts', icon: Lightbulb },
    { id: 'contacts', label: 'Contacts', icon: Mail },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Noah</h1>
              <p className="text-muted-foreground">Manage your portfolio content from the sidebar</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="admin-overview-card group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Briefcase className="h-5 w-5 text-blue-500" />
                    </div>
                    Projects
                  </CardTitle>
                  <CardDescription>Manage your portfolio projects and showcase your work</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      console.log('Projects button clicked');
                      setActiveSection('projects');
                    }} 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Manage Projects
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-overview-card group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                      <Star className="h-5 w-5 text-amber-500" />
                    </div>
                    Experience
                  </CardTitle>
                  <CardDescription>Update work experience and professional journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveSection('experiences')} 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Manage Experience
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-overview-card group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                    </div>
                    Testimonials
                  </CardTitle>
                  <CardDescription>Client feedback and reviews management</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveSection('testimonials')} 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Manage Testimonials
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-overview-card group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                      <Code className="h-5 w-5 text-purple-500" />
                    </div>
                    Skills
                  </CardTitle>
                  <CardDescription>Technical skills and expertise showcase</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveSection('skills')} 
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Manage Skills
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-overview-card group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                    </div>
                    Fun Facts
                  </CardTitle>
                  <CardDescription>Random interesting facts about yourself</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveSection('funfacts')} 
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Manage Fun Facts
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-overview-card group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                      <Mail className="h-5 w-5 text-cyan-500" />
                    </div>
                    Contacts
                  </CardTitle>
                  <CardDescription>Messages and inquiries from visitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveSection('contacts')} 
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Messages
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-overview-card group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/10 rounded-lg group-hover:bg-teal-500/20 transition-colors">
                      <Grid3X3 className="h-5 w-5 text-teal-500" />
                    </div>
                    Others
                  </CardTitle>
                  <CardDescription>Additional content and resources showcase</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      console.log('Others button clicked');
                      setActiveSection('others');
                    }} 
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Manage Others
                  </Button>
                </CardContent>
              </Card>

              <Card className="admin-overview-card group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg group-hover:bg-rose-500/20 transition-colors">
                      <Settings className="h-5 w-5 text-rose-500" />
                    </div>
                    Profile
                  </CardTitle>
                  <CardDescription>Personal information and social links</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveSection('profile')} 
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all duration-200"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'profile':
        return <ProfileManager />;
      case 'projects':
        return <ProjectsManager />;
      case 'others':
        return <OthersManager />;
      case 'experiences':
        return <ExperiencesManager />;
      case 'skills':
        return <SkillsManager />;
      case 'testimonials':
        return <TestimonialsManager />;
      case 'techstack':
        return <TechStackManager />;
      case 'funfacts':
        return <FunFactsManager />;
      case 'contacts':
        return <ContactsManager />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed Sidebar */}
      <div className="w-16 hover:w-48 transition-all duration-300 ease-in-out border-r bg-card group fixed left-0 top-0 h-full z-10 flex flex-col overflow-hidden">
        <div className="p-4 space-y-4 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Admin
            </h1>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative ${
                  activeSection === item.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 min-w-[20px]" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-border/50">
          <button
            onClick={handlePreview}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200"
          >
            <Eye className="h-5 w-5 min-w-[20px]" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Preview Site
            </span>
          </button>
          
          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200">
            <div className="min-w-[20px] h-5 flex items-center justify-center">
              <div className="scale-75">
                <ThemeSwitch />
              </div>
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Theme
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <LogOut className="h-5 w-5 min-w-[20px]" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content with offset for fixed sidebar */}
      <div className="flex-1 ml-16 min-h-screen overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}