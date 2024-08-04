"use client"

import React, {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';

const RadarChart = ({ recency, frequency, monetaryValue ,title,color}) => {

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null; // Render nothing during server-side rendering
    }


    // Data for the radar chart
    const data = [
        {
            type: 'scatterpolar',
            theta: ['Recency', 'Frequency', 'Monetary Value'],
            r: [recency, frequency, monetaryValue],
            fill: 'toself',
            marker: {
                color: color // Change color as needed
            }
        }
    ];

    // Layout for the radar chart
    const layout = {
        title:title,
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 150] // Set range as needed based on your data
            }
        },
        angularaxis: { showline: false, showgrid: false },
        showlegend: false
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: '80%', height: '400px' }}
            config={{ responsive: true }}
        />
    );
};

export default RadarChart;
