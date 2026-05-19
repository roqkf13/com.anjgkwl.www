import type { ReactNode } from "react";

type AuthPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthPageShell({
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6 sm:p-8">
          <header className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </header>
          {children}
          <footer className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {footer}
          </footer>
        </div>
      </div>
    </main>
  );
}
