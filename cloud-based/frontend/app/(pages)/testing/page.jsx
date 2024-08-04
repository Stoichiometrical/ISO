"use client";

import Navbar from "@/app/components/Navbar";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { IconClipboardCopy, IconFileBroken } from "@tabler/icons-react";
import { cn } from "@/utils/cn";
import CreateProjectModal, {ConnectMySQL} from "@/components/ui/create-modal";
import { auth } from "@clerk/nextjs/server";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import {Button} from "@nextui-org/react";
import {sendEmail} from "@/lib/server-actions";


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

const items = [
  {
    title: "January Test A",
    description:
      "Variation of treatment with different recommendation parameters",
    header: <Skeleton style={{ background: getRandomColorGradient() }} />,
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "January Test B",
    description:
      "Variation of Test A treatment with different recommendation parameters.",
    header: <Skeleton style={{ background: getRandomColorGradient() }} />,
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
];

export default function DashboardHome() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null;
  }
  console.log(user);


  return (
    <>
      <Navbar />

      <div className="mx-5 flex justify-center  items-center flex-col">
        <div className="text-3xl font-semibold my-4 text-center">
          Projects for {user.fullName}
        </div>
        <BentoGrid className="flex ">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              className={i === 3 || i === 6 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>

        <div className="flex gap-3 my-4 mx-5">
          <CreateProjectModal />
          <ConnectMySQL />
        </div>
      </div>
    </>
  );
}
