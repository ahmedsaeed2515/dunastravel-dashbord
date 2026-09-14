import React from 'react';

interface CountryFlagProps {
  code?: string;
  className?: string;
  fallbackEmoji?: string;
}

/**
 * High-definition SVG country flag component for the Admin Dashboard.
 * Renders crisp, color-accurate vector flags on all platforms (including Windows desktop browsers).
 */
export const CountryFlag: React.FC<CountryFlagProps> = ({
  code = 'en',
  className = 'w-5 h-3.5',
  fallbackEmoji = '',
}) => {
  const normCode = (code || '').toLowerCase().trim();

  switch (normCode) {
    case 'ar':
    case 'eg':
    case 'egypt':
      // Flag of Egypt 🇪🇬
      return (
        <svg
          viewBox="0 0 900 600"
          className={`inline-block rounded-[2px] shadow-sm shrink-0 object-cover ${className}`}
          aria-label="Flag of Egypt"
          role="img"
        >
          <rect width="900" height="200" fill="#C8102E" />
          <rect y="200" width="900" height="200" fill="#FFFFFF" />
          <rect y="400" width="900" height="200" fill="#000000" />
          <g transform="translate(450, 300) scale(0.65)">
            <path
              d="M-40,-50 C-20,-70 20,-70 40,-50 C60,-30 80,10 70,50 C60,90 20,110 0,115 C-20,110 -60,90 -70,50 C-80,10 -60,-30 -40,-50 Z"
              fill="#C9A227"
              stroke="#A37B12"
              strokeWidth="3"
            />
            <path
              d="M-20,-20 L0,-40 L20,-20 L15,30 L0,45 L-15,30 Z"
              fill="#FFFFFF"
              stroke="#A37B12"
              strokeWidth="2"
            />
            <circle cx="0" cy="-25" r="8" fill="#C9A227" />
          </g>
        </svg>
      );

    case 'en':
    case 'gb':
    case 'uk':
      // Flag of United Kingdom 🇬🇧
      return (
        <svg
          viewBox="0 0 60 30"
          className={`inline-block rounded-[2px] shadow-sm shrink-0 object-cover ${className}`}
          aria-label="Flag of United Kingdom"
          role="img"
        >
          <clipPath id="admin-uk-s">
            <path d="M0,0 v30 h60 v-30 z" />
          </clipPath>
          <clipPath id="admin-uk-t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <g clipPath="url(#admin-uk-s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path
              d="M0,0 L60,30 M60,0 L0,30"
              clipPath="url(#admin-uk-t)"
              stroke="#C8102E"
              strokeWidth="4"
            />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
          </g>
        </svg>
      );

    case 'es':
    case 'spain':
      // Flag of Spain 🇪🇸
      return (
        <svg
          viewBox="0 0 750 500"
          className={`inline-block rounded-[2px] shadow-sm shrink-0 object-cover ${className}`}
          aria-label="Flag of Spain"
          role="img"
        >
          <rect width="750" height="500" fill="#AA151B" />
          <rect y="125" width="750" height="250" fill="#F1BF00" />
          <circle cx="250" cy="250" r="45" fill="#AA151B" opacity="0.85" />
          <rect x="235" y="225" width="30" height="50" rx="6" fill="#F1BF00" />
        </svg>
      );

    case 'pt':
    case 'br':
    case 'brazil':
      // Flag of Brazil 🇧🇷
      return (
        <svg
          viewBox="0 0 720 504"
          className={`inline-block rounded-[2px] shadow-sm shrink-0 object-cover ${className}`}
          aria-label="Flag of Brazil"
          role="img"
        >
          <rect width="720" height="504" fill="#009739" />
          <polygon points="360,40 670,252 360,464 50,252" fill="#FEDD00" />
          <circle cx="360" cy="252" r="110" fill="#012169" />
          <path
            d="M260,270 Q360,200 460,270"
            stroke="#FFFFFF"
            strokeWidth="14"
            fill="none"
          />
        </svg>
      );

    case 'it':
    case 'italy':
      // Flag of Italy 🇮🇹
      return (
        <svg
          viewBox="0 0 900 600"
          className={`inline-block rounded-[2px] shadow-sm shrink-0 object-cover ${className}`}
          aria-label="Flag of Italy"
          role="img"
        >
          <rect width="300" height="600" fill="#009246" />
          <rect x="300" width="300" height="600" fill="#FFFFFF" />
          <rect x="600" width="300" height="600" fill="#CE2B37" />
        </svg>
      );

    default:
      if (fallbackEmoji) {
        return (
          <span className="text-base leading-none select-none" aria-hidden="true">
            {fallbackEmoji}
          </span>
        );
      }
      return null;
  }
};

export default CountryFlag;
