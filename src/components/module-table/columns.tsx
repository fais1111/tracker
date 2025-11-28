"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      return (
        <div className="flex items-center gap-2 font-medium">
          <span>{row.getValue("moduleNo")}</span>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "yard",
    header: "Yard",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 100,
  },
  {
    accessorKey: "location",
    header: "Location",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 100,
  },
  {
    accessorKey: "rfloDate",
    header: "RFLO Date",
    cell: ({ row }) => {
      const date = row.getValue("rfloDate");
      if (!date) return <span className="text-muted-foreground">N/A</span>;
      return <span>{format(new Date(date as string), "dd-MMM-yy")}</span>;
    },
    size: 120,
  },
  {
    accessorKey: "shipmentNo",
    header: "Shipment No#",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 150,
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
    size: 150,
  },
  {
    accessorKey: "yardReport",
    header: "Yard Report",
    cell: ({ row }) => {
      const report: string = row.getValue("yardReport");
      return <div className="truncate max-w-[250px]">{report || "-"}</div>
    },
    size: 250,
  },
  {
    accessorKey: "islandReport",
    header: "Island Report",
    cell: ({ row }) => {
      const report: string = row.getValue("islandReport");
      return <div className="truncate max-w-[250px]">{report || "-"}</div>
    },
    size: 250,
  },
  {
    accessorKey: "byWhom",
    header: "By Whom",
     cell: ({ row }) => {
      const byWhom: string = row.getValue("byWhom");
      return <div className="truncate max-w-[150px]">{byWhom || "-"}</div>
    },
    size: 150,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    size: 50,
    enableHiding: false,
  },
];
