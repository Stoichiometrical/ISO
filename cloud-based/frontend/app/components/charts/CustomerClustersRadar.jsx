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
    category: "Cluster A",
    Spending: 120,
    Income: 110,
    Loyalty: 130,
    Age: 140,
    fullMark: 150,
  },
  {
    category: "Cluster B",
    Spending: 100,
    Income: 90,
    Loyalty: 120,
    Age: 110,
    fullMark: 150,
  },
  {
    category: "Cluster C",
    Spending: 110,
    Income: 120,
    Loyalty: 100,
    Age: 130,
    fullMark: 150,
  },
  {
    category: "Cluster D",
    Spending: 105,
    Income: 115,
    Loyalty: 105,
    Age: 125,
    fullMark: 150,
  },
];

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

const data2 = [
  {
    subject: "Spending",
    A: 120,
    B: 110,
    C: 90,
    D: 85,
  },
  {
    subject: "Income",
    A: 98,
    B: 130,
    C: 110,
    D: 95,
  },
  {
    subject: "Loyalty",
    A: 86,
    B: 130,
    C: 120,
    D: 80,
  },
  {
    subject: "Age",
    A: 99,
    B: 100,
    C: 105,
    D: 92,
  },
  {
    subject: "Frequency",
    A: 99,
    B: 100,
    C: 97,
    D: 88,
  },
];

const CustomerClustersRadar = () => {
  return (
    <div className="my-3">
      <div className="">
        <h2 className="text-center font-bold text-xl my-5">
          Customer Clusters
        </h2>
      </div>
      <div className="flex flex-wrap justify-around">
        <RadarChart outerRadius={90} width={300} height={250} data={data2}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 150]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Cluster A"
            dataKey="A"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Legend />
        </RadarChart>

        <RadarChart outerRadius={90} width={300} height={250} data={data2}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 150]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Cluster B"
            dataKey="B"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
          />
          <Legend />
        </RadarChart>

        <RadarChart outerRadius={90} width={300} height={250} data={data2}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 150]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Cluster C"
            dataKey="C"
            stroke="#ffc658"
            fill="#ffc658"
            fillOpacity={0.6}
          />
          <Legend />
        </RadarChart>

        <RadarChart outerRadius={90} width={300} height={250} data={data2}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 150]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Cluster D"
            dataKey="D"
            stroke="#ff7300"
            fill="#ff7300"
            fillOpacity={0.6}
          />
          <Legend />
        </RadarChart>
      </div>

      <h2 className="text-center font-bold text-xl my-5">
        Customer Clusters(Intra-segmnent Analysis)
      </h2>

      <div className="flex flex-wrap justify-around">
        {Object.keys(data[0])
          .slice(1, -1)
          .map((attribute, index) => (
            <RadarChart
              key={attribute}
              outerRadius={90}
              width={300}
              height={300}
              data={data}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} />
              <Radar
                name={attribute}
                dataKey={attribute}
                stroke={colors[index]}
                fill={colors[index]}
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          ))}
      </div>
    </div>
  );
};

export default CustomerClustersRadar;
