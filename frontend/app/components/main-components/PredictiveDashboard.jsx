"use client";
import Hydration from "@/app/components/Hydration";
import PromoPeriods, {PromoSect} from "@/app/components/PromoPeriods";
import useDataStore from "@/hooks/useDataStore";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import {useEffect, useState} from "react";
import {API_2, API_3, API_URL, formatMarkdown, getCookie, getProjectName} from "@/lib/utils";
import SalesChart, {ChartContainer, CustomerSegmentRadarChart} from "@/app/components/charts/AreaChart";

import { DescriptionAccordion} from "@/components/ui/accordion";
import {BusinessObjectivesModal} from "@/components/ui/create-modal";
import CustomerSegmentDashboard from "@/app/components/main-components/CustomerSegmentationDashboard";


export default function PredictiveLab() {
    // const api_name = useDataStore((state) => state.api_name);
    const api_name = getCookie();
    const projectName = getProjectName('project_name');
    console.log("API_NAME : ", api_name);
    const [promoPeriods, setPromoPeriods] = useState([]);
    const clusters = [
        {
            data: [
                { name: "Age", value: 35 },
                { name: "Income", value: 40000 },
                { name: "Spending", value: 600 },
                { name: "Loyalty", value: 8 },
            ],
        },
        {
            data: [
                { name: "Age", value: 45 },
                { name: "Income", value: 60000 },
                { name: "Spending", value: 700 },
                { name: "Loyalty", value: 6 },
            ],
        },
        {
            data: [
                { name: "Age", value: 28 },
                { name: "Income", value: 30000 },
                { name: "Spending", value: 500 },
                { name: "Loyalty", value: 7 },
            ],
        },
        {
            data: [
                { name: "Age", value: 55 },
                { name: "Income", value: 80000 },
                { name: "Spending", value: 800 },
                { name: "Loyalty", value: 9 },
            ],
        },
    ];


    // useEffect(() => {
    //     const fetchPromoData = async () => {
    //         try {
    //             const response = await fetch(`${API_3}/get_promo_days?api_name=${api_name}&project_name=${projectName}`);
    //             if (!response.ok) {
    //                 throw new Error(`Error fetching promo data: ${response.statusText}`);
    //             }
    //
    //             const promoData = await response.json();
    //             setPromoPeriods(promoData); // Assuming you add a promoPeriods state variable
    //
    //         } catch (error) {
    //             console.error("Error fetching promo data:", error);
    //         }
    //     };
    //
    //     fetchPromoData();
    // }, [api_name]); // Fetch whenever api_name changes


    const [salesRecommendations, setSalesRecommendations] = useState('');
    const [customerSegmentationRecommendations, setCustomerSegmentationRecommendations] = useState('');



       useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await fetch(`${API_2}/${api_name}/get-sales-descriptions?project_name=${projectName}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const { sales_description } = data;
                    setSalesRecommendations(formatMarkdown(sales_description)); // Format and set to state
                } else {
                    setSalesRecommendations('Failed to load sales recommendations.');
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                setSalesRecommendations('Error loading sales recommendations.');
            }
        };

        const fetchSegmentDescription = async () => {
            try {
                const response = await fetch(`${API_2}/${api_name}/get-segmentation-description?project_name=${projectName}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const { analysis } = data;
                    setCustomerSegmentationRecommendations(formatMarkdown(analysis)); // Format and set to state
                } else {
                    setCustomerSegmentationRecommendations('Failed to load customer segmentation recommendations.');
                }
            } catch (error) {
                console.error('Error fetching segmentation description:', error);
                setCustomerSegmentationRecommendations('Error loading customer segmentation recommendations.');
            }
        };

        fetchSales();
        fetchSegmentDescription();
    }, [api_name, projectName]);


    return (
        <main className="w-full">
            <SignedIn>
                <div className="flex flex-col font-semibold">
                    <span className="text-2xl">Welcome to the Predictive Lab!</span>
                    <span className="">Here is the current state of your customers and sales project</span>



                </div>
                <Hydration>
                    {/*<SalesForecastGraph/>*/}
                    <ChartContainer/>
                    <div className="flex ">
                        <PromoSect/>
                        <CustomerSegmentDashboard/>

                    </div>

                    <div className="flex flex-col my-2 rounded-xl shadow p-2 items center">
                        <div className="text-center font-bold">Detailed Description On The Current Sales Status</div>
                        <DescriptionAccordion second={customerSegmentationRecommendations} first_title="Sales Forecast"
                                   first={salesRecommendations} second_title="Customer Segmentation"/>

                    </div>

                    {/*Define Business Goals*/}
                    <div className="flex flex-col gap-2 justify-center items-center mb-6">
                        <div className="text-center font-bold ">Define Business Goals</div>
                        <BusinessObjectivesModal/>

                    </div>

                    <div className="italic my-3">Please proceed to Prescriptive Lab for detailed recommendations</div>

                </Hydration>

            </SignedIn>

        </main>
    );
}
