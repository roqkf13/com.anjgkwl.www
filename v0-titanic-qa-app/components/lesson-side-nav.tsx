"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const lessonNavItems = [
  { href: "/lesson/titanic/model", label: "타이타닉" },
  { href: "/lesson/titanic/upload", label: "타이타닉 홈" },
] as const;

export function LessonSideNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-col gap-1"
      aria-label="수업용 사이드 메뉴"
    >
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        수업용
      </p>
      {lessonNavItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-100"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
