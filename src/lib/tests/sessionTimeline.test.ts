import { describe, it, expect } from "vitest";
import {
  createTimelineEvent,
  createTimelineSnapshot,
  appendTimelineEvent,
  defaultTimelineState,
  sanitizeTimelineState,
} from "../sessionTimeline";
import { DEFAULT_RECIPE } from "../constants";

describe("sessionTimeline helpers", () => {
  it("creates a valid timeline snapshot with metadata", () => {
    const snapshot = createTimelineSnapshot(
      DEFAULT_RECIPE,
      { musicVolume: 50, originalAudioVolume: 20, loopMusic: true },
      { position: "bottom-left", size: 120, opacity: 90 },
      "Initial checkpoint"
    );

    expect(snapshot.id).toBeDefined();
    expect(snapshot.label).toBe("Initial checkpoint");
    expect(snapshot.recipe).toEqual(DEFAULT_RECIPE);
    expect(snapshot.audioSettings.loopMusic).toBe(true);
    expect(snapshot.overlaySettings.position).toBe("bottom-left");
  });

  it("creates a timeline event with an id and timestamp", () => {
    const event = createTimelineEvent("edit", "Adjust settings", { speed: 1.5 }, "snapshot-1");

    expect(event.id).toBeDefined();
    expect(event.type).toBe("edit");
    expect(event.label).toBe("Adjust settings");
    expect(event.snapshotId).toBe("snapshot-1");
  });

  it("appends events and snapshots and updates active snapshot id", () => {
    const base = defaultTimelineState();
    const snapshot = createTimelineSnapshot(
      DEFAULT_RECIPE,
      { musicVolume: 60, originalAudioVolume: 40, loopMusic: false },
      { position: "top-right", size: 150, opacity: 100 },
      "Saved state"
    );
    const event = createTimelineEvent("snapshot", "Saved state", { note: "checkpoint" }, snapshot.id);

    const next = appendTimelineEvent(base, event, snapshot);

    expect(next.events).toHaveLength(1);
    expect(next.snapshots).toHaveLength(1);
    expect(next.activeSnapshotId).toBe(snapshot.id);
    expect(next.events[0].snapshotId).toBe(snapshot.id);
  });

  it("returns null for invalid persisted timeline shapes", () => {
    expect(sanitizeTimelineState(null)).toBeNull();
    expect(sanitizeTimelineState({ version: 999 })).toBeNull();
    expect(sanitizeTimelineState({ version: 1, events: [{ id: "x" }] })).toBeNull();
  });
});
