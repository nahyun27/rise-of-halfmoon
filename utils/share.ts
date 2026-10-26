export type ShareOutcome = 'shared' | 'copied' | 'failed';

// Native share sheet on touch devices, clipboard everywhere else
export async function shareText(text: string): Promise<ShareOutcome> {
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (isTouch && navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (e) {
      // User dismissed the sheet: don't fall through to copying
      if (e instanceof DOMException && e.name === 'AbortError') return 'failed';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
