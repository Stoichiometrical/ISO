"use client"
import Image from "next/image";
import gift2 from "@/app/assets/r2.gif";
import gift from "@/app/assets/r3.gif";
import basket from "@/app/assets/basket.png"
import {useState} from "react";
import BundleTable from "@/app/components/BundleTable";

export default function PromoSection({promotions,segment}) {

    const[showPromotions,setShowPromotions] = useState(false);
    console.log(promotions)

  return (

      <div className="flex h-full  flex-grow flex-col justify-between items-center blue-gradient rounded-xl py-6 mx-2">
          <div className="flex items-center">
              <Image src={gift2} alt="Not Found" width="100" height="100"/>
              <div className="text-6xl font-extrabold text-white">PROMOS FOR YOU</div>
              <Image src={gift2} alt="Not Found" width="100" height="100"/>
          </div>

          <div className="flex flex-col items-center text-white font-light">
              <div className="">
                  Because you have been loyal here is a mystery box for you
              </div>
              <Image
                  onClick={() => setShowPromotions(true)}
                  src={gift}
                  alt="Not Found"
                  width="80"
                  height="80"
                  className="cursor-pointer"
              />


          </div>



          {showPromotions && (
              <div className="flex flex-col">
                  <div className="promos flex">
                      {
                          Object.keys(promotions).map((key) => (
                              <div className="p1 flex gap-3 items-center p-3" key={key}>
                                  <Image
                                      src={basket}
                                      alt="Not Found"
                                      width="50"
                                      height="50"
                                      className="cursor-pointer"
                                  />
                                  <div className="text-white font-bold">{key}</div>
                              </div>
                          ))
                      }


                  </div>
                  <BundleTable segment={segment}/>
              </div>

          )}


      </div>
  );
}
