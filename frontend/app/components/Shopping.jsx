"use client";

import * as React from "react";

import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";





import { Button } from "@/components/ui/button";

import { readString } from "react-papaparse";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { ShoppingCartButton } from "@/app/components/ShoppingCart";

import useCartStore from "@/hooks/useCartStore";
import {useEffect, useState} from "react";



import {API_1,  getCookie, getProjectName} from "@/lib/utils";
import useDataStore from "@/hooks/useDataStore";



export default function Shopping() {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  const setData = useDataStore((state) => state.setData);
  const data = useDataStore((state) => state.data);
  const api_name =getCookie()
  const projectName = getProjectName('project_name');
  console.log("DATA RETRIEVED : ",data)




  const CartCell = ({ row }) => {
    const addToCart = useCartStore((state) => state.addToCart);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const cart = useCartStore((state) => state.cart);



    return (
        <div className="flex gap-2">
          <Button
              className="border rounded px-2"
              onClick={() => addToCart(row.original.id, row.original.UnitPrice)} // Pass product id and price to addToCart
          >
            +
          </Button>
          {cart[row.original.id]?.quantity || 0}
          <Button
              className="border rounded px-2"
              onClick={() => removeFromCart(row.original.id)} // Pass product id to removeFromCart
          >
            -
          </Button>
        </div>
    );
  };

  const columns = [
    {
      accessorKey: "Description",
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Product Description
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
        );
      },
      cell: ({ row }) => (
          <div className="lowercase">{row.getValue("Description")}</div>
      ),
    },
    {
      accessorKey: "UnitPrice",
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("UnitPrice"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "cart",
      header: () => <div className="text-center">Cart</div>,
      cell: ({ row }) => <CartCell row={row} />, // Use the custom CartCell component
    },
  ];
  // const [data, setData] = useState([]);
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_1}/get_products?api_name=${api_name}&project_name=${projectName}`);
        if (!response.ok) {
          throw new Error(`Error fetching CSV data: ${response.statusText}`);
        }
        console.log("API_NAME : ",api_name)
        const csvData = await response.text();
        const parsedData = readString(csvData, { header: true }).data;
        setData(parsedData);
      } catch (error) {
        console.error('Error fetching CSV data:', error);
      }
    };

    fetchData();
  }, []);




  // fetchDataFromAPI("high_risk_associations")

  const addToCart = useCartStore((state) => state.addToCart); // Get addToCart function from the store
  const removeFromCart = useCartStore((state) => state.removeFromCart); // Get removeFromCart function from the store

  return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
              placeholder="Search product..."
              value={table.getColumn("Description")?.getFilterValue() ?? ""}
              onChange={(event) =>
                  table.getColumn("Description")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
          />

          <ShoppingCartButton />
          <Button variant="outline" className="ml-auto bg-green-400 text-white">
            CheckOut
            <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                )}
                          </TableHead>
                      );
                    })}
                  </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                      <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                              )}
                            </TableCell>
                        ))}
                      </TableRow>
                  ))
              ) : (
                  <TableRow>
                    <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
  );
}


