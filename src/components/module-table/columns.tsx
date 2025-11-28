"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { AlertTriangle, ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTableRowActions } from "./data-table-row-actions";
import type { Module } from "@/lib/types";

export const columns: ColumnDef<Module>[] = [
  {
    accessorKey: "moduleNo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Module No.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { isAnomaly, anomalyExplanation } = row.original;
      return (
        <div className="flex items-center gap-2">
          {isAnomaly && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{anomalyExplanation}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <span className={isAnomaly ? "font-semibold" : ""}>{row.getValue("moduleNo")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "yard",
    header: "Yard",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "rfloDate",
    header: "RFLO Date",
    cell: ({ row }) => {
      const date = row.getValue("rfloDate");
      if (!date) return <span className="text-muted-foreground">N/A</span>;
      return <span>{format(new Date(date as string), "dd-MMM-yy")}</span>;
    },
  },
  {
    accessorKey: "shipmentNo",
    header: "Shipment No#",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "rfloDateStatus",
    header: "RFLO Status",
    cell: ({ row }) => {
      const status = row.getValue("rfloDateStatus") as Module["rfloDateStatus"];
      const variant: "default" | "secondary" | "outline" =
        status === "Date Confirmed" ? "default" : status === "1st Quarter-2026" ? "secondary" : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "yardReport",
    header: "Yard Report",
    cell: ({ row }) => {
      const report: string = row.getValue("yardReport");
      return <div className="truncate max-w-[150px]">{report || "-"}</div>
    }
  },
  {
    accessorKey: "islandReport",
    header: "Island Report",
    cell: ({ row }) => {
      const report: string = row.getValue("islandReport");
      return <div className="truncate max-w-[150px]">{report || "-"}</div>
    }
  },
  {
    accessorKey: "byWhom",
    header: "By Whom",
     cell: ({ row }) => {
      const byWhom: string = row.getValue("byWhom");
      return <div className="truncate max-w-[100px]">{byWhom || "-"}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
