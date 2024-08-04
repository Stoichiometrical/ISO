import React from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button} from "@nextui-org/react";
import {AcmeLogo} from "./AcmeLogo.jsx";
import {UserButton} from "@clerk/nextjs";
import ModeToggle from "@/app/components/ModeToggle";
import { IoMdMenu } from "react-icons/io";



export  function HomeNav() {
    return (
        <Navbar disableAnimation isBordered>
            <NavbarContent className="sm:hidden" justify="start">
                <NavbarMenuToggle />
            </NavbarContent>

            <NavbarContent className="sm:hidden pr-3" justify="end">
                <NavbarBrand>
                    <AcmeLogo />
                    <p className="font-bold text-inherit">ISO</p>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-4" justify="end">
                <NavbarBrand>
                    <AcmeLogo />
                    <p className="font-bold text-inherit">ISO</p>
                </NavbarBrand>
                <NavbarItem>
                    <Link color="foreground" href="#">
                        Products
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link href="#">Login</Link>
                </NavbarItem>
                <NavbarItem>
                    <Button as={Link} color="warning" href="#" variant="flat">
                        Sign Up
                    </Button>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#">
                        Contact Us
                    </Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarMenu>
                <NavbarMenuItem>
                    <Link className="w-full" color="foreground" href="#">
                        Products
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link className="w-full" href="#">
                        Login
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Button as={Link} color="warning" href="#" variant="flat" className="w-full">
                        Sign Up
                    </Button>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link className="w-full" color="foreground" href="#">
                        Contact Us
                    </Link>
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
}


export  default function NewNavigation(){
    return(
        <div className="p-3 flex w-full justify-between border border-b-gray-400">
            <div className="flex gap-3 items-center justify-center ">
                <AcmeLogo/>
                <Link color="foreground" href="#" className="logo text-3xl font-extrabold">
                    ISO
                </Link>
                <IoMdMenu width="60px" height="60px" className="cursor-pointer text-3xl"/>
            </div>


            <div className="right-20 w-full   flex items-center justify-end gap-3  mr-7 text-2xl">
                <div className="flex gap-4">
                    <Link color="foreground" href="#">
                        Projects
                    </Link>
                    <Link color="foreground" href="#">
                        FAQs
                    </Link>
                </div>
                <UserButton/>
                <ModeToggle/>
            </div>

        </div>
    )
}


