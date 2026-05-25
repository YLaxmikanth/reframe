export type FileRiskLevel = "safe" | "large" | "very-large";

export interface FileRiskThresholds {
  large?: number; // bytes
  veryLarge?: number; // bytes
}

const DEFAULT_THRESHOLDS: Required<FileRiskThresholds> = {
  large: 500 * 1024 * 1024, // 500MB
  veryLarge: 1024 * 1024 * 1024, // 1GB
};

/**
 * Analyze a File and return a simple risk level.
 * Optionally adjusts thresholds based on `deviceMemoryGb` (if provided).
 */
export function analyzeFileRisk(
  file: File,
  opts?: FileRiskThresholds & { deviceMemoryGb?: number }
): FileRiskLevel {
  const deviceMemoryGb = opts?.deviceMemoryGb;
  const thresholds: Required<FileRiskThresholds> = {
    large: opts?.large ?? DEFAULT_THRESHOLDS.large,
    veryLarge: opts?.veryLarge ?? DEFAULT_THRESHOLDS.veryLarge,
  };

  // If device memory is known, scale thresholds down for low-memory devices.
  // This keeps the logic lightweight and conservative: less memory -> stricter thresholds.
  if (typeof deviceMemoryGb === "number" && isFinite(deviceMemoryGb) && deviceMemoryGb > 0) {
    // Scale factor ranges [0.25, 1]. 8GB and above => 1 (no change).
    const factor = Math.max(0.25, Math.min(1, deviceMemoryGb / 8));
    thresholds.large = Math.round(thresholds.large * factor);
    thresholds.veryLarge = Math.round(thresholds.veryLarge * factor);
  }

  const size = file.size;
  if (size >= thresholds.veryLarge) return "very-large";
  if (size >= thresholds.large) return "large";
  return "safe";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
