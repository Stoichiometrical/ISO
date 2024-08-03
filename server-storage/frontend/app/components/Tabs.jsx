"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"



import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { API_URL } from "@/lib/utils";
import useDataStore from "@/hooks/useDataStore";
import Lottie from "lottie-react";
// import animationData from "@/app/(pages)/forecast/lottie.json";

export default function OfferSelection() {
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [fixedAmountTiers, setFixedAmountTiers] = useState([
    { threshold: "", discount: "" },
  ]);
  const [tieredTiers, setTieredTiers] = useState([
    { threshold: "", discount: "" },
  ]);
  const [bogoMaxDiscount, setBogoMaxDiscount] = useState(0);
  const [createdFixedAmountOffers, setCreatedFixedAmountOffers] = useState([]);
  const [createdTieredOffers, setCreatedTieredOffers] = useState([]);
  const [createdBogoDiscount, setCreatedBogoDiscount] = useState(null);
  const api_name = useDataStore((state) => state.api_name);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null)

  const api_1 = {
    percent_tiers: [
      { min_amount: 0, discount: 0 }, // Tier 1: $0 - $100 (0% discount)
      { min_amount: 101, discount: 5 }, // Tier 2: $101 - $200 (5% discount)
      { min_amount: 201, discount: 10 }, // Tier 3: $201 and above (10% discount)
    ],
    fixed_amount_tiers: [
      { min_amount: 100, discount: 5 }, // Tier 1: $100 - $200 ($5 discount)
      { min_amount: 201, discount: 15 }, // Tier 2: $201 - $300 ($15 discount)
      { min_amount: 301, discount: 20 }, // Tier 3: $301 and above ($20 discount)
    ],
    loyalty_points: 2,
    high_value_loyalty_points: 5,
    bogd: true,
    bundled_discount: true, // Changed "bundled discount" to "bundled_discount" for valid key name
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      if (!selectedOffers.includes(value)) {
        setSelectedOffers([...selectedOffers, value]);
      }
    } else {
      setSelectedOffers(selectedOffers.filter((offerId) => offerId !== value));
    }
  };

  const handleFixedAmountChange = (index, field, value) => {
    const updatedTiers = [...fixedAmountTiers];
    updatedTiers[index][field] = value;
    setFixedAmountTiers(updatedTiers);
  };

  const handleTieredChange = (index, field, value) => {
    const updatedTiers = [...tieredTiers];
    updatedTiers[index][field] = value;
    setTieredTiers(updatedTiers);
  };

  const addTier = (type) => {
    if (type === "fixedAmount") {
      setFixedAmountTiers([
        ...fixedAmountTiers,
        { threshold: "", discount: "" },
      ]);
    } else if (type === "tiered") {
      setTieredTiers([...tieredTiers, { threshold: "", discount: "" }]);
    }
  };

  const removeTier = (index, type) => {
    if (type === "fixedAmount") {
      const updatedTiers = [...fixedAmountTiers];
      updatedTiers.splice(index, 1);
      setFixedAmountTiers(updatedTiers);
    } else if (type === "tiered") {
      const updatedTiers = [...tieredTiers];
      updatedTiers.splice(index, 1);
      setTieredTiers(updatedTiers);
    }
  };

  const handleBogoMaxDiscountChange = (event) => {
    const { value } = event.target;
    setBogoMaxDiscount(value);
  };

  const handleFinalize = () => {
    console.log("Selected Offers:", selectedOffers);
    console.log("Fixed Amount Tiers:", fixedAmountTiers);
    console.log("Tiered Tiers:", tieredTiers);
    console.log("BOGO Max Discount:", bogoMaxDiscount);
    console.log("API_NAME : ", api_name);
    setIsLoading(true);

    // Save offers separately
    setCreatedFixedAmountOffers([...fixedAmountTiers]);
    setCreatedTieredOffers([...tieredTiers]);
    setCreatedBogoDiscount(bogoMaxDiscount);

    // Send api_1 to the backend
    fetch(`${API_URL}/generate_api_data/${api_name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(api_1),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        setSuccessMessage("API request completed successfully!");
      })
      .catch((error) => {
        console.error("Error:", error);
        setSuccessMessage("An error occurred during the API request.");
      }).finally(() => {
        setIsLoading(false);
    });
  };

  return (
      <div className="my-5 p-3">
        <div className="font-bold text-3xl p-3 text-center">
          Customisation Lab
        </div>


        <div className="my-2 text-center">
          Define the customisations to power the recommendations per your business
          goals
        </div>
        <Tabs defaultValue="account" className="w-fit mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            {/*<TabsTrigger value="goals">Define Goals</TabsTrigger>*/}
            <TabsTrigger value="select">Select Offers</TabsTrigger>
            <TabsTrigger value="create">Create Offers</TabsTrigger>
            <TabsTrigger value="view">View Offers</TabsTrigger>
          </TabsList>

          <TabsContent value="select">
            <Card>
              <CardHeader>
                <CardTitle>Offers</CardTitle>
                <CardDescription>
                  Select the Offers For This Month
                </CardDescription>
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
              <CardFooter>
                <Button onClick={handleFinalize}>Finalize</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create Offers</CardTitle>
                <CardDescription>Customize Offer Metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-col gap-2">
                  <div>
                    <label htmlFor="bogoMaxDiscount">BOGO Max Discount:</label>
                    <Input
                        type="number"
                        id="bogoMaxDiscount"
                        onChange={handleBogoMaxDiscountChange}
                        className="my-3"
                    />
                  </div>
                  {selectedOffers.includes("Fixed Amount Discount") && (
                      <div>
                        <h3>Fixed Amount Discounts</h3>
                        {fixedAmountTiers.map((tier, index) => (
                            <div key={index}>
                              <Input
                                  type="number"
                                  placeholder="Threshold"
                                  value={tier.threshold}
                                  className="my-2"
                                  onChange={(e) =>
                                      handleFixedAmountChange(
                                          index,
                                          "threshold",
                                          e.target.value,
                                      )
                                  }
                              />
                              <Input
                                  type="number"
                                  placeholder="Discount"
                                  value={tier.discount}
                                  className="mb-1"
                                  onChange={(e) =>
                                      handleFixedAmountChange(
                                          index,
                                          "discount",
                                          e.target.value,
                                      )
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
                        {tieredTiers.map((tier, index) => (
                            <div key={index}>
                              <Input
                                  type="number"
                                  placeholder="Threshold"
                                  value={tier.threshold}
                                  className="my-2"
                                  onChange={(e) =>
                                      handleTieredChange(
                                          index,
                                          "threshold",
                                          e.target.value,
                                      )
                                  }
                              />
                              <Input
                                  type="number"
                                  placeholder="Discount"
                                  value={tier.discount}
                                  className="my-1"
                                  onChange={(e) =>
                                      handleTieredChange(
                                          index,
                                          "discount",
                                          e.target.value,
                                      )
                                  }
                              />
                              <div className="flex justify-between my-1.5">
                                <Button
                                    type="button"
                                    onClick={() => addTier("tiered")}
                                    className="bg-green-700"
                                >
                                  Add Tier
                                </Button>
                                <Button
                                    variant="destructive"
                                    type="button"
                                    onClick={() => removeTier(index, "tiered")}
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
              <CardFooter>
                <Button onClick={handleFinalize}>Save Offers</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>Offers Selected</CardTitle>
                <CardDescription>Offers created</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <h3 className="font-bold">Fixed Amount Offers</h3>
                  {createdFixedAmountOffers.map((offer, index) => (
                      <div key={index}>
                        <p className="mt-1">Threshold: {offer.threshold}</p>
                        <p>Discount: {offer.discount}</p>
                      </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-bold">Tiered Offers</h3>
                  {createdTieredOffers.map((offer, index) => (
                      <div key={index}>
                        <p className="mt-1">Threshold: {offer.threshold}</p>
                        <p>Discount: {offer.discount}</p>
                      </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-bold">BOGO Max Discount</h3>
                  <p>{createdBogoDiscount}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleFinalize}>Finalise API</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {isLoading && ( // Show loader during API call
            <div className="flex flex-col gap-2 items-center justify-center">
              <span className="font-bold">Our Advanced Algorithms Are Processing Your Data Please Wait.Process might take up to 4 minutes</span>
              <div className="w-[200px] h-[200px]">
                {/*<Lottie animationData={animationData} autoplay={true} loop={true}/>*/}
              </div>
            </div>
        )}

        {successMessage && ( // Show success/error alert after API call
            <Alert className="my-4">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
        )}
      </div>
  );
}



