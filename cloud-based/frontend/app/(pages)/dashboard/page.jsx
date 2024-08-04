"use client";

import Navbar from "@/app/components/Navbar";
import {BentoGrid,  Project} from "@/components/ui/bento-grid";
import { IconClipboardCopy, IconFileBroken } from "@tabler/icons-react";
import { cn } from "@/utils/cn";
import  {
    CreateNewProjectModal,
} from "@/components/ui/create-modal";
import { auth } from "@clerk/nextjs/server";
import { useAuth, useUser } from "@clerk/nextjs";
import {useEffect, useState} from "react";
import {API_4} from "@/lib/utils";


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
    console.log(user)
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const fetchProjects = async () => {
                try {
                    const response = await fetch(`${API_4}/projects/user/${user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setProjects(data);
                    } else {
                        console.error('Failed to fetch projects');
                    }
                } catch (error) {
                    console.error('Error fetching projects:', error);
                }
            };

            fetchProjects();
        }
    }, [isLoaded, isSignedIn, user]);

    if (!isLoaded || !isSignedIn) {
        return null;
    }

    return (
        <div className="h-full">
            <Navbar />

            <div className="mx-5 flex justify-center items-center flex-col">
                <div className="text-3xl font-semibold my-4 text-center">
                    Projects for {user.fullName}
                </div>

                <div className="flex gap-3 my-4 mx-5">
                    <CreateNewProjectModal />
                </div>

                <BentoGrid className="flex flex-wrap">
                    {projects.map((project, i) => (
                        <Project
                            key={project._id}
                            title={project.project_name}
                            header={<Skeleton style={{ background: getRandomColorGradient() }} />}
                            className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                        />
                    ))}
                </BentoGrid>
            </div>
        </div>
    );
}


