"use client"
import {useEffect, useState} from "react";

export default function Hydration({children}){

    const[load,setLoad] =useState(false)
    useEffect(() => {
        setLoad(true)
    }, []);

    if(!load){
        return null
    }

    return(
        <>
            {children}

        </>
    )
}