import StatusBadge from "@/components/StatusBadge";
import type { Tables, Database } from "@/integrations/supabase/types";

type StatusHistory = Tables<"application_status_history">;
type AppStatus = Database["public"]["Enums"]["application_status"];

const statusColors: Record<AppStatus, string> = {
  draft: "bg-muted-foreground",
  submitted: "bg-[hsl(var(--info))]",
  under_scrutiny: "bg-[hsl(var(--warning))]",
  essential_document_sought: "bg-destructive",
  referred: "bg-primary",
  mom_generated: "bg-accent",
  finalized: "bg-[hsl(var(--success))]",
};

interface Props {
  history: StatusHistory[];
  profiles?: Record<string, string>;
}

export default function StatusTimeline({ history, profiles = {} }: Props) {
  if (history.length === 0) {
    return <p className="text-muted-foreground text-sm">No status changes yet</p>;
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

      <div className="space-y-6">
        {history.map((h, i) => {
          const dotColor = statusColors[h.to_status] || "bg-primary";
          const isFirst = i === 0;

          return (
            <div key={h.id} className="relative flex gap-4">
              {/* Dot */}
              <div className={`absolute -left-6 top-1 w-[14px] h-[14px] rounded-full border-2 border-background ${dotColor} ${isFirst ? "ring-2 ring-primary/30" : ""}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {h.from_status && (
                    <>
                      <StatusBadge status={h.from_status} />
                      <span className="text-muted-foreground text-xs">→</span>
                    </>
                  )}
                  <StatusBadge status={h.to_status} />
                  {isFirst && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>

                {h.remarks && (
                  <p className="text-sm text-muted-foreground mt-1.5 bg-muted/50 rounded px-3 py-1.5 border border-border/50">
                    {h.remarks}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{new Date(h.created_at).toLocaleString()}</span>
                  {profiles[h.changed_by] && (
                    <>
                      <span>•</span>
                      <span>by {profiles[h.changed_by]}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
