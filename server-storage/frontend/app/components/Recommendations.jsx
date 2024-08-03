
"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@nextui-org/react";
import RecommendationsAccordion from "@/components/ui/accordion";

export default function Recommendations() {
  const [loading, setLoading] = useState(true);
  const [salesRecommendations, setSalesRecommendations] = useState("");
  const [
    customerSegmentationRecommendations,
    setCustomerSegmentationRecommendations,
  ] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/recommendations`)
      .then((response) => response.json())
      .then((data) => {
        setSalesRecommendations(data.sales_recommendations);
        setCustomerSegmentationRecommendations(
          data.customer_segmentation_recommendations,
        );
        setLoading(false); // Set loading to false when recommendations are loaded
      })
      .catch((error) =>
        console.error("Error fetching recommendations:", error),
      );
  }, []);

  return (
    <div className="">
      <div className="text-2xl font-bold text-center">Recommendations</div>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-48">
          {/* Display loader here */}
          <div className="loader  text-2xl font-bold">
            Crafting The Best Strategies Please Wait.........
          </div>
          <CircularProgress />
        </div>
      ) : (
        <div className="flex justify-center items-center flex-col gap-4 my-5 mx-9 mt-8">




            <RecommendationsAccordion sales={salesRecommendations} customer={customerSegmentationRecommendations}/>

        </div>
      )}
    </div>
  );
}
