"use client";

import { useState, FormEvent } from "react";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type Status = { type: "idle" } | { type: "loading" } | { type: "success"; subject: string; to: string } | { type: "error"; message: string };

export default function EmailPage() {
  const [to, setTo] = useState("");
  const [prompt, setPrompt] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ type: "loading" });

    try {
      const res = await fetch(`${apiBaseUrl}/sherlock-homes/watson/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, prompt, from_account: fromAccount }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = typeof data?.detail === "string" ? data.detail : `요청 실패 (HTTP ${res.status})`;
        setStatus({ type: "error", message: msg });
        return;
      }

      const data = await res.json();
      setStatus({ type: "success", subject: data.subject, to: data.to });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "네트워크 오류" });
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-6">
          <Mail size={24} className="text-blue-500" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI 메일 발송</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              발신자 계정
            </label>
            <input
              type="email"
              required
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              placeholder="sender@gmail.com"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              수신자
            </label>
            <input
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              메일 작성 지시
            </label>
            <textarea
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 프로젝트 일정 변경 안내 메일을 정중하게 작성해줘"
              rows={4}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              EXAONE이 제목과 본문을 자동 생성합니다
            </p>
          </div>

          <button
            type="submit"
            disabled={status.type === "loading"}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {status.type === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                EXAONE 작성 중...
              </>
            ) : (
              <>
                <Mail size={16} />
                발송
              </>
            )}
          </button>
        </form>

        {status.type === "success" && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="text-sm text-green-800 dark:text-green-300">
              <p className="font-medium">발송 완료</p>
              <p className="mt-0.5">수신자: {status.to}</p>
              <p>제목: {status.subject}</p>
            </div>
          </div>
        )}

        {status.type === "error" && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{status.message}</p>
          </div>
        )}
      </div>
    </main>
  );
}
