"use client";

import Navbar from "@/app/components/Navbar";
import {BentoGrid, BentoGridItem,  Report} from "@/components/ui/bento-grid";
import CreateProjectModal, {ConnectMySQL, CreateReportModal, StartNewProjectModal} from "@/components/ui/create-modal";
import { useAuth, useUser } from "@clerk/nextjs";
import {getProjectName, updateCookie, setProjectName, API_4} from "@/lib/utils";
import {useEffect, useState} from "react";


// Function to generate a random color
function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to generate a random gradient
function getRandomColorGradient() {
    const color1 = getRandomColor();
    const color2 = getRandomColor();
    return `linear-gradient(to bottom right, ${color1}, ${color2})`;
}

const Skeleton = ({ style }) => (
    <div
        className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl"
        style={style}
    ></div>
);

export default function DashboardHome() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [reports, setReports] = useState([]);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const fetchReports = async () => {
                try {
                    const projectName = getProjectName();
                    console.log(projectName)
                    const response = await fetch(`${API_4}/projects/name/${projectName}/reports`);
                    if (response.ok) {
                        const data = await response.json();
                        setReports(data.reports);
                    } else {
                        console.error('Failed to fetch reports');
                    }d 
                } catch (error) {
                    console.error('Error fetching reports:', error);
                }
            };

            fetchReports();
        }
    }, [isLoaded, isSignedIn]);

    if (!isLoaded || !isSignedIn) {
        return null;
    }

    return (
        <>
            <Navbar />
              {/*{  setProjectName("5Final_5Uq5B5HVVoU63SkracaViP") }*/}

            <div className="mx-5 flex justify-center items-center flex-col">
                <div className="text-3xl font-semibold my-4 text-center">
                    Reports for First Quarter
                </div>
                <div className="flex gap-3 my-4 mx-5">
                    <CreateReportModal/>
                </div>
                <BentoGrid className="flex ">
                    {reports.map((report, i) => (
                        <Report
                            key={i}
                            title={report}
                            description={`Description for ${report}`}
                            header={<Skeleton style={{ background: getRandomColorGradient() }} />}
                            className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                        />
                    ))}
                </BentoGrid>
            </div>
        </>
    );
}

