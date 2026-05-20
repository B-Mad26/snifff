// Shared TypeScript types — minimal, derived from the Prisma schema.

export type SwipeAction = 'SNIFF' | 'SUPER_SNIFF' | 'PASS';
export type SwipeMode   = 'FRIENDS' | 'BREEDING' | 'ADOPTION' | 'PLAYDATE' | 'LOST';
export type PetSpecies  = 'DOG' | 'CAT' | 'RABBIT' | 'BIRD' | 'EXOTIC' | 'OTHER';
export type PetGender   = 'MALE' | 'FEMALE';
export type PetSize     = 'TOY' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'GIANT';
export type SubscriptionTier = 'FREE' | 'PLUS' | 'GOLD' | 'BREEDER_PRO';

export interface PhotoRef { url: string; blurhash?: string; width?: number; height?: number; }
export interface Personality { energy?: number; friendly?: number; anxious?: number; playful?: number; [k: string]: number | undefined; }

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  breedPrimary?: string;
  gender?: PetGender;
  size?: PetSize;
  intact: boolean;
  bio?: string;
  photos: PhotoRef[];
  personality: Personality;
  isBreeding: boolean;
  isAdoptable: boolean;
  isLost: boolean;
  city?: string;
}

export interface Match {
  id: string;
  petAId: string;
  petBId: string;
  mode: SwipeMode;
  compatibilityScore: number;
  status: 'ACTIVE' | 'EXPIRED' | 'UNMATCHED' | 'BLOCKED';
}
