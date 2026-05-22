import Link from "next/link";
import { LogIn, Sparkles, UserPlus } from "lucide-react";

export function AppNavBar() {
  return (
    <nav className="sticky top-0 z-50 shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity shrink-0"
        >
          Scout
        </Link>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-blue-100 dark:border-blue-400 bg-gradient-to-b from-white to-blue-200 dark:from-gray-100 dark:to-blue-400 text-blue-800 dark:text-blue-900 hover:from-blue-50 hover:to-blue-300 dark:hover:from-white dark:hover:to-blue-300 transition-all shadow-sm"
          >
            <Sparkles size={16} className="text-blue-500 dark:text-blue-600" aria-hidden="true" />
            Gemini
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <LogIn size={16} aria-hidden="true" />
            로그인
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            <UserPlus size={16} aria-hidden="true" />
            회원가입
          </Link>
          <Link
            href="/lesson"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            수업용
          </Link>
        </div>
      </div>
    </nav>
  );
}
