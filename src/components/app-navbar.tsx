"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ToggleTheme } from "./toggle-theme";
import { ThemeToggleMobile } from "./toggle-theme-mobile";

const AppNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full px-4 py-3 border-b bg-background/95 sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          <span className="font-semibold text-lg text-foreground">
            Tasksoldier
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-4">
          <ToggleTheme />
          <Link href="/auth/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Sign Up</Button>
          </Link>
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px]">
              <div className="flex flex-col space-y-4 mt-4">
                <ThemeToggleMobile />
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="link"
                    className="w-full text-xl underline active:text-accent justify-start"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                  <Button
                    variant={"link"}
                    className="w-full active:text-accent text-xl underline justify-start"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;
