import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Initialize dark theme before the app loads
const initializeDarkTheme = () => {
  // Force dark theme by default (this happens before React hydrates)
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.className = 'bg-dark text-white';
};

// Run initialization
initializeDarkTheme();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
