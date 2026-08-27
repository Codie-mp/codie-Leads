import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you requested does not exist or has moved.</p>
        <Link className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
