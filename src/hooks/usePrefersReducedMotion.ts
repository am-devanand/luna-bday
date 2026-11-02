import { useMediaQuery } from './useMediaQuery';

/**
 * True when the visitor asked the OS to reduce motion. Every new cinematic
 * component checks this before running transforms, flips, physics or autoplay.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
