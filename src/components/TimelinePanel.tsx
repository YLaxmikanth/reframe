import { Trash2, Clock, ArrowRightCircle } from "lucide-react";
import { PersistedTimelineState } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatEventTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  timelineState: PersistedTimelineState;
  onRestore: (eventId: string) => void;
  onClearHistory: () => void;
}

export default function TimelinePanel({ timelineState, onRestore, onClearHistory }: Props) {
  const currentSnapshotId = timelineState.activeSnapshotId ?? timelineState.snapshots.at(-1)?.id;

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden animate-fade-in">
      <div className="px-4 py-4 border-b border-[var(--border)] flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
            <Clock size={12} /> Timeline
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">Saved locally in your browser.</p>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-[var(--muted)] hover:text-film-600 text-xs font-semibold uppercase tracking-widest"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {timelineState.events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-film-50 p-4 text-sm text-[var(--muted)]">
            Timeline is empty. Your changes will appear here as you edit.
          </div>
        ) : (
          <ol className="space-y-2">
            {timelineState.events.map((event) => {
              const isActive = event.snapshotId !== undefined && event.snapshotId === currentSnapshotId;
              const canRestore = event.snapshotId !== undefined && !isActive;

              return (
                <li key={event.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                          {event.type}
                        </span>
                        {isActive && (
                          <span className="text-[10px] bg-film-100 text-film-600 rounded-full px-2 py-0.5">
                            current
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[var(--text)]">{event.label}</p>
                      <p className="text-[11px] text-[var(--muted)]">{formatEventTime(event.timestamp)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRestore(event.id)}
                      disabled={!canRestore}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors",
                        canRestore
                          ? "border-film-300 text-film-700 hover:border-film-500 hover:bg-film-50"
                          : "border-[var(--border)] text-[var(--muted)] bg-[var(--surface)] cursor-not-allowed"
                      )}
                    >
                      <ArrowRightCircle size={14} />
                      Restore
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
