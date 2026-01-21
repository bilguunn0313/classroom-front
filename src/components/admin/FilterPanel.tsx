"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  currentValue: string;
}

interface FilterPanelProps {
  filters: FilterOption[];
  onReset: () => void;
  activeFilterCount: number;
}

export default function FilterPanel({
  filters,
  onReset,
  activeFilterCount,
}: FilterPanelProps) {
  return (
    <div className="flex items-center gap-3">
      {filters.map((filter) => (
        <div key={filter.value} className="min-w-[180px]">
          <Select value={filter.currentValue} onValueChange={filter.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={onReset}>
          <X className="w-4 h-4 mr-1" />
          Reset Filters
          <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded text-xs">
            {activeFilterCount}
          </span>
        </Button>
      )}
    </div>
  );
}
