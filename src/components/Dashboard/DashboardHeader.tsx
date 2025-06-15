import { Calendar, Sun } from "lucide-react";
export function DashboardHeader() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  return <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {getGreeting()}! 👋
        </h1>
        <p className="text-white/70">
          Ready to achieve your health goals today?
        </p>
      </div>
      <div className="flex items-center gap-2 text-white/60">
        <Calendar className="w-4 h-4" />
        <span className="text-sm">{currentDate}</span>
        
      </div>
    </div>;
}