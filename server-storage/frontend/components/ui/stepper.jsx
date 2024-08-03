"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {  message, Steps, theme } from "antd";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useDataStore from "@/hooks/useDataStore";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Lottie from "lottie-react";

import {API_1, getCookie, getProjectName} from "@/lib/utils";
import {CircularProgress} from "@nextui-org/react";



const Stepper = () => {
    const [current, setCurrent] = useState(0);
    const [selectedOffers, setSelectedOffers] = useState([]);
    const [fixed_amount_tiers, setFixedAmountTiers] = useState([{ threshold: "", discount: "" }]);
    const [percent_tiers, setPercentTiers] = useState([{ threshold: "", discount: "" }]);
    const [marginReduction, setMarginReduction] = useState({ min: 0, max: 0 });
    const [loyalty_points, setLoyaltyPoints] = useState(0);
    const [high_value_loyalty_points, setHighValueLoyaltyPoints] = useState(0);
    const [bogd, setIsBogdSelected] = useState(false);
    const api_name = getCookie();
    const projectName = getProjectName('project_name');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);


    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        if (value === "Buy One, Get One Discounted") {
            setIsBogdSelected(checked);
        } else {
            if (checked) {
                if (!selectedOffers.includes(value)) {
                    setSelectedOffers([...selectedOffers, value]);
                }
            } else {
                setSelectedOffers(selectedOffers.filter((offerId) => offerId !== value));
            }
        }
    };

    const handleFixedAmountChange = (index, field, value) => {
        const updatedTiers = [...fixed_amount_tiers];
        updatedTiers[index][field] = value;
        setFixedAmountTiers(updatedTiers);
    };

    const handlePercentTiersChange = (index, field, value) => {
        const updatedTiers = [...percent_tiers];
        updatedTiers[index][field] = value;
        setPercentTiers(updatedTiers);
    };

    const addTier = (type) => {
        if (type === "fixedAmount") {
            setFixedAmountTiers([...fixed_amount_tiers, { threshold: "", discount: "" }]);
        } else if (type === "percent") {
            setPercentTiers([...percent_tiers, { threshold: "", discount: "" }]);
        }
    };

    const removeTier = (index, type) => {
        if (type === "fixedAmount") {
            const updatedTiers = [...fixed_amount_tiers];
            updatedTiers.splice(index, 1);
            setFixedAmountTiers(updatedTiers);
        } else if (type === "percent") {
            const updatedTiers = [...percent_tiers];
            updatedTiers.splice(index, 1);
            setPercentTiers(updatedTiers);
        }
    };

    const handleMinReductionChange = (event) => {
        const { value } = event.target;
        setMarginReduction((prev) => ({ ...prev, min: value }));
    };

    const handleMaxReductionChange = (event) => {
        const { value } = event.target;
        setMarginReduction((prev) => ({ ...prev, max: value }));
    };

    const handleLoyaltyPointsChange = (event) => {
        const { value } = event.target;
        setLoyaltyPoints(value);
    };

    const handleHighValueLoyaltyPointsChange = (event) => {
        const { value } = event.target;
        setHighValueLoyaltyPoints(value);
    };

    const handleFinalize = () => {
        setIsLoading(true);

        const parseTiers = (tiers) => tiers.map(tier => ({
            threshold: parseFloat(tier.threshold),
            discount: parseFloat(tier.discount)
        }));

        const selectedOffersData = {
            selectedOffers,
            marginReduction: {
                min: parseFloat(marginReduction.min),
                max: parseFloat(marginReduction.max)
            },
            loyalty_points: parseFloat(loyalty_points),
            high_value_loyalty_points: parseFloat(high_value_loyalty_points),
            fixed_amount_tiers: parseTiers(fixed_amount_tiers),
            percent_tiers: parseTiers(percent_tiers),
            bogd,
        };

        console.log(selectedOffersData);

        // fetch(`${API_1}/generate_api_data/${api_name}`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(selectedOffersData),
        // })
        //     .then((response) => response.json())
        //     .then((data) => {
        //         console.log("Success:", data);
        //         setSuccessMessage("API request completed successfully!");
        //     })
        //     .catch((error) => {
        //         console.error("Error:", error);
        //         setSuccessMessage("An error occurred during the API request.");
        //     })
        //     .finally(() => {
        //         setIsLoading(false);
        //     });

        fetch(`${API_1}/generate_api_data/${api_name}/${projectName}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedOffersData),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Success:", data);
            setSuccessMessage("API request completed successfully!");
        })
        .catch((error) => {
            console.error("Error:", error);
            setSuccessMessage("An error occurred during the API request.");
        })
        .finally(() => {
            setIsLoading(false);
        });

    };

    const steps = [
        {
            title: <span className="text-black dark:text-white">Select Offers</span>,
            content: (
                <Card>
                    <CardHeader>
                        <CardTitle>Offers</CardTitle>
                        <CardDescription>Select the Offers For This Month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 flex flex-col">
                        <div className="flex gap-2">
                            <input
                                type="checkbox"
                                id="first"
                                onChange={handleCheckboxChange}
                                value="Fixed Amount Discount"
                            />
                            <label htmlFor="first">Fixed Amount Discount</label>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="checkbox"
                                id="second"
                                onChange={handleCheckboxChange}
                                value="Bundled Discount"
                            />
                            <label htmlFor="second">Bundled Discount</label>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="checkbox"
                                id="third"
                                onChange={handleCheckboxChange}
                                value="Tiered Discounts"
                            />
                            <label htmlFor="third">Tiered Discounts</label>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="checkbox"
                                id="fourth"
                                onChange={handleCheckboxChange}
                                value="Buy One, Get One Discounted"
                            />
                            <label htmlFor="fourth">Buy One, Get One Discounted</label>
                        </div>
                    </CardContent>
                </Card>
            ),
        },
        {
            title: <span className="text-black dark:text-white">Create Offers</span>,
            content: (
                <Card>
                    <CardHeader>
                        <CardTitle>Create Offers</CardTitle>
                        <CardDescription>Customize Offer Metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-4">
                                <div>
                                    <label htmlFor="minReduction">Min Reduction:</label>
                                    <Input
                                        type="number"
                                        id="minReduction"
                                        onChange={handleMinReductionChange}
                                        className="my-3"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="maxReduction">Max Reduction:</label>
                                    <Input
                                        type="number"
                                        id="maxReduction"
                                        onChange={handleMaxReductionChange}
                                        className="my-3"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="loyalty_points">Loyalty Points:</label>
                                <Input
                                    type="number"
                                    id="loyalty_points"
                                    onChange={handleLoyaltyPointsChange}
                                    className="my-3"
                                />
                            </div>
                            <div>
                                <label htmlFor="high_value_loyalty_points">High-Value Loyalty Points:</label>
                                <Input
                                    type="number"
                                    id="high_value_loyalty_points"
                                    onChange={handleHighValueLoyaltyPointsChange}
                                    className="my-3"
                                />
                            </div>
                            {selectedOffers.includes("Fixed Amount Discount") && (
                                <div>
                                    <h3>Fixed Amount Discounts</h3>
                                    {fixed_amount_tiers.map((tier, index) => (
                                        <div key={index}>
                                            <Input
                                                type="number"
                                                placeholder="Threshold"
                                                value={tier.threshold}
                                                className="my-2"
                                                onChange={(e) =>
                                                    handleFixedAmountChange(index, "threshold", e.target.value)
                                                }
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Discount"
                                                value={tier.discount}
                                                className="mb-1"
                                                onChange={(e) =>
                                                    handleFixedAmountChange(index, "discount", e.target.value)
                                                }
                                            />
                                            <div className="flex justify-between my-1.5">
                                                <Button
                                                    type="button"
                                                    onClick={() => addTier("fixedAmount")}
                                                    className="bg-green-700"
                                                >
                                                    Add Tier
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    type="button"
                                                    onClick={() => removeTier(index, "fixedAmount")}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedOffers.includes("Tiered Discounts") && (
                                <div>
                                    <h3>Tiered Discounts</h3>
                                    {percent_tiers.map((tier, index) => (
                                        <div key={index}>
                                            <Input
                                                type="number"
                                                placeholder="Threshold"
                                                value={tier.threshold}
                                                className="my-2"
                                                onChange={(e) =>
                                                    handlePercentTiersChange(index, "threshold", e.target.value)
                                                }
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Discount"
                                                value={tier.discount}
                                                className="mb-1"
                                                onChange={(e) =>
                                                    handlePercentTiersChange(index, "discount", e.target.value)
                                                }
                                            />
                                            <div className="flex justify-between my-1.5">
                                                <Button
                                                    type="button"
                                                    onClick={() => addTier("percent")}
                                                    className="bg-green-700"
                                                >
                                                    Add Tier
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    type="button"
                                                    onClick={() => removeTier(index, "percent")}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ),
        },
        {
            title: <span className="text-black dark:text-white">Review</span>,
            content: (
                <Card>
                    <CardHeader>
                        <CardTitle>Review</CardTitle>
                        <CardDescription className="font-bold">Review Your Selections</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <h3 className="font-bold">Selected Offers</h3>
                        <p>{selectedOffers.join(', ')}</p>

                        <h3 className="font-semibold">Profit Margin Reduction</h3>
                        <div className="flex gap-2">
                            <div className="">Min: {marginReduction.min} %</div>
                            <div className="">Max: {marginReduction.max} %</div>
                        </div>

                        <div className="font-semibold">Loyalty Points: {loyalty_points}</div>

                        <div className="font-semibold">High-Value Loyalty Points: {high_value_loyalty_points}</div>

                        {selectedOffers.includes("Fixed Amount Discount") && (
                            <div>
                                <h3 className="font-semibold">Fixed Amount Discounts</h3>
                                {fixed_amount_tiers.map((tier, index) => (
                                    <div key={index}>
                                        <p>Threshold: {tier.threshold}</p>
                                        <p>Discount: {tier.discount}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedOffers.includes("Tiered Discounts") && (
                            <div>
                                <h3 className="font-semibold">Tiered Discounts</h3>
                                {percent_tiers.map((tier, index) => (
                                    <div key={index}>
                                        <p>Threshold: {tier.threshold}</p>
                                        <p>Discount: {tier.discount}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {bogd && (
                            <div>
                                <div className="font-semibold">Buy One, Get One Discounted</div>
                            </div>
                        )}
                        <div className="py-2.5">
                            <Button
                                type="button"
                                onClick={handleFinalize}
                                className="w-full bg-blue-600 text-white py-2 px-3"
                            >
                                Finalize and Send Request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ),
        }
    ];

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="text-xl font-bold text-center">Customize Your Offers</div>
            <Steps current={current} className="mb-4">
                {steps.map((item, index) => (
                    <Steps.Step key={index} title={item.title} />
                ))}
            </Steps>
            <div className="step-content">{steps[current].content}</div>
            <div className="steps-action mt-3 flex justify-between">
                {current > 0 && (
                    <Button variant="outline" onClick={() => prev()}>
                        Previous
                    </Button>
                )}
                {current < steps.length - 1 && (
                    <Button onClick={() => next()}>
                        Next
                    </Button>
                )}
            </div>
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <CircularProgress label="Please Wait,Our Advanced Algorithms Are Creating Your API for you..." />
                    {/*<Lottie animationData={animationData} loop />*/}
                </div>
            ) : (
                successMessage && (
                    <Alert>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )
            )}
        </div>
    );
};

export default Stepper;



//
// const Stepper = () => {
//     const [current, setCurrent] = useState(0);
//     const [selectedOffers, setSelectedOffers] = useState([]);
//     const [fixedAmountTiers, setFixedAmountTiers] = useState([{ threshold: "", discount: "" }]);
//     const [percentTiers, setTieredTiers] = useState([{ threshold: "", discount: "" }]);
//     const [marginReduction, setMarginReduction] = useState({ min: 0, max: 0 });
//     const [loyaltyPoints, setLoyaltyPoints] = useState(0);
//     const [highValueLoyaltyPoints, setHighValueLoyaltyPoints] = useState(0);
//     const [isBogoSelected, setIsBogoSelected] = useState(false);
//     const api_name = getCookie()
//     const [isLoading, setIsLoading] = useState(false);
//     const [successMessage, setSuccessMessage] = useState(null);
//
//     const handleCheckboxChange = (event) => {
//         const { value, checked } = event.target;
//         if (value === "Buy One, Get One Discounted") {
//             setIsBogoSelected(checked);
//         } else {
//             if (checked) {
//                 if (!selectedOffers.includes(value)) {
//                     setSelectedOffers([...selectedOffers, value]);
//                 }
//             } else {
//                 setSelectedOffers(selectedOffers.filter((offerId) => offerId !== value));
//             }
//         }
//     };
//
//     const handleFixedAmountChange = (index, field, value) => {
//         const updatedTiers = [...fixedAmountTiers];
//         updatedTiers[index][field] = value;
//         setFixedAmountTiers(updatedTiers);
//     };
//
//     const handleTieredChange = (index, field, value) => {
//         const updatedTiers = [...percentTiers];
//         updatedTiers[index][field] = value;
//         setTieredTiers(updatedTiers);
//     };
//
//     const addTier = (type) => {
//         if (type === "fixedAmount") {
//             setFixedAmountTiers([...fixedAmountTiers, { threshold: "", discount: "" }]);
//         } else if (type === "tiered") {
//             setTieredTiers([...percentTiers, { threshold: "", discount: "" }]);
//         }
//     };
//
//     const removeTier = (index, type) => {
//         if (type === "fixedAmount") {
//             const updatedTiers = [...fixedAmountTiers];
//             updatedTiers.splice(index, 1);
//             setFixedAmountTiers(updatedTiers);
//         } else if (type === "tiered") {
//             const updatedTiers = [...percentTiers];
//             updatedTiers.splice(index, 1);
//             setTieredTiers(updatedTiers);
//         }
//     };
//
//     const handleMinReductionChange = (event) => {
//         const { value } = event.target;
//         setMarginReduction((prev) => ({ ...prev, min: value }));
//     };
//
//     const handleMaxReductionChange = (event) => {
//         const { value } = event.target;
//         setMarginReduction((prev) => ({ ...prev, max: value }));
//     };
//
//     const handleLoyaltyPointsChange = (event) => {
//         const { value } = event.target;
//         setLoyaltyPoints(value);
//     };
//
//     const handleHighValueLoyaltyPointsChange = (event) => {
//         const { value } = event.target;
//         setHighValueLoyaltyPoints(value);
//     };
//
//     const handleFinalize = () => {
//         setIsLoading(true);
//
//         const selectedOffersData = {
//             selectedOffers,
//             marginReduction,
//             loyaltyPoints,
//             highValueLoyaltyPoints,
//             fixedAmountTiers,
//             percentTiers,
//             isBogoSelected
//         };
//         console.log(selectedOffersData);
//
//
//         fetch(`${API_1}/generate_api_data/${api_name}`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(selectedOffersData),
//         })
//             .then((response) => response.json())
//             .then((data) => {
//                 console.log("Success:", data);
//                 setSuccessMessage("API request completed successfully!");
//             })
//             .catch((error) => {
//                 console.error("Error:", error);
//                 setSuccessMessage("An error occurred during the API request.");
//             })
//             .finally(() => {
//                 setIsLoading(false);
//             });
//     };
//
//     const steps = [
//         {
//             title: <span className="text-black dark:text-white">Select Offers</span>,
//             content: (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Offers</CardTitle>
//                         <CardDescription>Select the Offers For This Month</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2 flex flex-col">
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="first"
//                                 onChange={handleCheckboxChange}
//                                 value="Fixed Amount Discount"
//                             />
//                             <label htmlFor="first">Fixed Amount Discount</label>
//                         </div>
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="second"
//                                 onChange={handleCheckboxChange}
//                                 value="Bundled Discount"
//                             />
//                             <label htmlFor="second">Bundled Discount</label>
//                         </div>
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="third"
//                                 onChange={handleCheckboxChange}
//                                 value="Tiered Discounts"
//                             />
//                             <label htmlFor="third">Tiered Discounts</label>
//                         </div>
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="fourth"
//                                 onChange={handleCheckboxChange}
//                                 value="Buy One, Get One Discounted"
//                             />
//                             <label htmlFor="fourth">Buy One, Get One Discounted</label>
//                         </div>
//                     </CardContent>
//                 </Card>
//             ),
//         },
//         {
//             title: <span className="text-black dark:text-white">Create Offers</span>,
//             content: (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Create Offers</CardTitle>
//                         <CardDescription>Customize Offer Metrics</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2">
//                         <div className="flex flex-col gap-2">
//                             <div className="flex gap-4">
//                                 <div>
//                                     <label htmlFor="minReduction">Min Reduction:</label>
//                                     <Input
//                                         type="number"
//                                         id="minReduction"
//                                         onChange={handleMinReductionChange}
//                                         className="my-3"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="maxReduction">Max Reduction:</label>
//                                     <Input
//                                         type="number"
//                                         id="maxReduction"
//                                         onChange={handleMaxReductionChange}
//                                         className="my-3"
//                                     />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label htmlFor="loyaltyPoints">Loyalty Points:</label>
//                                 <Input
//                                     type="number"
//                                     id="loyaltyPoints"
//                                     onChange={handleLoyaltyPointsChange}
//                                     className="my-3"
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="highValueLoyaltyPoints">High-Value Loyalty Points:</label>
//                                 <Input
//                                     type="number"
//                                     id="highValueLoyaltyPoints"
//                                     onChange={handleHighValueLoyaltyPointsChange}
//                                     className="my-3"
//                                 />
//                             </div>
//                             {selectedOffers.includes("Fixed Amount Discount") && (
//                                 <div>
//                                     <h3>Fixed Amount Discounts</h3>
//                                     {fixedAmountTiers.map((tier, index) => (
//                                         <div key={index}>
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Threshold"
//                                                 value={tier.threshold}
//                                                 className="my-2"
//                                                 onChange={(e) =>
//                                                     handleFixedAmountChange(index, "threshold", e.target.value)
//                                                 }
//                                             />
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Discount"
//                                                 value={tier.discount}
//                                                 className="mb-1"
//                                                 onChange={(e) =>
//                                                     handleFixedAmountChange(index, "discount", e.target.value)
//                                                 }
//                                             />
//                                             <div className="flex justify-between my-1.5">
//                                                 <Button
//                                                     type="button"
//                                                     onClick={() => addTier("fixedAmount")}
//                                                     className="bg-green-700"
//                                                 >
//                                                     Add Tier
//                                                 </Button>
//                                                 <Button
//                                                     variant="destructive"
//                                                     type="button"
//                                                     onClick={() => removeTier(index, "fixedAmount")}
//                                                 >
//                                                     Remove
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                             {selectedOffers.includes("Tiered Discounts") && (
//                                 <div>
//                                     <h3>Tiered Discounts</h3>
//                                     {percentTiers.map((tier, index) => (
//                                         <div key={index}>
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Threshold"
//                                                 value={tier.threshold}
//                                                 className="my-2"
//                                                 onChange={(e) =>
//                                                     handleTieredChange(index, "threshold", e.target.value)
//                                                 }
//                                             />
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Discount"
//                                                 value={tier.discount}
//                                                 className="mb-1"
//                                                 onChange={(e) =>
//                                                     handleTieredChange(index, "discount", e.target.value)
//                                                 }
//                                             />
//                                             <div className="flex justify-between my-1.5">
//                                                 <Button
//                                                     type="button"
//                                                     onClick={() => addTier("tiered")}
//                                                     className="bg-green-700"
//                                                 >
//                                                     Add Tier
//                                                 </Button>
//                                                 <Button
//                                                     variant="destructive"
//                                                     type="button"
//                                                     onClick={() => removeTier(index, "tiered")}
//                                                 >
//                                                     Remove
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </CardContent>
//                 </Card>
//             ),
//         },
//         {
//             title: <span className="text-black dark:text-white">Review</span>,
//             content: (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Review</CardTitle>
//                         <CardDescription className="font-bold">Review Your Selections</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2">
//                         <h3 className="font-bold">Selected Offers</h3>
//                         <p>{selectedOffers.join(', ')}</p>
//
//                         <h3 className="font-semibold">Profit Margin Reduction</h3>
//                         <div className="flex gap-2">
//                             <div className="">Min: {marginReduction.min} %</div>
//                             <div className="">Max: {marginReduction.max} %</div>
//                         </div>
//
//
//                         <div className="font-semibold">Loyalty Points :{loyaltyPoints} </div>
//
//                         <div className="font-semibold">High-Value Loyalty Points : {highValueLoyaltyPoints}</div>
//
//                         {selectedOffers.includes("Fixed Amount Discount") && (
//                             <div>
//                                 <h3 className="font-semibold">Fixed Amount Discounts</h3>
//                                 {fixedAmountTiers.map((tier, index) => (
//                                     <div key={index}>
//                                         <p>Threshold: {tier.threshold}</p>
//                                         <p>Discount: {tier.discount}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//
//                         {selectedOffers.includes("Tiered Discounts") && (
//                             <div>
//                                 <h3 className="font-semibold">Tiered Discounts</h3>
//                                 {percentTiers.map((tier, index) => (
//                                     <div key={index}>
//                                         <p>Threshold: {tier.threshold}</p>
//                                         <p>Discount: {tier.discount}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//
//                         {isBogoSelected && (
//                             <div>
//                                 <div className="font-semibold">Buy One, Get One Discounted</div>
//                             </div>
//                         )}
//                         <div className="py-2.5">
//                             <Button
//                                 type="button"
//                                 onClick={handleFinalize}
//                                 className="w-full bg-blue-600 text-white py-2 px-3"
//                             >
//                                 Finalize and Send Request
//                             </Button>
//
//                         </div>
//                     </CardContent>
//                 </Card>
//             ),
//         }
//
//     ];
//
//     const next = () => {
//         setCurrent(current + 1);
//     };
//
//     const prev = () => {
//         setCurrent(current - 1);
//     };
//
//     return (
//         <div className="flex flex-col gap-3">
//             <div className="text-xl font-bold text-center">Customise Your Offers</div>
//             <Steps current={current} className="mb-4">
//                 {steps.map((item, index) => (
//                     <Steps.Step key={index} title={item.title} />
//                 ))}
//             </Steps>
//             <div className="step-content">{steps[current].content}</div>
//             <div className="steps-action mt-3 flex justify-between">
//                 {current > 0 && (
//                     <Button variant="outline" onClick={() => prev()}>
//                         Previous
//                     </Button>
//                 )}
//                 {current < steps.length - 1 && (
//                     <Button onClick={() => next()}>
//                         Next
//                     </Button>
//                 )}
//             </div>
//             {isLoading ? (
//                 <div className="flex justify-center py-4">
//                     <Lottie animationData={animationData} loop />
//                 </div>
//             ) : (
//                 successMessage && (
//                     <Alert>
//                         <AlertDescription>{successMessage}</AlertDescription>
//                     </Alert>
//                 )
//             )}
//         </div>
//     );
// };
//
// export default Stepper;



// const Stepper = () => {
//     const [current, setCurrent] = useState(0);
//     const [selectedOffers, setSelectedOffers] = useState([]);
//     const [fixed_amount_tiers, setFixedAmountTiers] = useState([{ threshold: "", discount: "" }]);
//     const [percent_tiers, setPercentTiers] = useState([{ threshold: "", discount: "" }]);
//     const [marginReduction, setMarginReduction] = useState({ min: 0, max: 0 });
//     const [loyalty_points, setLoyaltyPoints] = useState(0);
//     const [high_value_loyalty_points, setHighValueLoyaltyPoints] = useState(0);
//     const [bogd, setIsBogdSelected] = useState(false);
//     const api_name = getCookie();
//     const [isLoading, setIsLoading] = useState(false);
//     const [successMessage, setSuccessMessage] = useState(null);
//
//     const handleCheckboxChange = (event) => {
//         const { value, checked } = event.target;
//         if (value === "Buy One, Get One Discounted") {
//             setIsBogdSelected(checked);
//         } else {
//             if (checked) {
//                 if (!selectedOffers.includes(value)) {
//                     setSelectedOffers([...selectedOffers, value]);
//                 }
//             } else {
//                 setSelectedOffers(selectedOffers.filter((offerId) => offerId !== value));
//             }
//         }
//     };
//
//     const handleFixedAmountChange = (index, field, value) => {
//         const updatedTiers = [...fixed_amount_tiers];
//         updatedTiers[index][field] = value;
//         setFixedAmountTiers(updatedTiers);
//     };
//
//     const handlePercentTiersChange = (index, field, value) => {
//         const updatedTiers = [...percent_tiers];
//         updatedTiers[index][field] = value;
//         setPercentTiers(updatedTiers);
//     };
//
//     const addTier = (type) => {
//         if (type === "fixedAmount") {
//             setFixedAmountTiers([...fixed_amount_tiers, { threshold: "", discount: "" }]);
//         } else if (type === "percent") {
//             setPercentTiers([...percent_tiers, { threshold: "", discount: "" }]);
//         }
//     };
//
//     const removeTier = (index, type) => {
//         if (type === "fixedAmount") {
//             const updatedTiers = [...fixed_amount_tiers];
//             updatedTiers.splice(index, 1);
//             setFixedAmountTiers(updatedTiers);
//         } else if (type === "percent") {
//             const updatedTiers = [...percent_tiers];
//             updatedTiers.splice(index, 1);
//             setPercentTiers(updatedTiers);
//         }
//     };
//
//     const handleMinReductionChange = (event) => {
//         const { value } = event.target;
//         setMarginReduction((prev) => ({ ...prev, min: value }));
//     };
//
//     const handleMaxReductionChange = (event) => {
//         const { value } = event.target;
//         setMarginReduction((prev) => ({ ...prev, max: value }));
//     };
//
//     const handleLoyaltyPointsChange = (event) => {
//         const { value } = event.target;
//         setLoyaltyPoints(value);
//     };
//
//     const handleHighValueLoyaltyPointsChange = (event) => {
//         const { value } = event.target;
//         setHighValueLoyaltyPoints(value);
//     };
//
//     const handleFinalize = () => {
//         setIsLoading(true);
//
//         const selectedOffersData = {
//             selectedOffers,
//             marginReduction,
//             loyalty_points,
//             high_value_loyalty_points,
//             fixed_amount_tiers,
//             percent_tiers,
//             bogd,
//         };
//         console.log(selectedOffersData);
//
//         fetch(`${API_1}/generate_api_data/${api_name}`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(selectedOffersData),
//         })
//             .then((response) => response.json())
//             .then((data) => {
//                 console.log("Success:", data);
//                 setSuccessMessage("API request completed successfully!");
//             })
//             .catch((error) => {
//                 console.error("Error:", error);
//                 setSuccessMessage("An error occurred during the API request.");
//             })
//             .finally(() => {
//                 setIsLoading(false);
//             });
//     };
//
//     const steps = [
//         {
//             title: <span className="text-black dark:text-white">Select Offers</span>,
//             content: (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Offers</CardTitle>
//                         <CardDescription>Select the Offers For This Month</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2 flex flex-col">
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="first"
//                                 onChange={handleCheckboxChange}
//                                 value="Fixed Amount Discount"
//                             />
//                             <label htmlFor="first">Fixed Amount Discount</label>
//                         </div>
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="second"
//                                 onChange={handleCheckboxChange}
//                                 value="Bundled Discount"
//                             />
//                             <label htmlFor="second">Bundled Discount</label>
//                         </div>
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="third"
//                                 onChange={handleCheckboxChange}
//                                 value="Tiered Discounts"
//                             />
//                             <label htmlFor="third">Tiered Discounts</label>
//                         </div>
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="fourth"
//                                 onChange={handleCheckboxChange}
//                                 value="Buy One, Get One Discounted"
//                             />
//                             <label htmlFor="fourth">Buy One, Get One Discounted</label>
//                         </div>
//                     </CardContent>
//                 </Card>
//             ),
//         },
//         {
//             title: <span className="text-black dark:text-white">Create Offers</span>,
//             content: (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Create Offers</CardTitle>
//                         <CardDescription>Customize Offer Metrics</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2">
//                         <div className="flex flex-col gap-2">
//                             <div className="flex gap-4">
//                                 <div>
//                                     <label htmlFor="minReduction">Min Reduction:</label>
//                                     <Input
//                                         type="number"
//                                         id="minReduction"
//                                         onChange={handleMinReductionChange}
//                                         className="my-3"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="maxReduction">Max Reduction:</label>
//                                     <Input
//                                         type="number"
//                                         id="maxReduction"
//                                         onChange={handleMaxReductionChange}
//                                         className="my-3"
//                                     />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label htmlFor="loyalty_points">Loyalty Points:</label>
//                                 <Input
//                                     type="number"
//                                     id="loyalty_points"
//                                     onChange={handleLoyaltyPointsChange}
//                                     className="my-3"
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="high_value_loyalty_points">High-Value Loyalty Points:</label>
//                                 <Input
//                                     type="number"
//                                     id="high_value_loyalty_points"
//                                     onChange={handleHighValueLoyaltyPointsChange}
//                                     className="my-3"
//                                 />
//                             </div>
//                             {selectedOffers.includes("Fixed Amount Discount") && (
//                                 <div>
//                                     <h3>Fixed Amount Discounts</h3>
//                                     {fixed_amount_tiers.map((tier, index) => (
//                                         <div key={index}>
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Threshold"
//                                                 value={tier.threshold}
//                                                 className="my-2"
//                                                 onChange={(e) =>
//                                                     handleFixedAmountChange(index, "threshold", e.target.value)
//                                                 }
//                                             />
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Discount"
//                                                 value={tier.discount}
//                                                 className="mb-1"
//                                                 onChange={(e) =>
//                                                     handleFixedAmountChange(index, "discount", e.target.value)
//                                                 }
//                                             />
//                                             <div className="flex justify-between my-1.5">
//                                                 <Button
//                                                     type="button"
//                                                     onClick={() => addTier("fixedAmount")}
//                                                     className="bg-green-700"
//                                                 >
//                                                     Add Tier
//                                                 </Button>
//                                                 <Button
//                                                     variant="destructive"
//                                                     type="button"
//                                                     onClick={() => removeTier(index, "fixedAmount")}
//                                                 >
//                                                     Remove
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                             {selectedOffers.includes("Tiered Discounts") && (
//                                 <div>
//                                     <h3>Tiered Discounts</h3>
//                                     {percent_tiers.map((tier, index) => (
//                                         <div key={index}>
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Threshold"
//                                                 value={tier.threshold}
//                                                 className="my-2"
//                                                 onChange={(e) =>
//                                                     handlePercentTiersChange(index, "threshold", e.target.value)
//                                                 }
//                                             />
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Discount"
//                                                 value={tier.discount}
//                                                 className="mb-1"
//                                                 onChange={(e) =>
//                                                     handlePercentTiersChange(index, "discount", e.target.value)
//                                                 }
//                                             />
//                                             <div className="flex justify-between my-1.5">
//                                                 <Button
//                                                     type="button"
//                                                     onClick={() => addTier("percent")}
//                                                     className="bg-green-700"
//                                                 >
//                                                     Add Tier
//                                                 </Button>
//                                                 <Button
//                                                     variant="destructive"
//                                                     type="button"
//                                                     onClick={() => removeTier(index, "percent")}
//                                                 >
//                                                     Remove
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </CardContent>
//                 </Card>
//             ),
//         },
//         {
//             title: <span className="text-black dark:text-white">Review</span>,
//             content: (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Review</CardTitle>
//                         <CardDescription className="font-bold">Review Your Selections</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2">
//                         <h3 className="font-bold">Selected Offers</h3>
//                         <p>{selectedOffers.join(', ')}</p>
//
//                         <h3 className="font-semibold">Profit Margin Reduction</h3>
//                         <div className="flex gap-2">
//                             <div className="">Min: {marginReduction.min} %</div>
//                             <div className="">Max: {marginReduction.max} %</div>
//                         </div>
//
//                         <div className="font-semibold">Loyalty Points: {loyalty_points}</div>
//
//                         <div className="font-semibold">High-Value Loyalty Points: {high_value_loyalty_points}</div>
//
//                         {selectedOffers.includes("Fixed Amount Discount") && (
//                             <div>
//                                 <h3 className="font-semibold">Fixed Amount Discounts</h3>
//                                 {fixed_amount_tiers.map((tier, index) => (
//                                     <div key={index}>
//                                         <p>Threshold: {tier.threshold}</p>
//                                         <p>Discount: {tier.discount}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//
//                         {selectedOffers.includes("Tiered Discounts") && (
//                             <div>
//                                 <h3 className="font-semibold">Tiered Discounts</h3>
//                                 {percent_tiers.map((tier, index) => (
//                                     <div key={index}>
//                                         <p>Threshold: {tier.threshold}</p>
//                                         <p>Discount: {tier.discount}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//
//                         {bogd && (
//                             <div>
//                                 <div className="font-semibold">Buy One, Get One Discounted</div>
//                             </div>
//                         )}
//                         <div className="py-2.5">
//                             <Button
//                                 type="button"
//                                 onClick={handleFinalize}
//                                 className="w-full bg-blue-600 text-white py-2 px-3"
//                             >
//                                 Finalize and Send Request
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>
//             ),
//         }
//     ];
//
//     const next = () => {
//         setCurrent(current + 1);
//     };
//
//     const prev = () => {
//         setCurrent(current - 1);
//     };
//
//     return (
//         <div className="flex flex-col gap-3">
//             <div className="text-xl font-bold text-center">Customize Your Offers</div>
//             <Steps current={current} className="mb-4">
//                 {steps.map((item, index) => (
//                     <Steps.Step key={index} title={item.title} />
//                 ))}
//             </Steps>
//             <div className="step-content">{steps[current].content}</div>
//             <div className="steps-action mt-3 flex justify-between">
//                 {current > 0 && (
//                     <Button variant="outline" onClick={() => prev()}>
//                         Previous
//                     </Button>
//                 )}
//                 {current < steps.length - 1 && (
//                     <Button onClick={() => next()}>
//                         Next
//                     </Button>
//                 )}
//             </div>
//             {isLoading ? (
//                 <div className="flex justify-center py-4">
//                     <Lottie animationData={animationData} loop />
//                 </div>
//             ) : (
//                 successMessage && (
//                     <Alert>
//                         <AlertDescription>{successMessage}</AlertDescription>
//                     </Alert>
//                 )
//             )}
//         </div>
//     );
// };
//
// export default Stepper;
//



// const Stepper = () => {
//     const [current, setCurrent] = useState(0);
//     const [selectedOffers, setSelectedOffers] = useState([]);
//     const [fixedAmountTiers, setFixedAmountTiers] = useState([{ min_amount: "", discount: "" }]);
//     const [percentTiers, setPercentTiers] = useState([{ min_amount: "", discount: "" }]);
//     const [marginReduction, setMarginReduction] = useState({ min: "2", max: "10" });
//     const [loyaltyPoints, setLoyaltyPoints] = useState(0);
//     const [highValueLoyaltyPoints, setHighValueLoyaltyPoints] = useState(0);
//     const [isBogoSelected, setIsBogoSelected] = useState(false);
//     const api_name = getCookie();
//     const [isLoading, setIsLoading] = useState(false);
//     const [successMessage, setSuccessMessage] = useState(null);
//
//     const handleCheckboxChange = (event) => {
//         const { value, checked } = event.target;
//         if (value === "Buy One, Get One Discounted") {
//             setIsBogoSelected(checked);
//         } else {
//             if (checked) {
//                 if (!selectedOffers.includes(value)) {
//                     setSelectedOffers([...selectedOffers, value]);
//                 }
//             } else {
//                 setSelectedOffers(selectedOffers.filter((offerId) => offerId !== value));
//             }
//         }
//     };
//
//     const handleFixedAmountChange = (index, field, value) => {
//         const updatedTiers = [...fixedAmountTiers];
//         updatedTiers[index][field] = value;
//         setFixedAmountTiers(updatedTiers);
//     };
//
//     const handleTieredChange = (index, field, value) => {
//         const updatedTiers = [...percentTiers];
//         updatedTiers[index][field] = value;
//         setPercentTiers(updatedTiers);
//     };
//
//     const addTier = (type) => {
//         if (type === "fixedAmount") {
//             setFixedAmountTiers([...fixedAmountTiers, { min_amount: "", discount: "" }]);
//         } else if (type === "tiered") {
//             setPercentTiers([...percentTiers, { min_amount: "", discount: "" }]);
//         }
//     };
//
//     const removeTier = (index, type) => {
//         if (type === "fixedAmount") {
//             const updatedTiers = [...fixedAmountTiers];
//             updatedTiers.splice(index, 1);
//             setFixedAmountTiers(updatedTiers);
//         } else if (type === "tiered") {
//             const updatedTiers = [...percentTiers];
//             updatedTiers.splice(index, 1);
//             setPercentTiers(updatedTiers);
//         }
//     };
//
//     const handleMinReductionChange = (event) => {
//         const { value } = event.target;
//         setMarginReduction((prev) => ({ ...prev, min: value }));
//     };
//
//     const handleMaxReductionChange = (event) => {
//         const { value } = event.target;
//         setMarginReduction((prev) => ({ ...prev, max: value }));
//     };
//
//     const handleLoyaltyPointsChange = (event) => {
//         const { value } = event.target;
//         setLoyaltyPoints(value);
//     };
//
//     const handleHighValueLoyaltyPointsChange = (event) => {
//         const { value } = event.target;
//         setHighValueLoyaltyPoints(value);
//     };
//
//     const handleFinalize = () => {
//         setIsLoading(true);
//
//         const selectedOffersData = {
//             selectedOffers,
//             marginReduction,
//             loyaltyPoints,
//             highValueLoyaltyPoints,
//             fixedAmountTiers,
//             percentTiers,
//             isBogoSelected
//         };
//
//         fetch(`${API_1}/generate_api_data/${api_name}`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(selectedOffersData),
//         })
//             .then((response) => response.json())
//             .then((data) => {
//                 setSuccessMessage("API request completed successfully!");
//             })
//             .catch((error) => {
//                 setSuccessMessage("An error occurred during the API request.");
//             })
//             .finally(() => {
//                 setIsLoading(false);
//             });
//     };
//
//     const steps = [
//         {
//             title: <span className="text-black dark:text-white">Select Offers</span>,
//             content: (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Offers</CardTitle>
//                         <CardDescription>Select the Offers For This Month</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2 flex flex-col">
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="first"
//                                 onChange={handleCheckboxChange}
//                                 value="Fixed Amount Discount"
//                             />
//                             <label htmlFor="first">Fixed Amount Discount</label>
//                         </div>
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="second"
//                                 onChange={handleCheckboxChange}
//                                 value="Bundled Discount"
//                             />
//                             <label htmlFor="second">Bundled Discount</label>
//                         </div>
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="third"
//                                 onChange={handleCheckboxChange}
//                                 value="Tiered Discounts"
//                             />
//                             <label htmlFor="third">Tiered Discounts</label>
//                         </div>
//                         <div className="flex gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="fourth"
//                                 onChange={handleCheckboxChange}
//                                 value="Buy One, Get One Discounted"
//                             />
//                             <label htmlFor="fourth">Buy One, Get One Discounted</label>
//                         </div>
//                     </CardContent>
//                 </Card>
//             ),
//         },
//         {
//             title: <span className="text-black dark:text-white">Create Offers</span>,
//             content: (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Create Offers</CardTitle>
//                         <CardDescription>Customize Offer Metrics</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2">
//                         <div className="flex flex-col gap-2">
//                             <div className="flex gap-4">
//                                 <div>
//                                     <label htmlFor="minReduction">Min Reduction:</label>
//                                     <Input
//                                         type="number"
//                                         id="minReduction"
//                                         onChange={handleMinReductionChange}
//                                         className="my-3"
//                                         value={marginReduction.min}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="maxReduction">Max Reduction:</label>
//                                     <Input
//                                         type="number"
//                                         id="maxReduction"
//                                         onChange={handleMaxReductionChange}
//                                         className="my-3"
//                                         value={marginReduction.max}
//                                     />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label htmlFor="loyaltyPoints">Loyalty Points:</label>
//                                 <Input
//                                     type="number"
//                                     id="loyaltyPoints"
//                                     onChange={handleLoyaltyPointsChange}
//                                     className="my-3"
//                                     value={loyaltyPoints}
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="highValueLoyaltyPoints">High-Value Loyalty Points:</label>
//                                 <Input
//                                     type="number"
//                                     id="highValueLoyaltyPoints"
//                                     onChange={handleHighValueLoyaltyPointsChange}
//                                     className="my-3"
//                                     value={highValueLoyaltyPoints}
//                                 />
//                             </div>
//                             {selectedOffers.includes("Fixed Amount Discount") && (
//                                 <div>
//                                     <h3>Fixed Amount Discounts</h3>
//                                     {fixedAmountTiers.map((tier, index) => (
//                                         <div key={index}>
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Min Amount"
//                                                 value={tier.min_amount}
//                                                 className="my-2"
//                                                 onChange={(e) =>
//                                                     handleFixedAmountChange(index, "min_amount", e.target.value)
//                                                 }
//                                             />
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Discount"
//                                                 value={tier.discount}
//                                                 className="mb-1"
//                                                 onChange={(e) =>
//                                                     handleFixedAmountChange(index, "discount", e.target.value)
//                                                 }
//                                             />
//                                             <div className="flex justify-between my-1.5">
//                                                 <Button
//                                                     type="button"
//                                                     onClick={() => addTier("fixedAmount")}
//                                                     className="bg-green-700"
//                                                 >
//                                                     Add
//                                                 </Button>
//                                                 {fixedAmountTiers.length > 1 && (
//                                                     <Button
//                                                         type="button"
//                                                         onClick={() => removeTier(index, "fixedAmount")}
//                                                         className="bg-red-700"
//                                                     >
//                                                         Remove
//                                                     </Button>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                             {selectedOffers.includes("Tiered Discounts") && (
//                                 <div>
//                                     <h3>Tiered Discounts</h3>
//                                     {percentTiers.map((tier, index) => (
//                                         <div key={index}>
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Min Amount"
//                                                 value={tier.min_amount}
//                                                 className="my-2"
//                                                 onChange={(e) =>
//                                                     handleTieredChange(index, "min_amount", e.target.value)
//                                                 }
//                                             />
//                                             <Input
//                                                 type="number"
//                                                 placeholder="Discount (%)"
//                                                 value={tier.discount}
//                                                 className="mb-1"
//                                                 onChange={(e) =>
//                                                     handleTieredChange(index, "discount", e.target.value)
//                                                 }
//                                             />
//                                             <div className="flex justify-between my-1.5">
//                                                 <Button
//                                                     type="button"
//                                                     onClick={() => addTier("tiered")}
//                                                     className="bg-green-700"
//                                                 >
//                                                     Add
//                                                 </Button>
//                                                 {percentTiers.length > 1 && (
//                                                     <Button
//                                                         type="button"
//                                                         onClick={() => removeTier(index, "tiered")}
//                                                         className="bg-red-700"
//                                                     >
//                                                         Remove
//                                                     </Button>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </CardContent>
//                 </Card>
//             ),
//         },
//         {
//             title: <span className="text-black dark:text-white">Finalize</span>,
//             content: (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Finalize</CardTitle>
//                         <CardDescription>Review and Submit</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-2">
//                         <div className="space-y-4">
//                             <Alert>
//                                 <AlertDescription>
//                                     Ensure all the details are correct before submission.
//                                 </AlertDescription>
//                             </Alert>
//                             <Button onClick={handleFinalize} className="bg-blue-700 w-full" disabled={isLoading}>
//                                 {isLoading ? "Submitting..." : "Submit"}
//                             </Button>
//                             {successMessage && (
//                                 <Alert>
//                                     <AlertDescription>{successMessage}</AlertDescription>
//                                 </Alert>
//                             )}
//                         </div>
//                     </CardContent>
//                 </Card>
//             ),
//         },
//     ];
//
//     return (
//         <div className="w-full md:w-2/3 mx-auto my-8">
//             <Steps current={current} onChange={setCurrent}>
//                 {steps.map((item) => (
//                     <Steps.Step key={item.title} title={item.title} />
//                 ))}
//             </Steps>
//             <div className="steps-content mt-8">{steps[current].content}</div>
//         </div>
//     );
// };
//
// export default Stepper;
