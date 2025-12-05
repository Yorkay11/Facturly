import type React from "react"

const OnlinePayment: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          <filter id="cardGlow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="hsl(var(--primary))" floodOpacity="0.2" />
          </filter>
        </defs>
        
        {/* Credit card with professional design */}
        <rect x="70" y="60" width="160" height="100" rx="14" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="2" filter="url(#cardGlow)" />
        
        {/* Card header with gradient */}
        <rect x="70" y="60" width="160" height="40" rx="14" fill="url(#cardGradient)" />
        
        {/* Card chip - professional design */}
        <rect x="88" y="75" width="32" height="24" rx="5" fill="hsl(var(--primary))" opacity="0.4" />
        <rect x="92" y="79" width="24" height="16" rx="3" fill="hsl(var(--background))" />
        <line x1="92" y1="87" x2="116" y2="87" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <line x1="104" y1="79" x2="104" y2="95" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        
        {/* Card number */}
        <rect x="88" y="115" width="130" height="10" rx="5" fill="hsl(var(--muted-foreground))" opacity="0.25" />
        <rect x="88" y="130" width="100" height="8" rx="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
        <rect x="88" y="142" width="80" height="8" rx="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
        
        {/* Security badge */}
        <circle cx="250" cy="50" r="22" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1.5" filter="url(#cardGlow)" />
        <circle cx="250" cy="50" r="18" fill="hsl(var(--primary))" opacity="0.1" />
        {/* Lock icon */}
        <rect x="242" y="42" width="16" height="14" rx="3" fill="hsl(var(--primary))" opacity="0.7" />
        <path d="M242 56V60Q242 64, 250 64Q258 64, 258 60V56" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="250" cy="50" r="2" fill="hsl(var(--primary-foreground))" />
        
        {/* SSL indicator */}
        <rect x="200" y="145" width="20" height="12" rx="2" fill="hsl(var(--primary))" opacity="0.15" />
        <path d="M205 150L208 153L215 146" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        
        {/* Payment network logos area */}
        <circle cx="220" cy="155" r="6" fill="hsl(var(--muted-foreground))" opacity="0.3" />
        <circle cx="235" cy="155" r="6" fill="hsl(var(--muted-foreground))" opacity="0.3" />
      </svg>
    </div>
  )
}

export default OnlinePayment

