import excusesJson from './excuses.json';
import type { ExcuseTemplate } from '../types/excuse';

/**
 * Local JSON excuse dataset loaded from ./excuses.json (288 curated templates):
 * - 108 casual templates (12 x 3 personas x 3 channels) in shared India/Pakistan Hinglish
 * - 90 professional templates (10 x 3 personas x 3 channels) with ZERO emojis and zero gaming leaks
 * - 90 GTA 6 meme templates (10 x 3 personas x 3 channels) with launch-day parody humor
 */
export const EXCUSE_TEMPLATES: ExcuseTemplate[] = excusesJson as ExcuseTemplate[];
