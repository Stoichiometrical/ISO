"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { navigate } from "@/lib/server-actions";
import Link from "next/link";
import { Spotlight } from "@/components/ui/Spotlight";
import {HomeNav} from "@/components/ui/nav";
import {FeaturesSection} from "@/app/components/FeatureSection";

export default function LandingPage() {
  return (
      <div className="bg-black">
          <div
              className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">

              <h1 className="md:text-7xl text-5xl  font-bold text-center text-white relative z-20">
                  Intelligent Sales Optimisation
              </h1>
              <Spotlight
                  className="top-90 left-40 md:left-60 md:-top-20"
                  fill="purple"
              />
              <h3 className=" text-white  text-center">
                  Without being a data guru, ISO can help you unlock the power of your
                  data to increase sales and improve customer satisfaction
              </h3>
              <div className="w-[40rem] h-40 relative">
                  {/* Gradients */}
                  <div
                      className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm"/>
                  <div
                      className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4"/>
                  <div
                      className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm"/>
                  <div
                      className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4"/>

                  {/* Core component */}
                  <SparklesCore
                      background="transparent"
                      minSize={0.4}
                      maxSize={1}
                      particleDensity={1200}
                      className="w-full h-full"
                      particleColor="#FFFFFF"
                  />

                  {/* Radial Gradient to prevent sharp edges */}
                  <div
                      className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
              </div>
              <Link href="/signup">
                  <button
                      className="inline-flex h-12 animate-shimmer rounded-full items-center justify-center text-center border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 relative z-10">
                      Get Started
                  </button>
              </Link>


          </div>
          <FeaturesSection/>
      </div>

  );
}
