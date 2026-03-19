"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"; // adjust path if needed
import { ChevronRightIcon, CheckIcon } from "lucide-react";

type Props = {
  onFilterChange: (filter: string) => void;
  initial?: "all" | "paid" | "pending" | "overdue";
};

export default function FineFilterDropdown({
  onFilterChange,
  initial = "all",
}: Props) {
  const [value, setValue] = React.useState<string>(initial);

  React.useEffect(() => {
    onFilterChange(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // call once on mount with initial

  return (
    <div className="inline-block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:shadow-sm"
            aria-label="Filter fines"
          >
            <span className="capitalize">
              {value === "all" ? "All" : value}
            </span>
            <ChevronRightIcon className="w-4 h-4 rotate-90" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-44 p-1">
          <DropdownMenuLabel>Filter fines</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(v: string) => {
              setValue(v);
              onFilterChange(v);
            }}
          >
            <DropdownMenuRadioItem
              value="all"
              className="flex items-center justify-between"
            >
              <span>All</span>
              {value === "all" ? <CheckIcon className="w-4 h-4" /> : null}
            </DropdownMenuRadioItem>

            <DropdownMenuRadioItem
              value="paid"
              className="flex items-center justify-between"
            >
              <span>Paid</span>
              {value === "paid" ? <CheckIcon className="w-4 h-4" /> : null}
            </DropdownMenuRadioItem>

            <DropdownMenuRadioItem
              value="pending"
              className="flex items-center justify-between"
            >
              <span>Pending</span>
              {value === "pending" ? <CheckIcon className="w-4 h-4" /> : null}
            </DropdownMenuRadioItem>

            <DropdownMenuRadioItem
              value="overdue"
              className="flex items-center justify-between"
            >
              <span>Overdue</span>
              {value === "overdue" ? <CheckIcon className="w-4 h-4" /> : null}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
