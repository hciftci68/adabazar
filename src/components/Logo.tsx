import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-[46px] md:h-[52px] w-auto" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 450 180"
      className={className}
      fill="none"
      id="acikbazar-svg-logo"
    >
      {/* Logo Symbol Group */}
      <g transform="translate(0, 5)">
        {/* Green 'a' circle on the left */}
        <circle cx="190" cy="62" r="25" stroke="#24b453" strokeWidth="14" fill="none" />
        
        {/* Orange 'b' circle on the right */}
        <circle cx="260" cy="62" r="25" stroke="#f37021" strokeWidth="14" fill="none" />
        
        {/* Split vertical stem in the center (X = 225) */}
        {/* Left half (green) of the stem */}
        <rect x="218" y="12" width="7" height="84" fill="#24b453" />
        {/* Right half (orange) of the stem */}
        <rect x="225" y="12" width="7" height="84" fill="#f37021" />
        
        {/* Hanging Price Tag rotated -12 degrees around center (225, 45) */}
        <g transform="rotate(-12, 225, 45)">
          {/* Shadow of the tag for premium, crisp depth */}
          <path
            d="M 218 36 L 232 36 L 239 43 L 239 79 A 3 3 0 0 1 236 82 L 214 82 A 3 3 0 0 1 211 79 L 211 43 Z"
            fill="none"
            stroke="#000000"
            strokeWidth="2.5"
            opacity="0.05"
            transform="translate(1, 1.5)"
          />
          
          {/* Tag Body */}
          <path
            d="M 218 36 L 232 36 L 239 43 L 239 79 A 2 2 0 0 1 237 81 L 213 81 A 2 2 0 0 1 211 79 L 211 43 Z"
            fill="#ffffff"
            stroke="#c8c8c8"
            strokeWidth="1.5"
          />
          
          {/* Tiny string hole at top */}
          <circle cx="225" cy="43" r="2.5" fill="#555555" />
          
          {/* Smiley mouth on tag (perfectly matching user's reference) */}
          <path
            d="M 217 61 Q 225 69 233 61"
            fill="none"
            stroke="#333333"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* Logo Text Group */}
      <text
        x="225"
        y="148"
        textAnchor="middle"
        fontSize="37"
        letterSpacing="-0.5"
        fontFamily="'Inter', 'Outfit', 'Space Grotesk', system-ui, sans-serif"
      >
        <tspan fontWeight="700" fill="#111827">Acik</tspan>
        <tspan fontWeight="700" fill="#f37021">Bazar</tspan>
        <tspan fill="#24b453" fontWeight="800">.</tspan>
        <tspan fontWeight="500" fill="#111827">com</tspan>
      </text>
    </svg>
  );
};
