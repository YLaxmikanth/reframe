import { describe, it, expect } from 'vitest';
import { analyzeFileRisk, formatBytes } from '../fileSizeRisk';

// Helper to create a fake File-like object with a size property.
function fakeFileWithSize(size: number): File {
  // Cast to File because tests run in jsdom; we only need `.size`.
  return { size } as unknown as File;
}

describe('fileSizeRisk', () => {
  it('detects safe files < 500MB', () => {
    const size = 499 * 1024 * 1024; // 499 MB
    const f = fakeFileWithSize(size);
    const r = analyzeFileRisk(f);
    expect(r).toBe('safe');
  });

  it('detects large files >= 500MB', () => {
    const size = 600 * 1024 * 1024; // 600 MB
    const f = fakeFileWithSize(size);
    const r = analyzeFileRisk(f);
    expect(r).toBe('large');
  });

  it('detects very-large files >= 1GB', () => {
    const size = 1.1 * 1024 * 1024 * 1024; // 1.1 GB
    const f = fakeFileWithSize(Math.floor(size));
    const r = analyzeFileRisk(f);
    expect(r).toBe('very-large');
  });

  it('respects custom threshold overrides', () => {
    const size = 350 * 1024 * 1024; // 350 MB
    const f = fakeFileWithSize(size);
    // Override thresholds so this file becomes 'large'
    const r1 = analyzeFileRisk(f, { large: 300 * 1024 * 1024, veryLarge: 900 * 1024 * 1024 });
    expect(r1).toBe('large');

    // With a higher large threshold, it should be safe
    const r2 = analyzeFileRisk(f, { large: 400 * 1024 * 1024, veryLarge: 900 * 1024 * 1024 });
    expect(r2).toBe('safe');
  });

  it('formats bytes into KB, MB, GB correctly', () => {
    expect(formatBytes(800)).toBe('800 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatBytes(3 * 1024 * 1024 * 1024)).toBe('3.0 GB');
  });

  it('scales thresholds for low-memory devices (more conservative)', () => {
    const size = 400 * 1024 * 1024; // 400 MB
    const f = fakeFileWithSize(size);

    // Default without device memory: 400MB is 'safe' (default large ~500MB)
    expect(analyzeFileRisk(f)).toBe('safe');

    // On a 4GB device thresholds scale down (factor 0.5) => large threshold becomes ~250MB
    expect(analyzeFileRisk(f, { deviceMemoryGb: 4 })).toBe('large');

    // On a high-memory device (16GB) thresholds shouldn't be stricter than default
    expect(analyzeFileRisk(f, { deviceMemoryGb: 16 })).toBe('safe');
  });
});
