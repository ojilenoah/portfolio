import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

export default function App() {
  // Set dark theme by default at the app level
  useEffect(() => {
    // If no theme is set in localStorage, set it to dark
    const currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
      localStorage.setItem('theme', 'dark');
    }
    
    // Apply the theme to the document
    const themeToApply = currentTheme || 'dark';
    document.documentElement.setAttribute('data-theme', themeToApply);
    
    // Add appropriate classes to body
    if (themeToApply === 'dark') {
      document.body.className = 'bg-dark text-white';
    } else {
      document.body.className = 'bg-light text-dark-gray';
    }
  }, []);

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}
