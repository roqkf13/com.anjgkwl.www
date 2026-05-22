import { LessonSideNav } from "@/components/lesson-side-nav";

export default function LessonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 min-h-0 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <aside className="w-44 sm:w-52 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-6">
        <LessonSideNav />
      </aside>
      <div className="flex flex-1 flex-col min-w-0 min-h-0">{children}</div>
    </div>
  );
}
