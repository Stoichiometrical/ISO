import React, {useEffect, useState} from "react";
import {Accordion, AccordionItem} from "@nextui-org/react";
import ReactMarkdown from "react-markdown";
import {API_2, API_3} from "@/lib/utils";

export default function RecommendationsAccordion({sales="Loading....",customer="Loading...."}) {



  return (
    <Accordion selectionMode="multiple">
      <AccordionItem key="1" aria-label="Accordion 1" title="Sales Optimisation Strategies">
          <ReactMarkdown>{sales}</ReactMarkdown>
      </AccordionItem>
          <AccordionItem key="2" aria-label="Accordion 2" title="Customer Segmentation Insights">
              <ReactMarkdown>{customer}</ReactMarkdown>
      </AccordionItem>
    </Accordion>
  );
}



export function TestAccordion() {
    const [salesRecommendations, setSalesRecommendations] = useState('');
    const [customerSegmentationRecommendations, setCustomerSegmentationRecommendations] = useState('');

    useEffect(() => {

        const fetchSales = async () => {
            try {
                const response = await fetch(`${API_2}/get-sales-descriptions?api_name=test`, { // Updated URL
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // No body needed for GET requests
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


        // Fetch segmentation description from the backend
        const fetchSegmentDescription = async () => {
            try {
                const response = await fetch(`${API_2}/get-segmentation-description`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        api_name: 'test'
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const { analysis } = data;

                    // Set formatted recommendations to state with bold words and handle new lines
                    setCustomerSegmentationRecommendations(formatMarkdown(analysis));
                } else {
                    setCustomerSegmentationRecommendations('Failed to load customer segmentation recommendations.');
                }
            } catch (error) {
                console.error('Error fetching segmentation description:', error);
                setCustomerSegmentationRecommendations('Error loading customer segmentation recommendations.');
            }
        };

        fetchSegmentDescription();
        fetchSales();
    }, []);

    // Function to format Markdown content
    const formatMarkdown = (text) => {
        // Make words surrounded by ** bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Replace new lines with <br> tags
        text = text.replace(/\n/g, '<br>');
        return text;
    };

    return (
        <Accordion multiple>
            <AccordionItem key="1" aria-label="Sales Forecast" title="Sales Forecast">
                <div dangerouslySetInnerHTML={{__html: salesRecommendations}}></div>
            </AccordionItem>
            <AccordionItem key="2" aria-label="Customer Segmentation" title="Customer Segmentation">
                <div dangerouslySetInnerHTML={{__html: customerSegmentationRecommendations}}></div>
            </AccordionItem>
        </Accordion>
    );
}

export function DescriptionAccordion({first,first_title,second,second_title}) {
    return (
        <Accordion multiple>
            <AccordionItem key="1" aria-label="Sales Forecast" title={first_title}>
                <div dangerouslySetInnerHTML={{__html: first}}></div>
            </AccordionItem>
            <AccordionItem key="2" aria-label="Customer Segmentation" title={second_title}>
                <div dangerouslySetInnerHTML={{__html: second}}></div>
            </AccordionItem>
        </Accordion>
    );
}


export function FAQAccordion({children}) {
    return (
        <Accordion multiple>
            {children}
        </Accordion>
    );
}




