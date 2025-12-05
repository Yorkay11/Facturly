import type React from "react"

const DashboardIntelligence: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="dashboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="chartAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </linearGradient>
          <filter id="dashboardShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="hsl(var(--foreground))" floodOpacity="0.08" />
          </filter>
        </defs>
        
        {/* Main dashboard container */}
        <rect x="50" y="40" width="200" height="140" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1.5" filter="url(#dashboardShadow)" />
        
        {/* Header section */}
        <rect x="50" y="40" width="200" height="35" rx="12" fill="url(#dashboardGrad)" />
        <rect x="65" y="50" width="100" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.6" />
        <rect x="65" y="60" width="60" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.4" />
        
        {/* Chart area with grid */}
        <rect x="65" y="85" width="170" height="70" rx="6" fill="url(#chartAreaGrad)" />
        
        {/* Grid lines */}
        <line x1="65" y1="120" x2="235" y2="120" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" strokeDasharray="2,2" />
        <line x1="65" y1="140" x2="235" y2="140" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" strokeDasharray="2,2" />
        
        {/* Chart line with area fill */}
        <path
          d="M75 145 Q115 130, 155 110 T235 85"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M75 145 Q115 130, 155 110 T235 85 L235 155 L75 155 Z"
          fill="url(#chartAreaGrad)"
        />
        
        {/* Data points */}
        <circle cx="95" cy="140" r="4" fill="hsl(var(--primary))" />
        <circle cx="135" cy="125" r="4" fill="hsl(var(--primary))" />
        <circle cx="175" cy="110" r="5" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
        <circle cx="215" cy="95" r="5" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
        
        {/* Stats cards */}
        <rect x="65" y="165" width="85" height="28" rx="6" fill="hsl(var(--primary))" opacity="0.08" stroke="hsl(var(--border))" strokeWidth="1" />
        <rect x="72" y="172" width="50" height="5" rx="2.5" fill="hsl(var(--muted-foreground))" opacity="0.4" />
        <rect x="72" y="180" width="35" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.6" />
        
        <rect x="160" y="165" width="75" height="28" rx="6" fill="hsl(var(--primary))" opacity="0.08" stroke="hsl(var(--border))" strokeWidth="1" />
        <rect x="167" y="172" width="50" height="5" rx="2.5" fill="hsl(var(--muted-foreground))" opacity="0.4" />
        <rect x="167" y="180" width="40" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.6" />
        
        {/* AI/Intelligence indicator */}
        <circle cx="250" cy="50" r="20" fill="hsl(var(--primary))" opacity="0.12" filter="url(#dashboardShadow)" />
        <circle cx="250" cy="50" r="16" fill="hsl(var(--primary))" opacity="0.2" />
        {/* Sparkle icon */}
        <path
          d="M250 42L251.5 47L256.5 48.5L251.5 50L250 55L248.5 50L243.5 48.5L248.5 47L250 42Z"
          fill="hsl(var(--primary))"
          opacity="0.9"
        />
        <circle cx="250" cy="50" r="2" fill="hsl(var(--primary-foreground))" />
      </svg>
    </div>
  )
}

export default DashboardIntelligence

