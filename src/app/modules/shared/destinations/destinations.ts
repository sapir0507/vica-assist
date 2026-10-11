export interface Destination {
  name: string;
  emoji: string;
  description: string;
  fromPrice: number;
  gradient: string;
}

export const DESTINATIONS: readonly Destination[] = [
  { name: 'Paris', emoji: '🗼', description: 'Cafés, museums and the river Seine', fromPrice: 420, gradient: 'linear-gradient(135deg, #f472b6, #7c3aed)' },
  { name: 'Tokyo', emoji: '🗾', description: 'Neon nights and quiet temples', fromPrice: 780, gradient: 'linear-gradient(135deg, #fb7185, #be123c)' },
  { name: 'Bali', emoji: '🌴', description: 'Rice terraces and surf beaches', fromPrice: 690, gradient: 'linear-gradient(135deg, #34d399, #0e7490)' },
  { name: 'Dubai', emoji: '🏙️', description: 'Skyscrapers, desert and souks', fromPrice: 360, gradient: 'linear-gradient(135deg, #fbbf24, #b45309)' },
  { name: 'Barcelona', emoji: '⛪', description: 'Gaudí, tapas and the sea', fromPrice: 310, gradient: 'linear-gradient(135deg, #fb923c, #c2410c)' },
  { name: 'Singapore', emoji: '🦁', description: 'Gardens, food courts and skyline', fromPrice: 740, gradient: 'linear-gradient(135deg, #38bdf8, #4338ca)' }
];
