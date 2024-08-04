

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
} from "@nextui-org/react";
import { PlusIcon } from "./PlusIcon";
import { VerticalDotsIcon } from "./VerticalDotsIcon";
import { SearchIcon } from "./SearchIcon";
import { ChevronDownIcon } from "./ChevronDownIcon";
import { capitalize } from "./utils";

import {API_1, getCookie, getProjectName} from "@/lib/utils";

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

export const columns = [
  { uid: "CustomerID", name: "Customer ID", sortable: true },
  { uid: "Email", name: "Email", sortable: true },
  { uid: "Segment", name: "Segment", sortable: true },
  { uid: "Status", name: "Status", sortable: true },
  { uid: "Subsegment", name: "Subsegment", sortable: true },
];

const segmentOptions = [
  { uid: "Test", name: "Test" },
  { uid: "Risk", name: "Risk" },
  { uid: "High Value", name: "High Value" },
  { uid: "Nurture", name: "Nurture" },
];

const subsegmentOptions = [
  // Risk
  { uid: "Risk, High CLV", name: "Risk, High CLV" },
  { uid: "Risk, Medium CLV", name: "Risk, Medium CLV" },
  { uid: "Risk, Low CLV", name: "Risk, Low CLV" },

  // High Value
  { uid: "High Value, High CLV", name: "High Value, High CLV" },
  { uid: "High Value, Medium CLV", name: "High Value, Medium CLV" },
  { uid: "High Value, Low CLV", name: "High Value, Low CLV" },

  // Nurture
  { uid: "Nurture, High CLV", name: "Nurture, High CLV" },
  { uid: "Nurture, Medium CLV", name: "Nurture, Medium CLV" },
  { uid: "Nurture, Low CLV", name: "Nurture, Low CLV" },

];


const INITIAL_VISIBLE_COLUMNS = ["CustomerID", "Email", "Segment", "Status", "Subsegment"];
const api_name = getCookie();
const projectName = getProjectName('project_name');

export default function MainSegmentation() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [segmentFilter, setSegmentFilter] = useState(new Set(["all"]));
  const [subsegmentFilter, setSubsegmentFilter] = useState(new Set(["all"]));
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "CustomerID",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch(`${API_1}/get_customers?api_name=${api_name}&project_name=${projectName}`);
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();
        setCustomers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    }

    fetchCustomers();
  }, []);

  const handleClick = async () => {
    await sendEmail();
    alert("Email Sent To Customers");
  };

  const handleCopyEmails = () => {
    const filteredEmails = filteredItems.map(customer => customer.Email).join("\n");
    navigator.clipboard.writeText(filteredEmails);
    alert("Emails copied to clipboard");
  };

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredCustomers = [...customers];

    if (hasSearchFilter) {
      filteredCustomers = filteredCustomers.filter((customer) =>
        customer.Email.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    if (!segmentFilter.has("all")) {
      filteredCustomers = filteredCustomers.filter(
        (customer) => segmentFilter.has(customer.Segment)
      );
    }

    if (!subsegmentFilter.has("all")) {
      filteredCustomers = filteredCustomers.filter(
        (customer) => subsegmentFilter.has(customer.Subsegment)
      );
    }

    return filteredCustomers;
  }, [customers, filterValue, segmentFilter, subsegmentFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((customer, columnKey) => {
    const cellValue = customer[columnKey];
    switch (columnKey) {
      case "CustomerID":
        return <span>{cellValue}</span>;
      case "Email":
        return <span>{cellValue}</span>;
      case "Segment":
        return <span>{cellValue}</span>;
      case "Status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[cellValue]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "Subsegment":
        return <span>{cellValue}</span>;
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const onSegmentFilterChange = (keys) => {
    setSegmentFilter(keys);
  };

  const onSubsegmentFilterChange = (keys) => {
    setSubsegmentFilter(keys);
  };

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by email..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Segment
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Segment Filter"
                closeOnSelect={false}
                selectedKeys={segmentFilter}
                selectionMode="multiple"
                onSelectionChange={onSegmentFilterChange}
              >
                <DropdownItem key="all" className="capitalize">
                  All
                </DropdownItem>
                {segmentOptions.map((segment) => (
                  <DropdownItem key={segment.uid} className="capitalize">
                    {capitalize(segment.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Subsegment
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Subsegment Filter"
                closeOnSelect={false}
                selectedKeys={subsegmentFilter}
                selectionMode="multiple"
                onSelectionChange={onSubsegmentFilterChange}
              >
                <DropdownItem key="all" className="capitalize">
                  All
                </DropdownItem>
                {subsegmentOptions.map((subsegment) => (
                  <DropdownItem key={subsegment.uid} className="capitalize">
                    {capitalize(subsegment.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button color="primary" endContent={<PlusIcon />} onClick={handleClick}>
              Send Marketing Email
            </Button>
            <Button color="success" onClick={handleCopyEmails}>
              Copy Emails
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {customers.length} customers
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    segmentFilter,
    subsegmentFilter,
    visibleColumns,
    onRowsPerPageChange,
    customers.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <Table
      aria-label="Customer table with filtering, pagination, and email copy"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={"No customers found"} items={sortedItems}>
        {(item) => (
          <TableRow key={item.CustomerID}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}







