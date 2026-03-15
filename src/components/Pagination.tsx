import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between pt-4">
      <div className="text-xs text-muted-foreground font-medium">
        {total > 0 ? `${start}–${end} of ${total}` : "No results"}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Rows:</span>
          <Select value={String(pageSize)} onValueChange={(v) => { onPageSizeChange(Number(v)); onPageChange(1); }}>
            <SelectTrigger className="h-7 w-[60px] rounded-lg text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50].map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs px-2 font-medium text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
