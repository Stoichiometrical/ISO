import React from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

const months = [
  { label: "January", value: "january" },
  { label: "February", value: "february" },
  { label: "March", value: "march" },
  { label: "April", value: "april" },
  { label: "May", value: "may" },
  { label: "June", value: "june" },
  { label: "July", value: "july" },
  { label: "August", value: "august" },
  { label: "September", value: "september" },
  { label: "October", value: "october" },
  { label: "November", value: "november" },
  { label: "December", value: "december" },
];

export default function SelectMonth() {
  return (
    <Autocomplete
      defaultItems={months}
      label="Select Month"
      placeholder="Search a month"
      className="max-w-xs"
    >
      {(month) => (
        <AutocompleteItem key={month.value}>{month.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
}
