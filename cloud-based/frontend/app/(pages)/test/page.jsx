"use client";
import DatePicker from "@/app/components/DatePicker";
import { format } from "date-fns";
import SegmentPicker from "@/app/components/SegmentPicker";
import ReportPicker from "@/app/components/ReportPicker";

import PromoSection from "@/app/components/PromoSection";
import Shopping from "@/app/components/Shopping";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {API_1, API_URL, getCookie, getProjectName} from "@/lib/utils";
import usePromotionStore from "@/hooks/usePromotionStore";
import useCartStore from "@/hooks/useCartStore";
import MainSegmentation from "@/app/components/segmentation/MainSegmentation";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";


export default function TestLab() {
    // State variables to hold selected values
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [apiName, setApiName] = useState('');
    const [projectName, setProjectName] = useState('');

    const promotionStore = usePromotionStore();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Client-side only code
            setApiName(getCookie());
            setProjectName(getProjectName('project_name'));
        }
    }, []);

    // Callback functions to update selected values
    const handleDateChange = (date) => {
        const formattedDate = format(date, "MMMM d, yyyy");
        setSelectedDate(formattedDate);
    };

    const handleSegmentChange = (segment) => {
        setSelectedSegment(segment);
    };

    const handleReportChange = (report) => {
        setSelectedReport(report);
    };

    const runTest = async () => {
        if (!selectedDate || !selectedSegment ) {
            alert("Please select all attributes before running the test");
            return;
        }

        try {
            // Convert the selectedDate format (assuming formatDate exists)
            const formattedDate = formatDate(selectedDate);

            // Make the GET request to the API endpoint with the serialized offers
            const response = await fetch(
                `${API_1}/${apiName}/get_offers?date=${formattedDate}&segment=${selectedSegment}&project_name=${projectName}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            // Handle successful response
            const responseData = await response.json();
            console.log("Response Data: ", responseData);

            // Handle the promotions data as needed
            if (Object.keys(responseData).length > 0) {
                // Handle valid offers
                promotionStore.setIsPromotion(true);
                promotionStore.setPromotion(responseData);
                console.log("Valid offers:", responseData);
            } else {
                // Handle no valid offers
                promotionStore.setIsPromotion(false);
                console.log("No valid offers found.");
            }

            // Reset the cart state
            useCartStore.getState().cart = {};
        } catch (error) {
            console.error("Error running test:", error);
        }
    };

    // Function to format the date
    const formatDate = (dateString) => {
        // Parse the date string
        const parsedDate = new Date(dateString);

        // Get the year, month, and day components
        const year = parsedDate.getFullYear();
        const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
        const day = parsedDate.getDate().toString().padStart(2, "0");

        // Format the date in "YYYY-MM-DD" format
        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate;
    };

    const tabs = [
        {
            title: "Sales Simulation",
            value: "product",
            content: (
                <div className="flex flex-col p-4 gap-5">
                    <div className="text-center font-bold text-2xl">Select Attributes</div>
                    <div className="flex justify-around items-center">
                        <DatePicker onDateChange={handleDateChange}/>
                        <SegmentPicker onSegmentChange={handleSegmentChange}/>
                        <ReportPicker onReportChange={handleReportChange}/>
                        <Button onClick={runTest}>Run Test</Button>
                    </div>

                    {promotionStore.isPromotion && (
                        <PromoSection
                            promotions={promotionStore.promotion}
                            segment={selectedSegment}
                        />
                    )}
                    <div className="flex flex-col">
                        <div className="text-xl font-bold text-center">
                            Shopping Simulation
                        </div>
                        <Shopping/>
                    </div>
                </div>
            ),
        },
        {
            title: "Marketing Simulation",
            value: "marketing",
            content: (
                <div
                    className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900">
                    <MainSegmentation/>
                </div>
            ),
        }
    ];

    return (
        <div className="flex flex-col">
            <div className="flex flex-col my-2 gap-2 items-center justify-center">
                <div className="text-xl font-bold">Test Lab</div>
                <div className="">See your ideas in action</div>
            </div>

            <div className="flex w-full flex-col my-2">
                <Tabs defaultValue="sales" className="w-full mx-auto">
                    <TabsList className="w-full flex justify-center mb-2">
                        <TabsTrigger value="sales" className="flex-1 text-center p-2">Sales Simulation</TabsTrigger>
                        <TabsTrigger value="marketing" className="flex-1 text-center p-2">Marketing Lab</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sales">
                        <div className="flex flex-col p-4 gap-5 w-full">
                            <div className="text-center font-bold text-2xl">Select Attributes To Start Sales Simulation</div>
                            <div className="flex justify-around items-center">
                                <DatePicker onDateChange={handleDateChange}/>
                                <SegmentPicker onSegmentChange={handleSegmentChange}/>
                                <Button onClick={runTest}>Run Test</Button>
                            </div>
                            {promotionStore.isPromotion && (
                                <PromoSection promotions={promotionStore.promotion} segment={selectedSegment}/>
                            )}
                            <div className="flex flex-col">
                                <div className="text-xl font-bold text-center">Shopping Simulation</div>
                                <Shopping/>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="marketing">
                        <div className="text-3xl font-bold text-center my-4">Customer Actions</div>
                        <MainSegmentation/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

