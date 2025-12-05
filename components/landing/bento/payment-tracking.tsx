import type React from "react"

const PaymentTracking: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>
          <filter id="chartShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="hsl(var(--primary))" floodOpacity="0.2" />
          </filter>
        </defs>
        
        {/* Chart background */}
        <rect x="50" y="60" width="200" height="120" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        
        {/* Grid lines */}
        <line x1="50" y1="120" x2="250" y2="120" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" strokeDasharray="2,2" />
        <line x1="50" y1="150" x2="250" y2="150" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" strokeDasharray="2,2" />
        
        {/* Bar chart */}
        <rect x="70" y="140" width="25" height="40" rx="4" fill="hsl(var(--primary))" opacity="0.3" filter="url(#chartShadow)" />
        <rect x="110" y="120" width="25" height="60" rx="4" fill="hsl(var(--primary))" opacity="0.5" filter="url(#chartShadow)" />
        <rect x="150" y="100" width="25" height="80" rx="4" fill="hsl(var(--primary))" filter="url(#chartShadow)" />
        <rect x="190" y="90" width="25" height="90" rx="4" fill="hsl(var(--primary))" filter="url(#chartShadow)" />
        
        {/* Line chart overlay */}
        <path
          d="M82.5 160 Q110 150, 137.5 130 T192.5 100"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M82.5 160 Q110 150, 137.5 130 T192.5 100 L192.5 180 L82.5 180 Z"
          fill="url(#chartGradient)"
        />
        
        {/* Data points */}
        <circle cx="82.5" cy="160" r="5" fill="hsl(var(--primary))" />
        <circle cx="137.5" cy="130" r="5" fill="hsl(var(--primary))" />
        <circle cx="192.5" cy="100" r="6" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
        
        {/* Real-time indicator */}
        <circle cx="260" cy="50" r="22" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        <circle cx="260" cy="50" r="18" fill="hsl(var(--primary))" opacity="0.1" />
        <circle cx="260" cy="50" r="14" fill="hsl(var(--primary))" />
        <line x1="260" y1="50" x2="260" y2="40" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="260" y1="50" x2="268" y2="50" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
        
        {/* Pulse animation indicator */}
        <circle cx="260" cy="50" r="18" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" />
        
        {/* Status badges */}
        <rect x="60" y="200" width="60" height="24" rx="12" fill="hsl(var(--primary))" opacity="0.1" />
        <circle cx="72" cy="212" r="4" fill="hsl(var(--primary))" />
        <text x="82" y="217" fontSize="10" fill="hsl(var(--foreground))" opacity="0.7">Payé</text>
      </svg>
    </div>
  )
}

export default PaymentTracking

