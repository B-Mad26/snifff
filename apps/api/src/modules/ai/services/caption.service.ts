import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class CaptionService {
  private client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

  async suggest(imageUrl: string) {
    if (!this.client) {
      return { suggestions: [
        'Living my best paw-some life.',
        'Sundays were made for snoozes.',
        'Sniff first, ask questions later.',
      ]};
    }
    const resp = await this.client.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 250,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Suggest 3 short, witty Instagram-style captions (no emojis) from the pet\'s first-person POV.' },
          { type: 'image', source: { type: 'url', url: imageUrl } as any },
        ],
      }],
    });
    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
    const suggestions = text.split('\n').map(s => s.replace(/^[\d.\-)\s]+/, '').trim()).filter(Boolean).slice(0, 3);
    return { suggestions };
  }
}
