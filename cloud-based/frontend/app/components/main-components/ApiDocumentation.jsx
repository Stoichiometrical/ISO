"use client"
import { useEffect } from "react";
import { Snippet } from "@nextui-org/react";
import {API_1, API_2, API_3, getProjectName} from "@/lib/utils";

// Define valid segment and subsegment options
const segmentOptions = [
  { uid: "Test", name: "Test" },
  { uid: "Risk", name: "Risk" },
  { uid: "High Value", name: "High Value" },
  { uid: "Nurture", name: "Nurture" },
];

const subsegmentOptions = [
  { uid: "Risk, High CLV", name: "Risk, High CLV" },
  { uid: "Risk, Medium CLV", name: "Risk, Medium CLV" },
  { uid: "Risk, Low CLV", name: "Risk, Low CLV" },
  { uid: "High Value, High CLV", name: "High Value, High CLV" },
  { uid: "High Value, Medium CLV", name: "High Value, Medium CLV" },
  { uid: "High Value, Low CLV", name: "High Value, Low CLV" },
  { uid: "Nurture, High CLV", name: "Nurture, High CLV" },
  { uid: "Nurture, Medium CLV", name: "Nurture, Medium CLV" },
  { uid: "Nurture, Low CLV", name: "Nurture, Low CLV" },
];




export default function APIDocumentation({ api_name }) {
  useEffect(() => {
    if (!api_name) {
      alert("Please finalize the report to get a valid API link.");
    }
  }, [api_name]);

  if (!api_name) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
        <p className="text-red-500">
          Please finalize the report to get a valid API link.
        </p>
      </div>
    );
  }

  const project_name = getProjectName()
  return (
      <div className="p-5">
          <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
          <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Get Sales Forecast</h2>
              <p>
                  This endpoint provides a forecast of sales for the current month. The
                  forecast includes daily sales volumes, helping you anticipate demand
                  and plan your inventory and promotions accordingly.
              </p>
              <Snippet className="rounded-lg p-1">{`${API_3}/${api_name}/get_forecast?project_name=${project_name}`}</Snippet>
          </div>
          <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Get Promotion Dates</h2>
              <p>
                  This endpoint gives you the best dates to run promotions. It
                  identifies peak periods where promotions are likely to be most
                  effective, helping you maximize your sales and engagement.
              </p>
              <Snippet
                  className="rounded-lg p-1">{`${API_3}/${api_name}/get_promo_days?project_name=${project_name}`}</Snippet>
          </div>
          <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Get Segmentation Details</h2>
              <p>
                  This endpoint provides detailed information about each customer
                  segment. You can understand the characteristics, behaviors, and
                  preferences of different groups of customers, allowing you to tailor
                  your marketing strategies accordingly.
              </p>
              <Snippet className="rounded-lg p-1">{`${API_1}/${api_name}/get-segment-details`}</Snippet>
          </div>
          <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Get Predictive Details</h2>
              <p>
                  This endpoint offers insights into customer and sales predictions. It
                  helps you understand future trends and patterns, enabling you to make
                  informed decisions about inventory, staffing, and marketing efforts.
              </p>
              <Snippet
                  className="rounded-lg p-1">{`${API_2}/${api_name}/get-sales-descriptions?project_name=${project_name}`}</Snippet>
          </div>
          <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Get Prescriptive Recommendations</h2>
              <p>
                  This endpoint provides actionable recommendations based on predictive
                  analytics. It suggests specific actions you can take to improve sales,
                  customer satisfaction, and overall business performance.
              </p>
              <Snippet
                  className="rounded-lg p-1">{`${API_2}/${api_name}/get-recommendations?project_name=${project_name}`}</Snippet>
          </div>
          <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Get Custom Offers</h2>
              <p>
                  This endpoint generates custom offers tailored to individual customers
                  or customer segments. These offers are designed to boost engagement
                  and sales by providing personalized incentives.
              </p>
              <Snippet className="rounded-lg p-1">{`${API_1}/${api_name}/get_offers`}</Snippet>
          </div>
          <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Get Discounts</h2>
              <p>
                  This endpoint lists available discounts that you can offer to your
                  customers. It helps you create compelling promotions to attract more
                  customers and drive sales.
              </p>
              <Snippet
                  className="rounded-lg p-1">{`${API_1}/${api_name}/get_bundle_info?segment_name=segment&project_name=${project_name}`}</Snippet>
          </div>
          <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Get Segment Emails</h2>
              <p>
                  This endpoint provides email addresses for a specific customer
                  segment. You can use this information to target your email marketing
                  campaigns more effectively.
              </p>
              <Snippet className="rounded-lg p-1 pre">{`${API_1}/${api_name}/get_emails_by_segment?project_name=${project_name}&segment=High Value`}</Snippet>
          </div>


          <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Get Subsegment Emails</h2>
              <p>
                  This endpoint provides email addresses for a specific customer subsegment
                  segment. You can use this information to target your email marketing
                  campaigns more effectively.Change the subsegment section with the appropriate subsegment
              </p>
               <Snippet className="rounded-lg p-1 break-all "  >{`${API_1}/${api_name}/get_emails_by_subsegment?project_name=${project_name}&subsegment=High Value`}</Snippet>
          </div>
      </div>
  );
}



