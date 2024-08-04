import Link from "next/link";
import ModeToggle from "@/app/components/ModeToggle";
import { SignedIn, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex j p-3 border border-b-gray-200  gap-5">

      <Link href="/" className="logo text-3xl font-extrabold flex-1/4 ml-6">
        ISO
      </Link>



      <div className="absolute right-20 flex justify-center items-center gap-3">
        <UserButton />
        <ModeToggle />
      </div>
    </nav>
  );
}
