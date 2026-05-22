const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function formatModelText(data: unknown): string {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

export default async function TitanicModelPage() {
  let modelText = "";
  let loadError: string | null = null;

  try {
    const res = await fetch(`${apiBaseUrl}/titanic/model`, { cache: "no-store" });
    if (!res.ok) {
      loadError = `서버 응답 오류 (HTTP ${res.status})`;
    } else {
      const data: unknown = await res.json();
      modelText = formatModelText(data);
    }
  } catch {
    loadError = "백엔드에 연결할 수 없습니다. API 서버가 실행 중인지 확인하세요.";
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 sm:px-10 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        타이타닉 모델 분석
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
        결정 트리·랜덤 포레스트 등으로 학습한 생존 예측 모델의 이름과 정확도를
        백엔드 <code className="text-xs">GET /titanic/model</code> 결과로 표시합니다.
      </p>

      {loadError ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 max-w-2xl"
        >
          {loadError}
        </p>
      ) : (
        <pre className="max-w-3xl whitespace-pre-wrap break-words rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-5 py-4 text-sm font-mono leading-relaxed">
          {modelText || "(모델 정보가 비어 있습니다)"}
        </pre>
      )}
    </main>
  );
}
