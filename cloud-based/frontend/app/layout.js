import { GeistSans } from "geist/font/sans";

import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "@/app/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const metadata = {
  title: "Intelligent Sales Optimization",
  description: "Next generation sales optimization tool",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body className={GeistSans.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
