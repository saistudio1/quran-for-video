import { CanvasDimensions } from '../types';

export const CANVAS_PRESETS: CanvasDimensions[] = [
  {
    name: 'Vertical 9:16 (Reels/TikTok)',
    width: 1080,
    height: 1920,
    preset: 'vertical',
  },
  {
    name: 'Landscape 16:9 (YouTube)',
    width: 1920,
    height: 1080,
    preset: 'landscape',
  },
  {
    name: 'Square 1:1 (Feed Post)',
    width: 1080,
    height: 1080,
    preset: 'square',
  },
  {
    name: '4K Vertical 9:16 (Ultra HD)',
    width: 2160,
    height: 3840,
    preset: '4k',
  },
];
