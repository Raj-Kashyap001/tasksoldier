"use client";

import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="border-t bg-background text-foreground py-10 px-4 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Logo & Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">TaskSoldier</h2>
          <p className="text-sm text-muted-foreground">
            Organize your team and your tasks — with ease, clarity, and speed.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Links
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                GitHub
              </Link>
            </li>
            <li>
              <Link href="/docs" className="hover:underline">
                Docs
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Contact */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Support
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TaskSoldier. All rights reserved.
      </div>
    </footer>
  );
}
