import React from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

const data = [
  {
    cluster: "Cluster A",
    subjects: [
      { name: "Age", value: 120 },
      { name: "Income", value: 110 },
      { name: "Spending", value: 130 },
      { name: "Loyalty", value: 140 },
    ],
  },
  {
    cluster: "Cluster B",
    subjects: [
      { name: "Age", value: 100 },
      { name: "Income", value: 90 },
      { name: "Spending", value: 120 },
      { name: "Loyalty", value: 110 },
    ],
  },
  {
    cluster: "Cluster C",
    subjects: [
      { name: "Age", value: 110 },
      { name: "Income", value: 120 },
      { name: "Spending", value: 100 },
      { name: "Loyalty", value: 130 },
    ],
  },
];

export default function R2() {
  return (
    <RadarChart outerRadius={90} width={730} height={250} data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="name" />
      <PolarRadiusAxis angle={30} domain={[0, 150]} />
      {data.map((entry, index) => (
        <Radar
          key={index}
          name={entry.cluster}
          dataKey="value"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.6}
        />
      ))}
      <Legend />
    </RadarChart>
  );
}
