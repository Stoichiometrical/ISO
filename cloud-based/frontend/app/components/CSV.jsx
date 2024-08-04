"use client";

import React, { useState } from "react";

const CSVExport = () => {
  const [data, setData] = useState([
    { name: "John", age: 30, city: "New York" },
    { name: "Jane", age: 25, city: "San Francisco" },
    { name: "Doe", age: 40, city: "Los Angeles" },
  ]);

  const exportToCSV = () => {
    const csvData = data
      .map((row) => {
        return Object.values(row).join(",");
      })
      .join("\n");

    const csvBlob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(csvBlob);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button onClick={exportToCSV}>Export to CSV</button>
    </div>
  );
};

export default CSVExport;
