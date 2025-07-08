import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, []);
  
  const formattedDate = format(currentTime, 'MMM dd');
  const formattedTime = format(currentTime, 'HH:mm:ss');
  
  return (
    <div className="font-mono text-xs inline-flex items-center gap-2">
      <span className="theme-text-secondary whitespace-nowrap">{formattedDate}</span>
      <span className="theme-text-primary whitespace-nowrap">{formattedTime}</span>
    </div>
  );
}