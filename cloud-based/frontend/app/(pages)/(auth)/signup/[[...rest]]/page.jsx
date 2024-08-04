"use client";
import React from "react";


import {
  SignUp,
} from "@clerk/nextjs";

export default function Signup() {
  return (
    <div className="screen flex items-center justify-center  text-white p-4">
      <SignUp forceRedirectUrl="/dashboard" />
    </div>
  );
}

