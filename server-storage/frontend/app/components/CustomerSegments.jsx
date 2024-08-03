
import RadarChart from "@/app/components/charts/RadarChart";

import Customers from "@/app/components/Customers";

export default function CustomerSegments() {
  return (
    <div className="my-6 flex flex-col">
      <div className="text-center text-xl font-bold">Customer Segments</div>
      <div className="flex justify-around">
        <RadarChart
          recency="29"
          frequency="40"
          monetaryValue="100"
          title="High Value"
          color="green"
        />
        <RadarChart
          recency="40"
          frequency="40"
          monetaryValue="80"
          title="Need Nurturing"
          color="orange"
        />
        <RadarChart
          recency="50"
          frequency="40"
          monetaryValue="10"
          title="Risk Of Losing"
          color="red"
        />
      </div>
      <div className="mx-5 box-border">
        <Customers />
      </div>
    </div>
  );
}
