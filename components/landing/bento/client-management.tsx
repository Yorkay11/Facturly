import type React from "react"

const ClientManagement: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <filter id="cardShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="hsl(var(--foreground))" floodOpacity="0.08" />
          </filter>
        </defs>
        
        {/* Client avatars with professional styling */}
        <g>
          {/* Avatar 1 */}
          <circle cx="90" cy="70" r="28" fill="hsl(var(--primary))" opacity="0.12" filter="url(#cardShadow)" />
          <circle cx="90" cy="65" r="14" fill="hsl(var(--primary))" opacity="0.7" />
          <path d="M75 85Q75 75, 90 75Q105 75, 105 85" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <rect x="70" y="95" width="40" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.4" />
          
          {/* Avatar 2 */}
          <circle cx="160" cy="70" r="28" fill="hsl(var(--primary))" opacity="0.12" filter="url(#cardShadow)" />
          <circle cx="160" cy="65" r="14" fill="hsl(var(--primary))" opacity="0.7" />
          <path d="M145 85Q145 75, 160 75Q175 75, 175 85" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <rect x="140" y="95" width="40" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.4" />
          
          {/* Avatar 3 */}
          <circle cx="230" cy="70" r="28" fill="hsl(var(--primary))" opacity="0.12" filter="url(#cardShadow)" />
          <circle cx="230" cy="65" r="14" fill="hsl(var(--primary))" opacity="0.7" />
          <path d="M215 85Q215 75, 230 75Q245 75, 245 85" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <rect x="210" y="95" width="40" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.4" />
        </g>
        
        {/* Product cards with professional design */}
        <g>
          {/* Product card 1 */}
          <rect x="60" y="130" width="80" height="70" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1.5" filter="url(#cardShadow)" />
          <rect x="70" y="140" width="60" height="12" rx="4" fill="hsl(var(--primary))" opacity="0.2" />
          <rect x="70" y="158" width="50" height="6" rx="3" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <rect x="70" y="170" width="45" height="6" rx="3" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <circle cx="125" cy="145" r="8" fill="hsl(var(--primary))" opacity="0.15" />
          <path d="M120 145L123 148L130 141" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          
          {/* Product card 2 */}
          <rect x="160" y="130" width="80" height="70" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1.5" filter="url(#cardShadow)" />
          <rect x="170" y="140" width="60" height="12" rx="4" fill="hsl(var(--primary))" opacity="0.2" />
          <rect x="170" y="158" width="50" height="6" rx="3" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <rect x="170" y="170" width="45" height="6" rx="3" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <circle cx="225" cy="145" r="8" fill="hsl(var(--primary))" opacity="0.15" />
          <path d="M220 145L223 148L230 141" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
        
        {/* Connection lines */}
        <path d="M90 110 Q90 120, 100 130" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.3" fill="none" />
        <path d="M160 110 Q160 120, 170 130" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.3" fill="none" />
        <path d="M230 110 Q230 120, 220 130" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.3" fill="none" />
      </svg>
    </div>
  )
}

export default ClientManagement

