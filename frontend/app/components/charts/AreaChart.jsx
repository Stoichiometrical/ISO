"use client"
import React, {useEffect, useState} from 'react';
import {AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import SalesForecastGraph from "@/app/components/charts/LineGraph";
import {API_3, getCookie, getProjectName} from "@/lib/utils";
import useDataStore from "@/hooks/useDataStore";




// Data for the radar chart
const radarData = [
    { metric: "Purchase Frequency", HighValue: 120, Nurture: 110, Risk: 100, fullMark: 150 },
    { metric: "Lifetime Value", HighValue: 130, Nurture: 98, Risk: 115, fullMark: 150 },
    { metric: "Churn Probability", HighValue: 86, Nurture: 130, Risk: 105, fullMark: 150 },
    { metric: "Average Order Value", HighValue: 99, Nurture: 100, Risk: 95, fullMark: 150 },
    { metric: "Customer Satisfaction", HighValue: 85, Nurture: 90, Risk: 88, fullMark: 150 }
];




// export default function SalesChart() {
//     const [salesData, setSalesData] = useState([]);
//     // const api_name = useDataStore((state) => state.api_name);
//       const api_name = getCookie()
//     const projectName = getProjectName('project_name');
//     useEffect(() => {
//         async function fetchData() {
//             try {
//                 const response = await fetch(`${API_3}/get_forecast?api_name=${api_name}&project_name=${projectName}`);
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 const data = await response.json();
//                 // Convert the data to the format required by the chart
//                 const formattedData = data.map(item => ({
//                     date: item.InvoiceDate,
//                     sales: item.Quantity
//                 }));
//                 setSalesData(formattedData);
//             } catch (error) {
//                 console.error('Error fetching the sales data:', error);
//             }
//         }
//
//         fetchData();
//     }, []);
//
//     return (
//         <div className="flex-grow rounded-xl p-3 border shadow border-gray-300">
//             <h2 className="text-center mb-4">Sales Forecast For January 2024</h2>
//             <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//                     <defs>
//                         <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
//                             <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
//                         </linearGradient>
//                     </defs>
//                     <XAxis dataKey="date" scale="point" tick={{ fontSize: 11 }} />
//                     <YAxis tick={{ fontSize: 11 }} />
//                     <Tooltip />
//                     <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" />
//                 </AreaChart>
//             </ResponsiveContainer>
//         </div>
//     );
// }

export default function SalesChart() {
    const [salesData, setSalesData] = useState([]);

    // Use your method to get the api_name and projectName
    const api_name = getCookie('api_name');
    const projectName = getProjectName('project_name');

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`${API_3}/${api_name}/get_forecast?project_name=${projectName}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                // Convert the data to the format required by the chart
                const formattedData = data.map(item => ({
                    date: item.InvoiceDate,
                    sales: item.Quantity
                }));
                setSalesData(formattedData);
            } catch (error) {
                console.error('Error fetching the sales data:', error);
            }
        }

        fetchData();
    }, [api_name, projectName]);

    return (
        <div className="flex-grow rounded-xl p-3 border shadow border-gray-300">
            <h2 className="text-center mb-4">Sales Forecast For January 2024</h2>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" scale="point" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}


// CustomerSegmentRadarChart Component
export function CustomerSegmentRadarChart() {
    return (
        <div className="flex-grow rounded-xl p-3">
            <h2 className="text-center mb-4">Customer Segments Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={60} domain={[0, 150]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Radar name="High Value" dataKey="HighValue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    <Radar name="Nurture" dataKey="Nurture" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                    <Radar name="Risk" dataKey="Risk" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Container Component
export function ChartContainer() {
    return (
        <div className="flex gap-3 w-full my-2">
            <div className="flex-grow">
                <SalesChart />

            </div>
            <div className="flex-grow">
                <CustomerSegmentRadarChart />
            </div>
        </div>
    );
}










