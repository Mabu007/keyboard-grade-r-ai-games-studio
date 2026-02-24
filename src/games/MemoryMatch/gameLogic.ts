export const colors = ['red', 'blue', 'green', 'yellow'];

export type CardState = 'hidden' | 'flipped' | 'matched';

export interface Card {
  id: number;
  color: string; // The color value to match
  buttonColor: string; // The controller button color associated with this position
}

// Fixed 4 card layout for 4 controller buttons
export const getInitialCards = (): Card[] => {
  // Two pairs
  const pairColors = ['#F87171', '#60A5FA']; // Red-ish, Blue-ish
  const shuffledColors = [...pairColors, ...pairColors].sort(() => Math.random() - 0.5);
  
  return [
    { id: 0, color: shuffledColors[0], buttonColor: 'bg-red-500' }, // Top Left -> Red Btn
    { id: 1, color: shuffledColors[1], buttonColor: 'bg-blue-500' }, // Top Right -> Blue Btn
    { id: 2, color: shuffledColors[2], buttonColor: 'bg-green-500' }, // Bottom Left -> Green Btn
    { id: 3, color: shuffledColors[3], buttonColor: 'bg-yellow-500' } // Bottom Right -> Yellow Btn
  ];
};
