"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex" aria-label="CodieLead home"><Logo /></Link>
            <p className="mt-5 text-sm leading-7 text-slate-500">AI-assisted B2B prospecting for teams that want cleaner lists, sharper targeting, and a faster path from research to outreach.</p>
            <Link href="/register" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:gap-3">Start your free workspace <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div><h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Product</h2><nav className="mt-5 flex flex-col gap-3 text-sm font-medium text-slate-600" aria-label="Product links"><a href="#features" className="transition hover:text-blue-700">Why CodieLead</a><a href="#how-it-works" className="transition hover:text-blue-700">How it works</a><a href="#pricing" className="transition hover:text-blue-700">Pricing</a><Link href="/login" className="transition hover:text-blue-700">Sign in</Link></nav></div>
          <div><h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</h2><nav className="mt-5 flex flex-col gap-3 text-sm font-medium text-slate-600" aria-label="Workspace links"><Link href="/register" className="transition hover:text-blue-700">Find leads</Link><Link href="/register" className="transition hover:text-blue-700">Save and export</Link><a href="#faq" className="transition hover:text-blue-700">Questions</a></nav></div>
          <div><h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Company</h2><nav className="mt-5 flex flex-col gap-3 text-sm font-medium text-slate-600" aria-label="Company links"><Link href="/privacy" className="transition hover:text-blue-700">Privacy policy</Link><Link href="/terms" className="transition hover:text-blue-700">Terms of service</Link><a href="mailto:hello@codie.ai" className="transition hover:text-blue-700">Contact</a></nav></div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} CodieLead. Built for better outbound.</p><p>AI-assisted discovery. Human-led outreach.</p></div>
      </div>
    </footer>
  );
}
