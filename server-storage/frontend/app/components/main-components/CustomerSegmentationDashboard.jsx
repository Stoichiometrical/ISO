import React, {useEffect, useState} from "react";
import {API_1, getCookie, getProjectName} from "@/lib/utils";

export default function CustomerSegmentDashboard() {
    const [segmentData, setSegmentData] = useState([]);
    const [subsegmentData, setSubsegmentData] = useState([]);

    // Use your method to get the api_name and projectName
    const api_name = getCookie('api_name');
    const projectName = getProjectName('project_name');

    useEffect(() => {
        const fetchSegmentData = async () => {
            try {
                const response = await fetch(`${API_1}/${api_name}/get-segment-details`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        project_name: projectName
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    const formattedSegmentData = [
                        { label: 'High Value Customers', value: data.Segment["High Value"], colors: ['#48bb78', '#38a169'] },  // green colors
                        { label: 'Customers To Nurture', value: data.Segment.Nurture, colors: ['#63b3ed', '#3182ce'] },  // blue colors
                        { label: 'Customers At Risk', value: data.Segment.Risk, colors: ['#f56565', '#c53030'] },  // red colors
                    ];

                    const formattedSubsegmentData = Object.entries(data.Subsegment).map(([key, value]) => ({
                        label: key,
                        value: value,
                        colors: ['#D9D9D9', '#A9A9A9'],  // gray colors
                    }));

                    setSegmentData(formattedSegmentData);
                    setSubsegmentData(formattedSubsegmentData);
                } else {
                    console.error('Failed to fetch segment data');
                }
            } catch (error) {
                console.error('Error fetching segment data:', error);
            }
        };

        fetchSegmentData();
    }, [api_name, projectName]);

    return (
        <div>
            <div className="font-bold text-center text-xl my-2">Customer Segments</div>
            <div className="flex space-x-4 p-3 border shadow border-gray-300 rounded-xl m-2">
                {segmentData.map((item) => (
                    <div
                        key={item.label}
                        className="flex flex-col items-center justify-center rounded-lg p-4 shadow-md text-white"
                        style={{backgroundImage: `linear-gradient(to right, ${item.colors[0]}, ${item.colors[1]})`}}
                    >
                        <div className="font-semibold text-lg mb-2">{item.label}</div>
                        <div className="text-4xl font-bold flex-grow-0"
                             style={{fontSize: 'fit-content'}}>{item.value}%
                        </div>
                    </div>
                ))}
            </div>
            <div className="font-bold text-center text-xl my-2">Detailed Subsegments</div>
            <div className="grid grid-cols-3 gap-2 p-3 border shadow border-gray-300 rounded-xl m-2">

                {subsegmentData.map((item) => (
                    <div
                        key={item.label}
                        className="flex flex-col items-center justify-center rounded-lg p-4 shadow-md text-white"
                        style={{backgroundImage: `linear-gradient(to right, ${item.colors[0]}, ${item.colors[1]})`}}
                    >
                        <div className="font-semibold text-md mb-2">{item.label}</div>
                        <div className="text-3xl font-bold flex-grow-0"
                             style={{fontSize: 'fit-content'}}>{item.value}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}