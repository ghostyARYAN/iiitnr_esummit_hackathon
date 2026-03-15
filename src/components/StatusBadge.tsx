import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Status = Database["public"]["Enums"]["application_status"];

export default function StatusBadge({ status }: { status: Status }) {
  const { t } = useTranslation();

  const statusConfig: Record<Status, { label: string; className: string; dotColor: string }> = {
    draft: { label: t("Draft"), className: "bg-slate-50 text-slate-500 border-slate-200", dotColor: "bg-slate-400" },
    submitted: { label: t("Submitted"), className: "bg-blue-50 text-blue-600 border-blue-200", dotColor: "bg-blue-500" },
    under_scrutiny: { label: t("Under Scrutiny"), className: "bg-amber-50 text-amber-600 border-amber-200", dotColor: "bg-amber-500" },
    essential_document_sought: { label: t("EDS"), className: "bg-red-50 text-red-600 border-red-200", dotColor: "bg-red-500" },
    referred: { label: t("Referred"), className: "bg-orange-50 text-orange-600 border-orange-200", dotColor: "bg-orange-500" },
    mom_generated: { label: t("MoM Generated"), className: "bg-purple-50 text-purple-600 border-purple-200", dotColor: "bg-purple-500" },
    finalized: { label: t("Finalized"), className: "bg-emerald-50 text-emerald-600 border-emerald-200", dotColor: "bg-emerald-500" },
  };

  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground", dotColor: "bg-muted-foreground" };
  return (
    <Badge variant="outline" className={`rounded-full text-xs font-medium px-2.5 py-0.5 gap-1.5 ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </Badge>
  );
}
