"use client"

import {FaCaretDown, FaCaretUp} from "react-icons/fa";
import {useEffect, useState} from "react";
import {API_1, API_3, getCookie, getProjectName} from "@/lib/utils";


export default function PromoPeriods({children}){
    return(
        <div className="flex flex-col gap-3 my-3">
            <div className="text-xl font-semibold text-center">Recommended Promotional Periods</div>
            <div className="flex items-center gap-3 flex-wrap">

                {children}
            </div>

        </div>
    )
}




export function PromoSect() {
    const [promoPeriods, setPromoPeriods] = useState([]);
    const api_name = getCookie('api_name');
    const projectName = getProjectName('project_name');

    useEffect(() => {
        async function fetchPromoPeriods() {
            try {
                const response = await fetch(`${API_3}/${api_name}/get_promo_days?project_name=${projectName}`);
                 
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log("Periods: ",data)
                setPromoPeriods(data);
            } catch (error) {
                console.error('Error fetching the promotional periods:', error);
            }
        }

        fetchPromoPeriods();
    }, [api_name, projectName]);

    return (
        <div className="shadow border border-gray-100 p-2 w-1/4 rounded-xl my-2">
            <div className="flex flex-col">
                <div className="font-bold my-2 text-center">Recommended Promotional Periods</div>
                {promoPeriods.map((promo, index) => (
                    <div key={index} className="flex justify-between items-center p-2">
                        <div>{promo.Date}</div>
                        <div className="flex gap-2 items-center justify-center">
                            <div>{promo["Promotion Type"]}</div>
                            {promo["Promotion Type"] === 'Peak' ? (
                                <FaCaretUp className="text-2xl text-green-600" />
                            ) : (
                                <FaCaretDown className="text-2xl text-red-600" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


