import type React from "react"

const EmailSending: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="envelopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--background))" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.9" />
          </linearGradient>
          <filter id="emailShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="hsl(var(--foreground))" floodOpacity="0.08" />
          </filter>
        </defs>
        
        {/* Main envelope */}
        <path
          d="M160 60L90 110L160 170L230 110L160 60Z"
          fill="url(#envelopeGrad)"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          filter="url(#emailShadow)"
        />
        
        {/* Envelope flap */}
        <path
          d="M90 110L160 140L230 110"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
        
        {/* Envelope content lines */}
        <rect x="110" y="125" width="100" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.3" />
        <rect x="110" y="135" width="80" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.3" />
        <rect x="110" y="145" width="90" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.3" />
        
        {/* Sending arrow with motion lines */}
        <g opacity="0.8">
          <path
            d="M250 90L270 110L250 130M270 110H210"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="250" cy="110" r="3" fill="hsl(var(--primary))" />
          {/* Motion lines */}
          <line x1="200" y1="105" x2="210" y2="105" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="200" y1="110" x2="210" y2="110" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="200" y1="115" x2="210" y2="115" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </g>
        
        {/* Email notification badge */}
        <circle cx="70" cy="70" r="18" fill="hsl(var(--primary))" opacity="0.15" />
        <circle cx="70" cy="70" r="14" fill="hsl(var(--primary))" />
        <path
          d="M70 64L66 68L70 72L74 68L70 64Z"
          fill="hsl(var(--primary-foreground))"
          opacity="0.9"
        />
        
        {/* Status indicator */}
        <circle cx="230" cy="160" r="10" fill="hsl(var(--primary))" opacity="0.2" />
        <circle cx="230" cy="160" r="6" fill="hsl(var(--primary))" />
      </svg>
    </div>
  )
}

export default EmailSending

