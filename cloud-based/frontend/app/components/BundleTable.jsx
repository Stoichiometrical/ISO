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

import {API_1, API_URL, getCookie, getProjectName} from "@/lib/utils";

import useCartStore from "@/hooks/useCartStore";
import useDataStore from "@/hooks/useDataStore";
import {useEffect} from "react";

export default function BundleTable({segment}) {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    const setBundles = useDataStore((state) => state.setBundles);
    const bundles = useDataStore((state) => state.bundles);
    const api_name = getCookie()
    const projectName = getProjectName('project_name');




    const CartCell = ({ row }) => {
        const addToCart = useCartStore((state) => state.addToCart);
        const removeFromCart = useCartStore((state) => state.removeFromCart);
        const cart = useCartStore((state) => state.cart);

        return (
            <div className="flex gap-2">
                <Button
                    className="border rounded px-2"
                    onClick={() =>
                        addToCart(row.original.id, row.original.discounted_price)
                    } // Pass product id and price to addToCart
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
            accessorKey: "bundle",
            header: () => (
                <Button
                    variant="ghost"
                    onClick={() => console.log("Sorting")}
                >
                    Bundle <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="lowercase">{row.getValue("bundle")}</div>
            ),
        },
        {
            accessorKey: "actual_price",
            header: () => <div className="text-right">Actual Price</div>,
            cell: ({ row }) => (
                <div className="text-right font-medium">
                    {parseFloat(row.getValue("actual_price")).toFixed(2)}
                </div>
            ),
        },
        {
            accessorKey: "discounted_price",
            header: () => <div className="text-right">Discounted Price</div>,
            cell: ({ row }) => (
                <div className="text-right font-medium">
                    {parseFloat(row.getValue("discounted_price")).toFixed(2)}
                </div>
            ),
        },
        {
            accessorKey: "Actions",
            header: () => <div className="text-center">Cart</div>,
            cell: ({ row }) => <CartCell row={row} />,
        },
    ];



    useEffect(() => {
        const getBundles = async () => {
            try {
                const response = await fetch(
                    `${API_1}/${api_name}/get_bundle_info?segment_name=${segment}&project_name=${projectName}`
                );

                if (!response.ok) {
                    throw new Error(`Error fetching bundle info: ${response.statusText}`);
                }

                const csvData = await response.text();
                // Assuming readString and parsedData are methods/functions you have defined
                const parsedData = readString(csvData, { header: true }).data;

                setBundles(parsedData);
            } catch (error) {
                console.error("Error fetching bundle info:", error);
            }
        };

        if (segment && projectName) {
            getBundles();
        }

    }, [segment, projectName]);


    const table = useReactTable({
        data: bundles,
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




    const addToCart = useCartStore((state) => state.addToCart); // Get addToCart function from the store
    const removeFromCart = useCartStore((state) => state.removeFromCart); // Get removeFromCart function from the store



    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Search bundle..."
                    value={
                        table.getColumn("bundle")?.getFilterValue() ?? ""
                    }
                    onChange={(event) =>
                        table
                            .getColumn("bundle")
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">


                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef
                                                    .header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    {bundles.length>0 ? (
                        <TableBody>

                            {table.getRowModel() && table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    ) : (
                        <TableBody>
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    )}

                </Table>
            </div>
        </div>
    );
}
