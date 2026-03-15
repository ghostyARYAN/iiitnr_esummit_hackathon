import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Constants } from "@/integrations/supabase/types";

interface Sector { id: string; name: string }

export interface FilterState {
  search: string;
  status: string;
  sectorId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

const defaultFilters: FilterState = { search: "", status: "all", sectorId: "all", dateFrom: undefined, dateTo: undefined };

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showSector?: boolean;
}

export const useApplicationFilters = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  return { filters, setFilters };
};

export function ApplicationFilters({ filters, onChange, showSector = true }: Props) {
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    if (showSector) {
      supabase.from("sectors").select("id, name").order("name").then(({ data }) => {
        if (data) setSectors(data);
      });
    }
  }, [showSector]);

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const hasFilters = filters.search || filters.status !== "all" || filters.sectorId !== "all" || filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by project name..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9 rounded-xl"
        />
      </div>

      <Select value={filters.status} onValueChange={(v) => update({ status: v })}>
        <SelectTrigger className="w-[155px] rounded-xl text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {Constants.public.Enums.application_status.map((s) => (
            <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showSector && (
        <Select value={filters.sectorId} onValueChange={(v) => update({ sectorId: v })}>
          <SelectTrigger className="w-[155px] rounded-xl text-sm">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-[130px] justify-start text-left font-normal rounded-xl text-sm", !filters.dateFrom && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yy") : "From"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl" align="start">
          <Calendar mode="single" selected={filters.dateFrom} onSelect={(d) => update({ dateFrom: d })} className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-[130px] justify-start text-left font-normal rounded-xl text-sm", !filters.dateTo && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateTo ? format(filters.dateTo, "dd/MM/yy") : "To"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl" align="start">
          <Calendar mode="single" selected={filters.dateTo} onSelect={(d) => update({ dateTo: d })} className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange(defaultFilters)} className="rounded-xl gap-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" /> Clear
        </Button>
      )}
    </div>
  );
}

export function applyFilters<T extends { project_name: string; status: string; sector_id?: string; created_at: string }>(
  items: T[], filters: FilterState
): T[] {
  return items.filter((item) => {
    if (filters.search && !item.project_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (filters.sectorId !== "all" && item.sector_id !== filters.sectorId) return false;
    if (filters.dateFrom && new Date(item.created_at) < filters.dateFrom) return false;
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(item.created_at) > end) return false;
    }
    return true;
  });
}
