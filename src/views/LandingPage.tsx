"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  ChevronDown,
  Database,
  Filter,
  Globe2,
  Layers3,
  MapPin,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

type PricingPlan = {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price?: number;
  credits_per_month: number;
  max_members?: number;
  description?: string;
};

const fallbackPlans: PricingPlan[] = [
  {
    id: "starter-plan",
    name: "starter",
    monthly_price: 25,
    yearly_price: 250,
    credits_per_month: 1000,
    max_members: 1,
    description: "For founders building their first repeatable outbound motion.",
  },
  {
    id: "pro-plan",
    name: "pro",
    monthly_price: 100,
    yearly_price: 1000,
    credits_per_month: 5000,
    max_members: 5,
    description: "For teams turning prospecting into a weekly operating system.",
  },
  {
    id: "enterprise-plan",
    name: "enterprise",
    monthly_price: 500,
    yearly_price: 5000,
    credits_per_month: 100000,
    max_members: 25,
    description: "For agencies and GTM teams with custom volume and support needs.",
  },
];

const featureCards = [
  {
    icon: Target,
    eyebrow: "01 / Define",
    title: "Start with the buyer you actually want.",
    text: "Describe your ideal customer in plain language. Industry, location, signals, and the kind of company you want to reach all belong in one focused brief.",
    tone: "bg-blue-50 text-blue-700",
  },
  {
    icon: Search,
    eyebrow: "02 / Discover",
    title: "Find businesses that fit the brief.",
    text: "Use AI-assisted search across Maps and web-grounded business data, with multi-city targeting and filters when your territory gets bigger.",
    tone: "bg-violet-50 text-violet-700",
  },
  {
    icon: WandSparkles,
    eyebrow: "03 / Activate",
    title: "Move from list to next action.",
    text: "Review quality signals, remove duplicates, save the right accounts, export your list, or send it into a campaign when it is ready.",
    tone: "bg-emerald-50 text-emerald-700",
  },
];

const painPoints = [
  {
    icon: Layers3,
    title: "Prospecting starts from a blank spreadsheet",
    text: "Give your team one guided search brief instead of another tab full of filters to decode.",
    label: "A clear starting point",
  },
  {
    icon: Database,
    title: "Every new list creates more duplicate work",
    text: "Smart Search checks existing lead names and domains so your workspace stays useful as it grows.",
    label: "Cleaner list hygiene",
  },
  {
    icon: Zap,
    title: "The handoff from research to outreach is slow",
    text: "Keep discovery, saved leads, exports, and campaigns connected in the same workspace.",
    label: "Faster activation",
  },
];

const faqs = [
  {
    question: "What is CodieLead?",
    answer:
      "CodieLead is a B2B prospecting workspace that turns an ideal customer profile into a clean list of businesses for outbound selling. It combines AI-assisted search, location targeting, enrichment, deduplication, and campaign preparation.",
  },
  {
    question: "How does AI-assisted lead search work?",
    answer:
      "You describe the companies you want in plain language. CodieLead uses the active AI search provider and connected business data to discover matching businesses, then streams the results into your workspace for review.",
  },
  {
    question: "Can I search several cities at once?",
    answer:
      "Yes. Multi-city mode lets you select multiple locations in one search so you can expand a territory without rebuilding the same search from scratch.",
  },
  {
    question: "What can I do with the results?",
    answer:
      "You can review business details, filter and sort results, save leads, export them to CSV or Excel, and add selected leads to campaigns using the existing workspace actions.",
  },
];

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[590px]">
      <div className="absolute -inset-4 rounded-[2rem] bg-blue-500/10 blur-2xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_30px_80px_-32px_rgba(15,23,42,0.45)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Search className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-900">Find leads</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ready to search
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-slate-100 bg-slate-50/70 p-4 md:border-b-0 md:border-r sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Search brief</span>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">AI-assisted</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs font-medium leading-5 text-slate-700">
                Independent fitness studios in Dubai and Abu Dhabi with 4+ rating and an active website.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"><MapPin className="h-3 w-3" /> 2 cities</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"><Filter className="h-3 w-3" /> 4+ rating</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500"><span>Coverage</span><span className="text-slate-900">Multi-city</span></div>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">Dubai <X className="h-3 w-3" /></span>
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">Abu Dhabi <X className="h-3 w-3" /></span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-[10px] font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              Search with this brief
              <ArrowRight className="ml-auto h-3.5 w-3.5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Live results</span>
                <p className="mt-1 text-sm font-bold text-slate-900">12 matching businesses</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">Deduplicated</span>
            </div>
            <div className="space-y-2.5">
              {[
                ["Pulse Fitness Studio", "Dubai · 4.8", "Website found", "92"],
                ["Form House Training", "Abu Dhabi · 4.7", "Ready to review", "87"],
                ["The Movement Lab", "Dubai · 4.6", "Website found", "84"],
              ].map(([name, location, status, score]) => (
                <div key={name} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">{name}</p>
                      <p className="mt-1 text-[10px] text-slate-500">{location}</p>
                    </div>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[10px] font-bold text-emerald-700">{score}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 font-medium text-slate-500"><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> {status}</span>
                    <span className="font-semibold text-blue-700">Save lead</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-semibold">
              <span className="text-slate-400">Streaming in real time</span>
              <span className="text-slate-900">Export list <ArrowRight className="ml-1 inline h-3 w-3" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const LandingPage: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetch("/api/public/pricing-plans")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPlans(false));
  }, []);

  const displayPlans = plans.length > 0 ? plans : fallbackPlans;
  const planHref = (planName: string) =>
    isAuthenticated ? `/app?view=billing&plan=${planName}` : `/register?plan=${planName}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8fa] text-slate-950 selection:bg-blue-200">
      <header className="relative z-20 border-b border-slate-200/80 bg-[#f7f8fa]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10" aria-label="Main navigation">
          <Link href="/" aria-label="CodieLead home" className="shrink-0"><Logo /></Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <a className="transition-colors hover:text-slate-950" href="#features">Why CodieLead</a>
            <a className="transition-colors hover:text-slate-950" href="#how-it-works">How it works</a>
            <a className="transition-colors hover:text-slate-950" href="#pricing">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 sm:inline-flex">Sign in</Link>
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Start free <ArrowRight className="h-4 w-4" /></a>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-slate-200/80 bg-[#f7f8fa]" aria-labelledby="hero-title">
          <div className="absolute inset-0 -z-10 opacity-60" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "linear-gradient(to bottom, black, transparent 80%)" }} />
          <div className="absolute -right-28 top-20 -z-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -left-28 bottom-0 -z-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" aria-hidden="true" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-10 lg:pt-28">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-blue-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> B2B prospecting, made practical</div>
              <h1 id="hero-title" className="max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.45rem]">Turn your ICP into a <span className="text-blue-700">pipeline worth working.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">Find the right businesses, keep your lists clean, and move from cold prospecting to a confident next step — all in one AI-assisted workspace.</p>
              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <a href="#pricing" className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto">Start your free workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></a>
                <a href="#how-it-works" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"><Play className="h-4 w-4 fill-current" /> See how it works</a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> No credit card required</span><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> 14-day free trial</span></div>
            </div>
            <ProductPreview />
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white" aria-label="Product capabilities">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 px-5 sm:grid-cols-4 sm:px-8 lg:px-10">
            {[
              [BrainCircuit, "AI-assisted", "search briefs"],
              [MapPin, "Multi-city", "territory targeting"],
              [ShieldCheck, "Smart Search", "deduplicated lists"],
              [Users, "One workspace", "from lead to campaign"],
            ].map(([Icon, title, text]) => (
              <div key={String(title)} className="flex items-center gap-3 px-3 py-5 first:pl-0 sm:px-6 sm:py-7 sm:first:pl-0"><Icon className="h-5 w-5 shrink-0 text-blue-700" /><div><p className="text-xs font-bold text-slate-900 sm:text-sm">{String(title)}</p><p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">{String(text)}</p></div></div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10" aria-labelledby="features-title">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">The prospecting gap</p><h2 id="features-title" className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Less list-building. More conversations worth having.</h2><p className="mt-5 text-lg leading-8 text-slate-600">CodieLead is designed around the moments that slow outbound teams down: unclear targeting, messy data, and a handoff that loses momentum.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {painPoints.map(({ icon: Icon, title, text, label }) => <article key={title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50 sm:p-8"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition group-hover:bg-blue-600 group-hover:text-white"><Icon className="h-5 w-5" /></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">{label}</span></div><h3 className="mt-7 text-xl font-bold tracking-[-0.02em] text-slate-950">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></article>)}
          </div>
        </section>

        <section id="how-it-works" className="overflow-hidden bg-slate-950 text-white" aria-labelledby="workflow-title">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
            <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">A shorter path to useful pipeline</p><h2 id="workflow-title" className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">From brief to outreach-ready in three moves.</h2></div><p className="max-w-xl text-lg leading-8 text-slate-300">You do not need another complicated command center. You need a clear workflow that helps you decide what to search, what to keep, and what to do next.</p></div>
            <div className="mt-14 grid gap-0 border-y border-white/10 md:grid-cols-3">
              {featureCards.map(({ icon: Icon, eyebrow, title, text, tone }, index) => <article key={eyebrow} className="relative border-b border-white/10 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"><div className="flex items-center justify-between"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div><span className="text-xs font-bold text-slate-500">{eyebrow}</span></div><h3 className="mt-7 max-w-xs text-xl font-bold leading-8">{title}</h3><p className="mt-3 max-w-sm text-sm leading-7 text-slate-400">{text}</p><div className="mt-7 flex items-center gap-2 text-xs font-bold text-blue-300"><span>0{index + 1}</span><span className="h-px w-8 bg-blue-400/50" /> Done with focus</div></article>)}
            </div>
          </div>
        </section>

        <section className="bg-[#eef3fb] px-5 py-20 sm:px-8 sm:py-28 lg:px-10" aria-labelledby="product-title">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="max-w-lg"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">A workspace built for action</p><h2 id="product-title" className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Your search should end with a next step.</h2><p className="mt-5 text-lg leading-8 text-slate-600">Keep the signal visible: where a lead came from, why it matches, whether it is already in your workspace, and what your team can do with it now.</p><div className="mt-8 space-y-4">{["See fit signals before you save", "Expand coverage with multi-city search", "Export or activate without reformatting"].map((item) => <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-800"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm"><Check className="h-3.5 w-3.5" /></span>{item}</div>)}</div><Link href={isAuthenticated ? "/app?view=search" : "/register"} className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:gap-3">Open the workspace <ArrowRight className="h-4 w-4" /></Link></div>
            <ProductPreview />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10" aria-labelledby="use-cases-title">
          <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Built for the way teams sell</p><h2 id="use-cases-title" className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">One workflow. Different growth motions.</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">Whether you own the list, run the agency, or manage the motion, the job is the same: find the right accounts and make the next action easier.</p></div>
          <div className="grid gap-0 md:grid-cols-3">
            {[
              [Globe2, "Founder-led sales", "Build a focused list around the market you know best — without spending the day in tabs."],
              [Users, "Agencies & SDR teams", "Repeat searches across clients, cities, and campaigns while keeping list quality under control."],
              [Target, "GTM operators", "Give sellers a clear handoff from account discovery to saved lead, export, or campaign."],
            ].map(([Icon, title, text]) => <article key={String(title)} className="border-b border-slate-200 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"><Icon className="h-6 w-6 text-blue-700" /><h3 className="mt-5 text-lg font-bold text-slate-950">{String(title)}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{String(text)}</p></article>)}
          </div>
        </section>

        <section id="pricing" className="bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-10" aria-labelledby="pricing-title">
          <div className="mx-auto max-w-7xl"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Pricing that scales with your search</p><h2 id="pricing-title" className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Start focused. Scale when the motion works.</h2><p className="mt-5 text-lg leading-8 text-slate-600">Choose a workspace that matches your current prospecting volume. Upgrade when your pipeline earns it.</p></div>
            {loadingPlans ? <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3" aria-label="Loading pricing plans"><div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" /><div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" /><div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" /></div> : <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">{displayPlans.map((plan) => { const isPro = plan.name.toLowerCase() === "pro"; const memberCount = plan.max_members || (isPro ? 5 : 1); return <article key={plan.id} className={`relative flex flex-col rounded-2xl border p-7 sm:p-8 ${isPro ? "border-slate-950 bg-slate-950 text-white shadow-2xl shadow-blue-900/20 md:-translate-y-3" : "border-slate-200 bg-[#f8fafc] text-slate-950"}`}>{isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">Most popular</div>}<div className="flex items-center justify-between"><h3 className="text-xl font-bold capitalize">{plan.name}</h3>{isPro && <Sparkles className="h-5 w-5 text-blue-300" />}</div><p className={`mt-3 min-h-14 text-sm leading-6 ${isPro ? "text-slate-400" : "text-slate-500"}`}>{plan.description || "A practical starting point for your outbound workflow."}</p><div className="mt-6 flex items-end gap-1"><span className="text-4xl font-semibold tracking-[-0.04em]">${plan.monthly_price}</span><span className={`pb-1 text-sm ${isPro ? "text-slate-400" : "text-slate-500"}`}>/mo</span></div><div className={`mt-1 text-xs ${isPro ? "text-slate-400" : "text-slate-500"}`}>or ${plan.yearly_price || plan.monthly_price * 10} billed yearly</div><div className={`my-7 h-px ${isPro ? "bg-white/10" : "bg-slate-200"}`} /><ul className="flex-1 space-y-4 text-sm">{[`${plan.credits_per_month.toLocaleString()} credits / month`, `${memberCount} team member${memberCount !== 1 ? "s" : ""}`, "Business discovery search", "Save and export lead lists", "AI-assisted enrichment"].map((item) => <li key={item} className="flex items-start gap-3"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${isPro ? "text-blue-300" : "text-blue-700"}`} /><span>{item}</span></li>)}</ul><Link href={planHref(plan.name)} className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${isPro ? "bg-white text-slate-950 hover:bg-blue-50" : "bg-slate-950 text-white hover:bg-blue-700"}`}>{plan.name === "enterprise" ? "Talk to sales" : `Start ${plan.name}`} <ArrowRight className="h-4 w-4" /></Link></article>; })}</div>}
            <p className="mt-6 text-center text-xs text-slate-500">All plans include a 14-day free trial. Usage and plan details are managed in your workspace.</p>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="faq-title"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Questions, answered clearly</p><h2 id="faq-title" className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">What should you know before you start?</h2></div><div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">{faqs.map(({ question, answer }) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-base font-bold text-slate-900 marker:hidden [&::-webkit-details-marker]:hidden"><span>{question}</span><ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" /></summary><p className="max-w-3xl pt-3 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></section>

        <section className="mx-5 mb-20 overflow-hidden rounded-3xl bg-blue-700 px-6 py-14 text-center text-white sm:mx-8 sm:px-10 sm:py-20 lg:mx-auto lg:max-w-7xl" aria-labelledby="final-cta-title"><div className="mx-auto max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Make outbound easier to start</p><h2 id="final-cta-title" className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">The next good account is closer than another spreadsheet.</h2><p className="mt-5 text-lg leading-8 text-blue-100">Build the search brief, see the signal, and give your team a list they can actually work.</p><a href="#pricing" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-800 transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700">Start your free workspace <ArrowRight className="h-4 w-4" /></a></div></section>
      </main>

      <Footer />
    </div>
  );
};
