import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class BioService {
  private log = new Logger(BioService.name);
  private client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

  constructor(private prisma: PrismaService) {}

  async generateById(petId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) return null;
    return { bio: await this.generate(pet) };
  }

  async generate(pet: any): Promise<string> {
    const traits = Object.entries((pet.personality ?? {}) as Record<string, number>)
      .map(([k, v]) => `${k}:${v}`).join(', ') || 'unknown personality';
    if (!this.client) {
      // dev fallback
      return `${pet.name} is a ${pet.breedPrimary ?? pet.species.toLowerCase()} with a heart of gold — ${traits}. Looking for new friends, fun adventures, and the occasional belly rub.`;
    }
    const resp = await this.client.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Write a fun, warm, 2-sentence Snifff bio for a pet. Use first-person from the pet. Match a Gen-Z social-app voice. No emojis.
Name: ${pet.name}
Species: ${pet.species}
Breed: ${pet.breedPrimary ?? 'mixed'}
Gender: ${pet.gender ?? 'unspecified'}
Size: ${pet.size ?? 'medium'}
Personality (1-10): ${traits}
Mode preferences: friends${pet.isBreeding ? ', breeding' : ''}${pet.isAdoptable ? ', adoption' : ''}`,
      }],
    });
    const text = resp.content[0]?.type === 'text' ? resp.content[0].text.trim() : '';
    return text || `${pet.name} is looking for new friends.`;
  }
}
