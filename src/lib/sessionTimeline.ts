import { EditRecipe, OverlayPosition, PersistedTimelineState, TimelineEvent, TimelineEventType, TimelineSnapshot, isValidRecipe } from "./types";

const STORAGE_KEY = "reframe:timeline";
const STORAGE_VERSION = 1;
const MAX_TIMELINE_EVENTS = 120;

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `evt-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidTimelineEvent(value: unknown): value is TimelineEvent {
  if (!isValidObject(value)) return false;
  const event = value as any;

  return (
    typeof event.id === "string" &&
    typeof event.timestamp === "number" &&
    typeof event.label === "string" &&
    typeof event.type === "string" &&
    ["prompt", "edit", "transform", "snapshot", "restore"].includes(event.type)
  );
}

function isValidTimelineSnapshot(value: unknown): value is TimelineSnapshot {
  if (!isValidObject(value)) return false;
  const snapshot = value as any;
  return (
    typeof snapshot.id === "string" &&
    typeof snapshot.timestamp === "number" &&
    typeof snapshot.label === "string" &&
    isValidRecipe(snapshot.recipe) &&
    isValidObject(snapshot.audioSettings) &&
    typeof snapshot.audioSettings.musicVolume === "number" &&
    typeof snapshot.audioSettings.originalAudioVolume === "number" &&
    typeof snapshot.audioSettings.loopMusic === "boolean" &&
    isValidObject(snapshot.overlaySettings) &&
    ["top-left", "top-right", "bottom-left", "bottom-right"].includes(snapshot.overlaySettings.position) &&
    typeof snapshot.overlaySettings.size === "number" &&
    typeof snapshot.overlaySettings.opacity === "number"
  );
}

export function defaultTimelineState(): PersistedTimelineState {
  return {
    version: STORAGE_VERSION,
    events: [],
    snapshots: [],
  };
}

export function sanitizeTimelineState(value: unknown): PersistedTimelineState | null {
  if (!isValidObject(value)) return null;
  const state = value as any;
  if (typeof state.version !== "number" || state.version !== STORAGE_VERSION) {
    return null;
  }

  if (!Array.isArray(state.events) || !Array.isArray(state.snapshots)) {
    return null;
  }

  const events = state.events.filter(isValidTimelineEvent);
  const snapshots = state.snapshots.filter(isValidTimelineSnapshot);

  return {
    version: STORAGE_VERSION,
    events,
    snapshots,
    activeSnapshotId: typeof state.activeSnapshotId === "string" ? state.activeSnapshotId : snapshots[snapshots.length - 1]?.id,
  };
}

export function loadPersistedTimelineState(): PersistedTimelineState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeTimelineState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePersistedTimelineState(state: PersistedTimelineState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota and serialization failures
  }
}

export function createTimelineSnapshot(
  recipe: EditRecipe,
  audioSettings: { musicVolume: number; originalAudioVolume: number; loopMusic: boolean },
  overlaySettings: { position: OverlayPosition; size: number; opacity: number },
  label: string
): TimelineSnapshot {
  return {
    id: createId(),
    timestamp: Date.now(),
    label,
    recipe,
    audioSettings,
    overlaySettings,
  };
}

export function createTimelineEvent(
  type: TimelineEventType,
  label: string,
  payload?: unknown,
  snapshotId?: string
): TimelineEvent {
  return {
    id: createId(),
    timestamp: Date.now(),
    type,
    label,
    payload,
    snapshotId,
  };
}

export function appendTimelineEvent(
  state: PersistedTimelineState,
  event: TimelineEvent,
  snapshot?: TimelineSnapshot
): PersistedTimelineState {
  const snapshots = snapshot ? [...state.snapshots, snapshot] : state.snapshots;
  const events = [...state.events, { ...event, snapshotId: snapshot?.id ?? event.snapshotId }];

  while (events.length > MAX_TIMELINE_EVENTS) {
    events.shift();
  }
  while (snapshots.length > MAX_TIMELINE_EVENTS) {
    snapshots.shift();
  }

  return {
    version: STORAGE_VERSION,
    events,
    snapshots,
    activeSnapshotId: snapshot?.id ?? event.snapshotId ?? state.activeSnapshotId,
  };
}

export function getLastSnapshot(state: PersistedTimelineState): TimelineSnapshot | null {
  return state.snapshots.length > 0 ? state.snapshots[state.snapshots.length - 1] : null;
}
