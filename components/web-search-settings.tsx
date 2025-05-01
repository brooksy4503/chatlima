"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface WebSearchContextSizeSelectorProps {
  contextSize: 'low' | 'medium' | 'high';
  onContextSizeChange: (size: 'low' | 'medium' | 'high') => void;
}

export function WebSearchContextSizeSelector({
  contextSize,
  onContextSizeChange,
}: WebSearchContextSizeSelectorProps) {
  return (
    <div className="flex flex-col gap-2 min-w-[120px]">
      <Label htmlFor="context-size" className="text-xs font-medium">
        Search Context Size
      </Label>
      <Select
        value={contextSize}
        onValueChange={(value) => onContextSizeChange(value as 'low' | 'medium' | 'high')}
      >
        <SelectTrigger id="context-size" className="h-8 px-2 text-xs">
          <SelectValue placeholder="Context size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-[10px] text-muted-foreground mt-1">
        Higher context size provides more comprehensive search results but costs more.
      </p>
    </div>
  );
} 