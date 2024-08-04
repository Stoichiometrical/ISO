"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {getCookie} from "@/lib/utils";

export default function ReportPicker({onReportChange}) {
  const [position, setPosition] = React.useState("bottom");
  const api_name = getCookie()


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Select Report</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Report</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={(value)=>{
          setPosition(value)
          onReportChange(value)
        }}>
          <DropdownMenuRadioItem value={api_name}>May 2024</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="api_2">
            June 2024
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="api_3">July 2024</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
