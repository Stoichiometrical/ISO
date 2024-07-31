// "use client"
//
// import { AcmeLogo } from "@/components/ui/AcmeLogo";
// import { Link } from "@nextui-org/react";
// import { IoMdMenu } from "react-icons/io";
// import { UserButton } from "@clerk/nextjs";
// import ModeToggle from "@/app/components/ModeToggle";
// import React, {useEffect, useState} from "react";
// import TestLab from "@/app/(pages)/test/page";
// import PredictiveLab from "@/app/components/main-components/PredictiveDashboard";
// import {BsGraphUpArrow} from "react-icons/bs";
// import {AiOutlineExperiment, AiOutlineMedicineBox} from "react-icons/ai";
// import {HiOutlineClipboardDocumentList} from "react-icons/hi2";
// import PrescriptiveLab from "@/app/components/main-components/PrescriptiveDashboard";
// import APIDocumentation from "@/app/components/main-components/ApiDocumentation";
// import { getCookie} from "@/lib/utils";
//
// export default function MainLayout() {
//     const [isSidebarVisible, setIsSidebarVisible] = useState(true);
//     const [selectedItem, setSelectedItem] = useState('');
//     const [apiName, setApiName] = useState('');
//
//     useEffect(() => {
//         if (typeof window !== 'undefined') {
//             // Client-side only code
//             const cookie = getCookie();
//             setApiName(cookie);
//         }
//     }, []);
//
//     const toggleSidebar = () => {
//         setIsSidebarVisible(!isSidebarVisible);
//     };
//
//     const renderContent = () => {
//         switch (selectedItem) {
//             case 'Predictive lab':
//                 return <PredictiveLab/>;
//             case 'Prescriptive lab':
//                 return <PrescriptiveLab/>;
//             case 'Testlab':
//                 return <TestLab />;
//             case 'Api Documentation':
//                 return <APIDocumentation api_name={apiName}/>;
//             default:
//                 return <PredictiveLab/>;
//         }
//     };
//
//     return (
//         <div className="w-full h-full min-h-screen flex flex-col">
//             <div className="p-3 flex w-full justify-between">
//                 <div className="flex gap-3 items-center justify-center ">
//                     <AcmeLogo />
//                     <Link color="foreground" href="/public" className="logo text-3xl font-extrabold">
//                         ISO
//                     </Link>
//                     <IoMdMenu
//                         width="60px"
//                         height="60px"
//                         className="cursor-pointer text-3xl"
//                         onClick={toggleSidebar}
//                     />
//                 </div>
//
//                 <div className="right-20 w-full flex items-center justify-end gap-3 mr-7 text-2xl">
//                     <div className="flex gap-4">
//                         <Link color="foreground" href="/dashboard">
//                             Projects
//                         </Link>
//                         <Link color="foreground" href="/reports">
//                             Reports
//                         </Link>
//                         <Link color="foreground" href="/faq">
//                             FAQs
//                         </Link>
//                     </div>
//                     <UserButton />
//                     <ModeToggle />
//                 </div>
//             </div>
//             <div className="flex h-full flex-1">
//                 {isSidebarVisible && (
//                     <div className="w-[200px] h-screen p-3">
//                         <div className="flex flex-col gap-3 ">
//                             <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-black rounded-xl text-md p-2 mt-2 pl-3 flex gap-2 items-center" onClick={() => setSelectedItem('Predictive lab')}>
//                                 <BsGraphUpArrow />
//                                 Predictive Lab
//                             </div>
//                             <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-black rounded-xl p-2 pl-3 text-md flex gap-2 items-center" onClick={() => setSelectedItem('Prescriptive lab')}>
//                                 <AiOutlineMedicineBox />
//                                 Prescriptive Lab
//                             </div>
//                             <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-black rounded-xl p-2 pl-3 text-md flex gap-2 items-center" onClick={() => setSelectedItem('Testlab')}>
//                                 <AiOutlineExperiment />
//                                 Test Lab
//                             </div>
//                             <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-black rounded-xl p-2 pl-3 text-md flex gap-2 items-center" onClick={() => setSelectedItem('Api Documentation')}>
//                                 <HiOutlineClipboardDocumentList />
//                                 API Documentation
//                             </div>
//                         </div>
//                     </div>
//                 )}
//                 <div className={`rounded-xl p-2 ml-1 border border-gray-300 flex-1 mr-3 opacity-2 bg-gray-100 dark:bg-gray-800 ${isSidebarVisible ? '' : 'w-full'}`}>
//                     <div className="px-2">
//                         {renderContent()}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
//



"use client"

import { AcmeLogo } from "@/components/ui/AcmeLogo";
import { Link } from "@nextui-org/react";
import { IoMdMenu } from "react-icons/io";
import { UserButton } from "@clerk/nextjs";
import ModeToggle from "@/app/components/ModeToggle";
import React, { useEffect, useState } from "react";
import TestLab from "@/app/(pages)/test/page";
import PredictiveLab from "@/app/components/main-components/PredictiveDashboard";
import { BsGraphUpArrow } from "react-icons/bs";
import { AiOutlineExperiment, AiOutlineMedicineBox } from "react-icons/ai";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import PrescriptiveLab from "@/app/components/main-components/PrescriptiveDashboard";
import APIDocumentation from "@/app/components/main-components/ApiDocumentation";
import { getCookie } from "@/lib/utils";

export default function MainLayout() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [selectedItem, setSelectedItem] = useState('');
    const [apiName, setApiName] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Client-side only code
            const cookie = getCookie();
            setApiName(cookie);
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const renderContent = () => {
        switch (selectedItem) {
            case 'Predictive lab':
                return <PredictiveLab />;
            case 'Prescriptive lab':
                return <PrescriptiveLab />;
            case 'Testlab':
                return <TestLab />;
            case 'Api Documentation':
                return <APIDocumentation api_name={apiName} />;
            default:
                return <PredictiveLab />;
        }
    };

    return (
        <div className="w-full h-full min-h-screen flex flex-col">
            <div className="p-3 flex w-full justify-between">
                <div className="flex gap-3 items-center justify-center ">
                    <AcmeLogo />
                    <Link color="foreground" href="/public" className="logo text-3xl font-extrabold">
                        ISO
                    </Link>
                    <IoMdMenu
                        width="60px"
                        height="60px"
                        className="cursor-pointer text-3xl"
                        onClick={toggleSidebar}
                    />
                </div>

                <div className="right-20 w-full flex items-center justify-end gap-3 mr-7 text-2xl">
                    <div className="flex gap-4">
                        <Link color="foreground" href="/dashboard">
                            Projects
                        </Link>
                        <Link color="foreground" href="/reports">
                            Reports
                        </Link>
                        <Link color="foreground" href="/faq">
                            FAQs
                        </Link>
                    </div>
                    <UserButton />
                    <ModeToggle />
                </div>
            </div>
            <div className="flex h-full flex-1">
                {isSidebarVisible && (
                    <div className="w-[200px] h-screen p-3">
                        <div className="flex flex-col gap-3 ">
                            <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-black rounded-xl text-md p-2 mt-2 pl-3 flex gap-2 items-center" onClick={() => setSelectedItem('Predictive lab')}>
                                <BsGraphUpArrow />
                                Predictive Lab
                            </div>
                            <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-black rounded-xl p-2 pl-3 text-md flex gap-2 items-center" onClick={() => setSelectedItem('Prescriptive lab')}>
                                <AiOutlineMedicineBox />
                                Prescriptive Lab
                            </div>
                            <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-black rounded-xl p-2 pl-3 text-md flex gap-2 items-center" onClick={() => setSelectedItem('Testlab')}>
                                <AiOutlineExperiment />
                                Test Lab
                            </div>
                            <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-black rounded-xl p-2 pl-3 text-md flex gap-2 items-center" onClick={() => setSelectedItem('Api Documentation')}>
                                <HiOutlineClipboardDocumentList />
                                API Documentation
                            </div>
                        </div>
                    </div>
                )}
                <div className={`rounded-xl p-2 ml-1 border border-gray-300 flex-1 mr-3 opacity-2 bg-gray-100 dark:bg-gray-800 ${isSidebarVisible ? '' : 'w-full'}`}>
                    <div className="px-2">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

