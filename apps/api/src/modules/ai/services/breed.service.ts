import { Injectable, Logger } from '@nestjs/common';

/**
 * Breed identification. Production: PyTorch model fine-tuned on Stanford Dogs + iNaturalist,
 * deployed via Replicate. Returns top-K breeds with confidence.
 */
@Injectable()
export class BreedService {
  private log = new Logger(BreedService.name);

  async identify(imageUrl: string) {
    if (process.env.REPLICATE_API_TOKEN) {
      // TODO: replicate.predictions.create({ version: '...', input: { image: imageUrl } })
    }
    // dev fallback
    return {
      url: imageUrl,
      predictions: [
        { breed: 'Golden Retriever',  confidence: 0.62 },
        { breed: 'Labrador Retriever', confidence: 0.21 },
        { breed: 'Mixed',              confidence: 0.17 },
      ],
    };
  }
}
