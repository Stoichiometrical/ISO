"use client";

import { motion, MotionValue } from "framer-motion";
import React from "react";
import {cn} from "../../utils/cn";

const transition = {
    duration: 0,
    ease: "linear",
};

export const GoogleGeminiEffect = ({
                                       pathLengths,
                                       title,
                                       description,
                                       className,
                                   }: {
    pathLengths: MotionValue[];
    title?: string;
    description?: string;
    className?: string;
}) => {
    return (
        <div className={cn("sticky top-80", className)}>
            <p className="md:text-7xl font-bold pb-4 text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-300">
                {title || `Intelligent Sales Optimisation`}
            </p>
            <p className="text-xs md:text-4xl font-bold text-center text-neutral-400 mt-4 max-w-lg mx-auto">
                {description ||
                    `Scroll this component and see the bottom SVG come to life wow this
        works!`}
            </p>
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
                             <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
                         <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
                            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

            <div
                className="w-full h-[890px] -top-60 md:-top-40  flex items-center justify-center bg-red-transparent absolute ">
                <button
                    className="inline-flex h-12 animate-shimmer rounded-full items-center justify-center border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                    Get Started
                </button>
            </div>

        </div>
    );
};
