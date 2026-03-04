import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="max-w-3xl w-full text-center px-6 py-24">
        <div className="mx-auto mb-8 w-40 h-40 md:w-48 md:h-48 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 shadow-xl">
          <svg viewBox="0 0 120 120" className="w-28 h-28 md:w-32 md:h-32 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="56" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
            <g transform="translate(12,12)">
              <text x="0" y="22" fontSize="28" fontWeight="700" fill="white">4</text>
              <g transform="translate(36,6)">
                <circle cx="18" cy="18" r="18" fill="#fff" opacity="0.08" />
                <path d="M10 18 L18 8 L26 18 L18 18 L18 28 Z" fill="white" transform="translate(-6,-4) scale(1.4)" />
              </g>
              <text x="72" y="22" fontSize="28" fontWeight="700" fill="white">4</text>
            </g>
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-2">404</h1>
        <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">The page you are trying to reach could not be found at the moment. Please try again later.</p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="px-6 py-3 rounded bg-blue-500 hover:bg-blue-600 text-white shadow-md">Back to dashboard</Link>
        </div>
      </div>
    </main>
  );
}
