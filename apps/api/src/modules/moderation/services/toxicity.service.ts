import { Injectable, Logger } from '@nestjs/common';

/**
 * Toxicity scoring. In production → Google Perspective API + custom fine-tune.
 * This impl: deterministic heuristic for dev/testing.
 */
@Injectable()
export class ToxicityService {
  private log = new Logger(ToxicityService.name);
  private readonly BAD_WORDS = ['hate', 'kill', 'idiot', 'stupid', 'scam'];   // demo only — real list is in moderation pipeline

  async score(text: string): Promise<number> {
    if (process.env.PERSPECTIVE_API_KEY) {
      // TODO: real Perspective API call
    }
    const lower = text.toLowerCase();
    const hits = this.BAD_WORDS.filter(w => lower.includes(w)).length;
    return Math.min(1, hits * 0.3);
  }
}
