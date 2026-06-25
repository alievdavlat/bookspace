"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** shadcn Select that submits via a hidden input (drop-in for native <select> in forms). */
export function FormSelect({
  name,
  id,
  defaultValue = "",
  options,
  placeholder = "Select…",
  className = "w-full",
}: {
  name: string;
  id?: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const map = new Map(options.map((o) => [o.value, o.label]));
  return (
    <>
      <input type="hidden" name={name} value={value} id={id} />
      <Select value={value} onValueChange={(v) => setValue(v ?? "")}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder}>
            {(v: string) => map.get(v) ?? placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
