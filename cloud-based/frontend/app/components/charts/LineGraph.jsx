
"use client";
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { API_URL } from "@/lib/utils";
import { readString } from "react-papaparse";
import useDataStore from "@/hooks/useDataStore";

const SalesForecastGraph = () => {
    const [dates, setDates] = useState([]);
    const [volumes, setVolumes] = useState([]);
    const setApiName = useDataStore((state) => state.setApiName);
    const api_name = useDataStore((state) => state.api_name);

    useEffect(() => {
        const fetchForecastData = async () => {
            try {
                const response = await fetch(`${API_URL}/get_forecast?api_name=${api_name}`);
                if (!response.ok) {
                    throw new Error(`Error fetching CSV data: ${response.statusText}`);
                }
                const csvData = await response.text();
                const parsedData = readString(csvData, { header: true }).data;

                // Extract dates and volumes from parsed CSV data
                const extractedDates = parsedData.map(row => row.InvoiceDate);
                const extractedVolumes = parsedData.map(row => parseFloat(row.Quantity));

                setDates(extractedDates);
                setVolumes(extractedVolumes);
            } catch (error) {
                console.error('Error fetching CSV data:', error);
            }
        };

        fetchForecastData();
    }, []);

    // Plotly trace configuration
    const trace = {
        x: dates,
        y: volumes,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: '#00308F' },
        line: { width: 2 }
    };

    // Plotly layout configuration
    const layout = {
        title: {
            text: 'Daily Sales Volume Forecast for January',
            font: {
                family: 'Inter, sans-serif',
                size: 18,
                color: 'black',
                weight: 'bold'
            },
            xref: 'paper',
            x: 0.5, // Center the title horizontally
            y: 0.9 // Set the title position vertically
        },
        xaxis: { title: 'Date' },
        yaxis: { title: 'Sales Volume' },
        margin: { t: 50, r: 30, l: 50, b: 50 },
        autosize: true,
        titlepad: { // Add padding to the title
            t: 20, // Top padding
            r: 0, // Right padding
            b: 0, // Bottom padding
            l: 0 // Left padding
        }
    };

    return (
        <div className="flex justify-center items-center mx-5 bg-green-400 my-4">
            <Plot
                data={[trace]}
                layout={layout}
                style={{ width: '100%', height: '400px' }}
                config={{ responsive: true }}
            />
        </div>
    );
};

export default SalesForecastGraph;
