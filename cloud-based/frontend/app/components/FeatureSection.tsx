import React from "react";
import { useId } from "react";

export function FeaturesSection() {
  return (
    <div className="flex flex-col mb-10 gap-2 mx-5 bg-black">
      <div className="text-4xl font-bold text-center my-4">Our Pledge Of Value</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-10 md:gap-2 max-w-7xl mx-4 my-8">
        {grid.map((feature) => (
          <div
            key={feature.title}
            className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-6 rounded-3xl overflow-hidden w-fit"
          >
            <Grid size={20} />
            <p className="text-base font-bold text-neutral-800 dark:text-white relative z-20">
              {feature.title}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mt-4 text-base font-normal relative z-20">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const grid = [
  {
    title: "Advanced Demand Forecasting",
    description:
      "Our advanced models allow you to accurately predict your demand for the upcoming months, helping you stay on top of market fluctuations to optimize your inventory and innovate your sales strategies. This ensures you can respond effectively to changes and maximize efficiency."
  },
  {
    title: "Precision Customer Value Estimation",
    description:
      "With state-of-the-art models, we help you understand who your high-value customers are and how to provide them with more value. This insight allows you to enhance customer loyalty and increase profitability through targeted strategies and personalized experiences."
  },
  {
    title: "Customizable Prescriptive Engine",
    description:
      "We understand that your goals vary from time to time, so while our advanced models give you the best recommendations, we have made it possible for you to guide it on how best to help you create the most value for your business. In addition to this, you are not bound to only using the insights on our platform; our custom API allows you to connect the results to your own systems."
  }
];


// const grid = [
//   {
//     title: "Advanced Demand Forecasting ",
//     description:
//       "Our advanced models allow you to accurately predict your demand for the upcoming months allowing you to stay on top of market fluctuations  to optimize your inventory and innovate your sales strategies",
//   },
//   {
//     title: "Precision Customer Value Estimation",
//     description:
//       "With state of the art models, we help you understand who your high value customers are and how to give them more value.",
//   },
//   {
//     title: "Customizable Prescriptive Engine ",
//     description:
//       "We understand that your goals vary from time to time, so while our advanced models gives you the best recommendations, we have made it possible for you to guide it on how best to help you create the most value for your business.In addtion to this, you are not bound to only using the insights on our platform, our custom API allows you to connect  the results to your own systems ",
//   }
// ];

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r  [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full  mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}