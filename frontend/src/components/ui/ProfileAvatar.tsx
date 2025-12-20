import React from 'react';
import { type Profile } from '../../contexts/ProfilesContext';

interface ProfileAvatarProps {
  profile: Profile;
  size?: number;
  className?: string;
}

// SVG avatars for profiles - return JSX elements (not full SVG)
// All avatars have a uniform background that fills the entire space
const AVATAR_SVGS = [
  // Avatar 1 - Robot with antenna (purple)
  (color: string) => (
    <>
      <rect width="100" height="100" rx="20" fill={color}/>
      <rect x="25" y="45" width="50" height="30" rx="4" fill="#DDD6FE"/>
      <rect x="35" y="55" width="8" height="8" fill={color}/>
      <rect x="57" y="55" width="8" height="8" fill={color}/>
      <rect x="48" y="25" width="4" height="15" fill="#DDD6FE"/>
      <circle cx="50" cy="25" r="5" fill="#DDD6FE"/>
    </>
  ),
  // Avatar 2 - Smiley with mouth (pink)
  (color: string) => (
    <>
      <rect width="100" height="100" rx="20" fill={color}/>
      <g fill="#831843">
        <rect x="30" y="35" width="12" height="12" rx="2"/>
        <rect x="58" y="35" width="12" height="12" rx="2"/>
        <path d="M35 65H65V70C65 72.7614 62.7614 75 60 75H40C37.2386 75 35 72.7614 35 70V65Z" />
      </g>
      <path d="M40 65L43 70L46 65H54L57 70L60 65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  // Avatar 3 - Robot with eyes (green)
  (color: string) => (
    <>
      <rect width="100" height="100" rx="20" fill={color}/>
      <g fill="#064E3B">
        <rect x="20" y="40" width="28" height="20" rx="4"/>
        <rect x="52" y="40" width="28" height="20" rx="4"/>
        <rect x="48" y="48" width="4" height="4"/>
      </g>
      <rect x="45" y="70" width="10" height="4" rx="2" fill="#064E3B"/>
    </>
  ),
  // Avatar 4 - Bear (orange)
  (color: string) => (
    <>
      <rect width="100" height="100" rx="20" fill={color}/>
      <circle cx="50" cy="50" r="22" fill="white"/>
      <circle cx="50" cy="50" r="10" fill="#7C2D12"/>
      <path d="M35 25C40 20 60 20 65 25" stroke="#7C2D12" strokeWidth="5" strokeLinecap="round"/>
    </>
  ),
  // Avatar 5 - Simple smiley (blue)
  (color: string) => (
    <>
      <rect width="100" height="100" rx="20" fill={color}/>
      <g fill="white">
        <circle cx="35" cy="45" r="8"/>
        <circle cx="65" cy="45" r="8"/>
        <path d="M35 65C35 65 45 75 50 75C55 75 65 65 65 65" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </>
  ),
];

/**
 * Get avatar index for a profile
 * Uses the profile's avatarIndex if set, otherwise falls back to hash-based selection
 */
function getAvatarIndex(profile: Profile): number {
  if (profile.avatarIndex !== undefined) {
    return profile.avatarIndex;
  }
  // Fallback: Use a simple hash of the profile ID to get a consistent index
  let hash = 0;
  for (let i = 0; i < profile.id.length; i++) {
    const char = profile.id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % AVATAR_SVGS.length;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  profile, 
  size = 72,
  className = '' 
}) => {
  const avatarIndex = getAvatarIndex(profile);
  const AvatarSVG = AVATAR_SVGS[avatarIndex];
  
  return (
    <div 
      className={`flex items-center justify-center rounded-lg overflow-hidden ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: profile.color,
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size, height: size }}
      >
        {AvatarSVG(profile.color)}
      </svg>
    </div>
  );
};

