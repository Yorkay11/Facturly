import type React from "react"

const InvoiceCreation: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Document with shadow */}
        <defs>
          <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--background))" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.95" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="hsl(var(--foreground))" floodOpacity="0.1" />
          </filter>
        </defs>
        
        {/* Document */}
        <rect x="50" y="40" width="200" height="160" rx="12" fill="url(#docGradient)" stroke="hsl(var(--border))" strokeWidth="1.5" filter="url(#shadow)" />
        
        {/* Header section */}
        <rect x="50" y="40" width="200" height="45" rx="12" fill="hsl(var(--primary))" opacity="0.08" />
        <rect x="65" y="52" width="80" height="8" rx="4" fill="hsl(var(--primary))" opacity="0.4" />
        <rect x="65" y="65" width="60" height="6" rx="3" fill="hsl(var(--muted-foreground))" opacity="0.3" />
        
        {/* Content lines */}
        <rect x="65" y="100" width="170" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.2" />
        <rect x="65" y="110" width="140" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.2" />
        <rect x="65" y="120" width="120" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.2" />
        
        {/* Table */}
        <rect x="65" y="135" width="170" height="50" rx="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
        <line x1="65" y1="150" x2="235" y2="150" stroke="hsl(var(--border))" strokeWidth="1" />
        <line x1="65" y1="165" x2="235" y2="165" stroke="hsl(var(--border))" strokeWidth="1" />
        <line x1="150" y1="135" x2="150" y2="185" stroke="hsl(var(--border))" strokeWidth="1" />
        
        {/* Floating action button */}
        <circle cx="240" cy="60" r="22" fill="hsl(var(--primary))" opacity="0.15" filter="url(#shadow)" />
        <circle cx="240" cy="60" r="18" fill="hsl(var(--primary))" />
        <path d="M240 52V68M232 60H248" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Success indicator */}
        <circle cx="70" cy="200" r="14" fill="hsl(var(--primary))" opacity="0.15" />
        <circle cx="70" cy="200" r="10" fill="hsl(var(--primary))" />
        <path d="M67 200L69 202L73 198" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

export default InvoiceCreation

