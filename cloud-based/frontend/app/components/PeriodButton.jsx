import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PeriodButton({ date, promo }) {
  return (
    <div
      className={cn(
        "flex w-fit p-2  border border-b-gray-400 text-white bg-green-600 rounded-2xl m-2 items-center justify-center gap-2",
      )}
    >
      <div className="">{date}</div>
      <Badge variant="outline" className="text-white">
        {promo}
      </Badge>
    </div>
  );
}
