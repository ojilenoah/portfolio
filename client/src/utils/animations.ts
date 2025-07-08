// Utility functions for animations

/**
 * Creates a staggered animation delay for items in a list
 * @param index Index of the item in the list
 * @param baseDelay Base delay in milliseconds
 * @returns Delay in seconds as a string (e.g., "0.2s")
 */
export const staggerDelay = (index: number, baseDelay: number = 100): string => {
  return `${(index * baseDelay) / 1000}s`;
};

/**
 * Creates a wave animation pattern where items animate in sequence
 * and then back, like a wave
 * @param index Index of the item
 * @param totalItems Total number of items
 * @param baseDelay Base delay in milliseconds
 * @returns Delay in seconds as a string
 */
export const waveAnimation = (index: number, totalItems: number, baseDelay: number = 100): string => {
  // Calculate wave position (0 to 1 and back to 0)
  const wavePosition = index <= totalItems / 2 
    ? index / (totalItems / 2) 
    : 2 - (index / (totalItems / 2));
  
  return `${(wavePosition * baseDelay) / 1000}s`;
};

/**
 * Animates items from the center outward
 * @param index Index of the item
 * @param totalItems Total number of items
 * @param baseDelay Base delay in milliseconds
 * @returns Delay in seconds as a string
 */
export const centerOutAnimation = (index: number, totalItems: number, baseDelay: number = 100): string => {
  const center = Math.floor(totalItems / 2);
  const distanceFromCenter = Math.abs(index - center);
  
  return `${(distanceFromCenter * baseDelay) / 1000}s`;
};
