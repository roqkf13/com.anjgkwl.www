"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";

import { AuthPageShell } from "@/components/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setError("백엔드 인증 API가 연결되면 로그인이 활성화됩니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      title="로그인"
      description="계정으로 Titanic QA에 로그인하세요."
      footer={
        <>
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
          >
            회원가입
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">이메일</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">비밀번호</Label>
            <button
              type="button"
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          disabled={submitting}
        >
          <LogIn size={16} aria-hidden />
          {submitting ? "로그인 중…" : "로그인"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
