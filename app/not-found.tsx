import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-900 to-slate-950 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-white">
          Page Not Found
        </h2>
        <p className="mt-2 text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/50"
      >
        Return Home
      </Link>

      <div className="mt-12 text-center text-sm text-slate-500">
        <p>If you believe this is a mistake, please contact support.</p>
      </div>
    </div>
  );
}
