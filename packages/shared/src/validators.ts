import { z } from 'zod';

export const phoneSchema = z.string().regex(/^\+\d{8,15}$/, 'phone must be E.164 (e.g. +14155551212)');
export const otpSchema   = z.string().min(4).max(8);

export const createPetSchema = z.object({
  name: z.string().min(1).max(80),
  species: z.enum(['DOG','CAT','RABBIT','BIRD','EXOTIC','OTHER']),
  breedPrimary: z.string().optional(),
  gender: z.enum(['MALE','FEMALE']).optional(),
  size: z.enum(['TOY','SMALL','MEDIUM','LARGE','GIANT']).optional(),
  intact: z.boolean().optional(),
  dob: z.string().datetime().optional(),
  bio: z.string().max(2000).optional(),
  personality: z.record(z.number().min(0).max(10)).optional(),
  photos: z.array(z.object({ url: z.string().url() })).max(9).optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const swipeSchema = z.object({
  swiperPetId: z.string().uuid(),
  targetPetId: z.string().uuid(),
  action: z.enum(['SNIFF','SUPER_SNIFF','PASS']),
  mode: z.enum(['FRIENDS','BREEDING','ADOPTION','PLAYDATE','LOST']),
});
