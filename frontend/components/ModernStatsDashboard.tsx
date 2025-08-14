import { Files, CheckCircle, Users, TrendingUp } from "lucide-react";
import { StatsData } from "@/utils/statsCalculator";

interface ModernStatsDashboardProps {
  stats: StatsData;
  mode: "demo" | "blockchain";
  onClearData?: () => void;
}

export function ModernStatsDashboard({ stats, mode }: ModernStatsDashboardProps) {
  // Calculate growth percentages (simulated for demo)
  const growthData = {
    filesGrowth: stats.totalFiles > 0 ? "+12%" : "+0%",
    verificationsGrowth: stats.totalVerifications > 0 ? "+24%" : "+0%",
    activeFilesGrowth: stats.filesInDatabase > 0 ? "+8%" : "+0%",
    successRateGrowth: "+0.2%"
  };

  const statItems = [
    {
      icon: Files,
      label: "Total Files",
      value: stats.totalFiles,
      change: growthData.filesGrowth,
      changeType: "positive" as const,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: CheckCircle,
      label: "Verifications",
      value: stats.totalVerifications,
      change: growthData.verificationsGrowth,
      changeType: "positive" as const,
      color: "green",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      label: "Active Files",
      value: stats.filesInDatabase,
      change: growthData.activeFilesGrowth,
      changeType: "positive" as const,
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: stats.successRate,
      change: growthData.successRateGrowth,
      changeType: "positive" as const,
      color: "orange",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Mode Indicator */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${mode === 'demo' ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
          <span className="text-muted-foreground">
            {mode === 'demo' ? 'Demo Mode Statistics' : 'Blockchain Statistics'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statItems.map((item, index) => (
          <div
            key={item.label}
            className="card-3d p-6 group cursor-pointer stats-card"
            data-delay={index * 0.1}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} shadow-lg`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.changeType === 'positive' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {item.change}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
