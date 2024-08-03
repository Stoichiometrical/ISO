// "use client"
//
// import {FAQAccordion} from "@/components/ui/accordion";
// import {AccordionItem} from "@nextui-org/react";
// import React from "react";
//
//
// export default function FAQ(){
//     return(
//         <>
//             <div className="">
//                 <div className="text-2xl font-bold text-center my-1">Frequently Asked Questions</div>
//
//                 <FAQAccordion>
//                     <AccordionItem key="1" aria-label="Sales Forecast" title="How do we use your data?">
//                         <div >Your data is safely stored and encrypted in our databases.We do not have access to it.Only our algorithms access your data and preprocess it for the required functionality without oversight from us so no sensistive customer data is revealed</div>
//                     </AccordionItem>
//
//                     <AccordionItem key="2" aria-label="Sales Forecast" title="Can l opt out of the service anytime that l want?">
//                         <div >
//                             Our service is based on a month by month subscription so you can opt out anytime you want and come back anytime you want.However the API links generate only work up to 3 months after subcription has been cancelled
//                         </div>
//                     </AccordionItem>
//                 </FAQAccordion>
//             </div>
//
//         </>
//     )
// }


"use client"

import {FAQAccordion} from "@/components/ui/accordion";
import {AccordionItem} from "@nextui-org/react";
import React from "react";
import Navbar from "@/app/components/Navbar";


export default function FAQ(){
    return(
        <>
            <div className="mx-auto p-2 h-full">
                <Navbar/>
                <div className="text-2xl font-bold text-center my-2">Frequently Asked Questions</div>

                <FAQAccordion>
                    <AccordionItem key="1" aria-label="Data Usage" title="How do we use your data?">
                        <div>
                            Your data is safely stored and encrypted in our databases. We do not have direct access to it. Our algorithms process your data to provide sales forecasting, customer segmentation, and actionable insights. All data processing is automated to ensure no sensitive customer data is exposed. We use your data to:
                            <ul>
                                <li>Analyze past sales data to predict future trends.</li>
                                <li>Segment customers based on purchasing behavior to tailor marketing strategies.</li>
                                <li>Provide personalized recommendations and insights to optimize your sales and business strategies.</li>
                            </ul>
                        </div>
                    </AccordionItem>

                    <AccordionItem key="2" aria-label="Data Protection" title="How do we protect your data?">
                        <div>
                            We implement robust security measures to protect your data, including:
                            <ul>
                                <li><strong>Encryption:</strong> All personal and transactional data is encrypted during transmission and storage to ensure confidentiality and integrity.</li>
                                <li><strong>Secure Authentication:</strong> We use secure authentication methods, such as Google OAuth 2.0, to protect access to your account.</li>
                                <li><strong>Access Control:</strong> Only authorized personnel have access to your data, and strict access controls are in place to prevent unauthorized access.</li>
                                <li><strong>Regular Audits:</strong> We conduct regular security audits and updates to our systems to protect against data breaches and vulnerabilities.</li>
                                <li><strong>Data Minimization:</strong> We only collect and process the data necessary for providing our services, adhering to the principle of data minimization.</li>
                                <li><strong>Anonymization and Pseudonymization:</strong> Where possible, we anonymize or pseudonymize personal data to protect user privacy.</li>
                                <li><strong>Data Breach Response:</strong> In the event of a data breach, we have procedures in place to promptly notify affected users and relevant authorities, as required by GDPR.</li>
                            </ul>
                        </div>
                    </AccordionItem>

                    <AccordionItem key="3" aria-label="Opt-Out" title="Can I opt out of the service anytime I want?">
                        <div>
                            Our service operates on a month-to-month subscription basis, allowing you to opt out at any time. You can also come back whenever you wish. Please note that API links generated will only remain active for up to 3 months after the subscription is canceled.
                        </div>
                    </AccordionItem>

                    <AccordionItem key="4" aria-label="Data Rights" title="What rights do I have regarding my data?">
                        <div>
                            Under data protection laws such as GDPR, you have the following rights:
                            <ul>
                                <li><strong>Access Your Data:</strong> Request a copy of the personal data we hold about you.</li>
                                <li><strong>Correct Your Data:</strong> Request corrections to any inaccurate or incomplete data.</li>
                                <li><strong>Delete Your Data:</strong> Request the deletion of your personal data from our systems.</li>
                                <li><strong>Data Portability:</strong> Request that we transfer your data to another service provider.</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw your consent for data processing at any time, where consent is the basis for processing.</li>
                                <li><strong>Object to Processing:</strong> Object to the processing of your data for certain purposes, such as direct marketing.</li>
                            </ul>
                        </div>
                    </AccordionItem>

                    <AccordionItem key="5" aria-label="Data Retention" title="How long do you retain my data?">
                        <div>
                            We retain your data for as long as necessary to provide our services and fulfill the purposes outlined in our data usage policy. When data is no longer needed, we securely delete or anonymize it, ensuring compliance with GDPR's data retention requirements.
                        </div>
                    </AccordionItem>

                    <AccordionItem key="6" aria-label="Policy Changes" title="Will you notify me of changes to the data usage policy?">
                        <div>
                            Yes, we will notify you of any significant changes to our data usage policy. You will receive an email notification, and we will provide the updated policy on our website. Your continued use of our services constitutes your acceptance of any changes.
                        </div>
                    </AccordionItem>

                    <AccordionItem key="7" aria-label="Contact Information" title="How can I contact you with questions about my data?">
                        <div>
                            If you have any questions or concerns about our Data Usage Policy or your data, please contact us at:
                            <br />
                           ISO Inc
                            <br />
                            +230 5841 7209
                            <br />
                            davidtgondo@gmail.com
                        </div>
                    </AccordionItem>
                </FAQAccordion>
            </div>

        </>
    )
}
