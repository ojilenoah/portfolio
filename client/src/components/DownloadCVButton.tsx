import { FaFileDownload } from "react-icons/fa";
import { useState } from "react";
import { useProfile } from "@/hooks/use-portfolio-data";

export default function DownloadCVButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: profile } = useProfile();

  const handleDownload = () => {
    // Get CV URL from database only
    const cvUrl = profile?.cv_download_url;
    
    if (!cvUrl) {
      console.error("No CV URL available in database");
      return;
    }
    
    // To prevent caching issues, add a cache-busting timestamp
    const timestamp = new Date().getTime();
    setIsDownloading(true);
    
    try {
      window.location.href = `${cvUrl}?t=${timestamp}`;
      
      // Reset the downloading state after a short delay
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error("Download failed:", error);
      setIsDownloading(false);
      
      // Fallback method if direct navigation fails
      const link = document.createElement('a');
      link.href = `${cvUrl}?t=${timestamp}`;
      link.download = 'Noah_Ojile_CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Don't render button if no CV URL is available
  if (!profile?.cv_download_url) {
    return null;
  }

  return (
    <button 
      onClick={handleDownload}
      disabled={isDownloading}
      className={`bg-blue-600/90 hover:bg-blue-700 text-white flex items-center justify-center py-3 w-full transition-all duration-300 rounded-md shadow-sm hover:shadow-md ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
    >
      <FaFileDownload className={`mr-2 ${isDownloading ? 'animate-pulse' : ''}`} />
      <span className="font-bold tracking-wide">
        {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD CV'}
      </span>
    </button>
  );
}