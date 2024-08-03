"use client"

import {DescriptionAccordion} from "@/components/ui/accordion";
import {Snippet} from "@nextui-org/react";
import {BsDownload} from "react-icons/bs";
import Stepper from "@/components/ui/stepper";
import {useEffect, useState} from "react";
import {API_2,  formatMarkdown, getCookie, getProjectName} from "@/lib/utils";

export default function PrescriptiveLab(){
    const [salesRecommendations, setSalesRecommendations] = useState('');
    const [customerRecommendations, setCustomerRecommendations] = useState('');
    const api_name = getCookie()
    const projectName = getProjectName('project_name');


    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await fetch(`${API_2}/${api_name}/get-recommendations?project_name=${projectName}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSalesRecommendations(formatMarkdown(data.sales_recommendations));
                    setCustomerRecommendations(formatMarkdown(data.customer_segmentation_recommendations));
                } else {
                    console.error('Failed to fetch recommendations:', response.status);
                    // Handle errors or set default values to state variables
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                // Handle errors or set default values to state variables
            }
        };

        fetchRecommendations(); // Call the function to fetch data

    }, [api_name, projectName]);

    return(
        <div className="">
            <div className="">
                <div className="text-xl font-bold text-center">Prescriptive Analytics Lab</div>
                <div className="">Here you can get recommendations on how to optimize your sales</div>
            </div>

            <div className="flex flex-col gap-2 my-2">
                <div className="font-bold text-xl">Recommended Strategies </div>
                <div className="">

                    <DescriptionAccordion second={customerRecommendations} first_title="Sales Forecast"
                                          first={salesRecommendations} second_title="Customer Segmentation"/>
                </div>
                <div className="my-2">
                    <Stepper/>



                    <div className="flex flex-col border border-gray-100 rounded-xl p-4 gap-2 my-2">
                        <div className="flex justify-between">
                            Download Final Report
                            <BsDownload  className="text-xl cursor-pointer text-green-600 font-bold"/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="">Copy API Link Structure</div>
                            {/*<Snippet className="rounded-lg p-1">https://intelligentsales.com/v2/January_xcvT5829WuJ5</Snippet>*/}
                             <Snippet className="rounded-lg p-1">{`https://intelligentsales.com/${api_name}/endpoint?project_name=${projectName}`}</Snippet>

                        </div>


                    </div>



                </div>
            </div>

        </div>
    )
}