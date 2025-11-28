"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableRowActions } from "./data-table-row-actions";
import type { Module } from "@/lib/types";

export const columns: ColumnDef<Module>[] = [
  {
    accessorKey: "yard",
    header: "Yard",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
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
      return (
        <div className="flex items-center gap-2 font-medium">
          <span>{row.getValue("moduleNo")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "shipmentDate",
    header: "Shipment Date",
     cell: ({ row }) => {
      const dateString = row.getValue("shipmentDate") as string;
      if (!dateString) return <span className="text-muted-foreground">N/A</span>;
      try {
        const [year, month, day] = dateString.split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) return <span className="text-destructive">{dateString}</span>;
        const utcDate = new Date(Date.UTC(year, month - 1, day));
        return <span>{format(utcDate, "dd-MMM-yy")}</span>;
      } catch (e) {
        return <span className="text-muted-foreground">{dateString}</span>
      }
    },
  },
  {
    accessorKey: "shipmentNo",
    header: "Shipment No#",
  },
  {
    accessorKey: "rfloDateStatus",
    header: "RFLO Status",
    cell: ({ row }) => {
      const status = row.getValue("rfloDateStatus") as string;
      if (!status) return null;
      const variant: "default" | "secondary" | "outline" =
        status.toLowerCase() === "date confirmed" ? "default" : status.toLowerCase().includes("quarter") ? "secondary" : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableHiding: false,
  },
];
