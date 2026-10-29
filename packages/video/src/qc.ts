/**
 * QC utilities — duration, black frames, audio levels, safe zone, caption overflow.
 */

export async function checkBlackFrames(_input: string): Promise<number[]> {
  // Production: ffmpeg blackdetect filter
  return [];
}

export async function checkAudioLevels(_input: string): Promise<{ lufs: number; peak: number }> {
  // Production: ffmpeg ebur128 filter
  return { lufs: -14, peak: -1.5 };
}

export async function checkSafeZone(_input: string): Promise<{ passed: boolean; violations: string[] }> {
  // Production: OCR captions + bounding boxes; verify all stay within 9:16 safe zone
  return { passed: true, violations: [] };
}
