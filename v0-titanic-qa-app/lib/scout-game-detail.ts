export type ScoutPatchContentBlock = {
  type: "text" | "image";
  text?: string | null;
  url?: string | null;
};

export type ScoutPatchNote = {
  id: string;
  title: string;
  publishedAt: string;
  summary: string;
  bodyKo: string;
  imageUrls?: string[];
  contentBlocks?: ScoutPatchContentBlock[];
  sourceUrl?: string;
};

export type ScoutMod = {
  id: string;
  name: string;
  author: string;
  summary: string;
  sourceUrl?: string;
};

export type ScoutRelatedVideo = {
  id: string;
  title: string;
  channel: string;
  publishedAt: string;
  watchUrl: string;
};

export type ScoutGameDetail = {
  steamAppId: number;
  title: string;
  steamStoreUrl: string;
  officialSiteUrl: string;
  patchNotes: ScoutPatchNote[];
  mods: ScoutMod[];
  videos: ScoutRelatedVideo[];
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

const PATCH_CACHE_VERSION = "v5";

export function patchNotesStorageKey(steamAppId: number): string {
  return `scout-patch-notes-${PATCH_CACHE_VERSION}-${steamAppId}`;
}

export function isKoreanPatchNote(note: ScoutPatchNote): boolean {
  const body = note.bodyKo.trim();
  return (
    body.length > 0 &&
    !body.startsWith("【") &&
    /[\uac00-\ud7a3]/.test(body)
  );
}

/** 모달에 쓸 만한 전체 본문이 있는지 */
export function hasFullPatchBody(note: ScoutPatchNote): boolean {
  return isKoreanPatchNote(note) && note.bodyKo.trim().length > 250;
}

/** contentBlocks 텍스트가 한국어인지 */
export function hasKoreanPatchBlocks(note: ScoutPatchNote): boolean {
  return (note.contentBlocks ?? []).some(
    (b) => b.type === "text" && !!b.text && /[\uac00-\ud7a3]/.test(b.text),
  );
}

/** 모달에 바로 표시할 한글 본문·블록이 준비됐는지 */
export function isPatchNoteReady(note: ScoutPatchNote): boolean {
  const blocks = note.contentBlocks ?? [];
  if (!hasKoreanPatchBlocks(note)) {
    return hasFullPatchBody(note) && blocks.length === 0;
  }
  const hasImages = blocks.some((b) => b.type === "image");
  const koreanTextCount = blocks.filter(
    (b) => b.type === "text" && b.text && /[\uac00-\ud7a3]/.test(b.text),
  ).length;
  if (note.id.includes("-steam-") && hasImages && koreanTextCount < 2) {
    return false;
  }
  return true;
}

/** 브라우저에 저장된 한글 패치와 서버 응답 병합 */
export function mergePatchNotesWithCache(
  steamAppId: number,
  serverNotes: ScoutPatchNote[],
): ScoutPatchNote[] {
  if (typeof window === "undefined") return serverNotes;

  try {
    const raw = localStorage.getItem(patchNotesStorageKey(steamAppId));
    if (!raw) return serverNotes;

    const cached = JSON.parse(raw) as ScoutPatchNote[];
    const serverUsesSteam = serverNotes.some((n) => n.id.includes("-steam-"));
    if (serverUsesSteam && cached.some((n) => !n.id.includes("-steam-"))) {
      localStorage.removeItem(patchNotesStorageKey(steamAppId));
      return serverNotes;
    }

    const byId = new Map(cached.map((n) => [n.id, n]));
    return serverNotes.map((note) => {
      const hit = byId.get(note.id);
      if (hit?.id === note.id && (hasFullPatchBody(hit) || hasKoreanPatchBlocks(hit))) {
        return {
          ...note,
          ...hit,
          imageUrls: note.imageUrls?.length ? note.imageUrls : hit.imageUrls,
          contentBlocks: hasKoreanPatchBlocks(hit)
            ? hit.contentBlocks
            : hasKoreanPatchBlocks(note)
              ? note.contentBlocks
              : hit.contentBlocks ?? note.contentBlocks,
        };
      }
      if (hasFullPatchBody(note) || isKoreanPatchNote(note)) return note;
      return note;
    });
  } catch {
    return serverNotes;
  }
}

const _lastSavedByApp = new Map<number, string>();

export function savePatchNotesToCache(
  steamAppId: number,
  notes: ScoutPatchNote[],
): void {
  if (typeof window === "undefined") return;
  if (!notes.some(isKoreanPatchNote)) return;
  try {
    const payload = JSON.stringify(notes);
    if (_lastSavedByApp.get(steamAppId) === payload) return;
    _lastSavedByApp.set(steamAppId, payload);
    localStorage.setItem(patchNotesStorageKey(steamAppId), payload);
  } catch {
    /* storage full 등 */
  }
}

/** Steam 패치는 본문 번역 전 bodyKo 가 비어 있어야 함 */
export function needsPatchNoteTranslation(note: ScoutPatchNote): boolean {
  if (isPatchNoteReady(note)) return false;
  const body = note.bodyKo.trim();
  if (!body) return true;
  if (note.id.includes("-steam-") && !/[\uac00-\ud7a3]/.test(body)) {
    return true;
  }
  if ((note.contentBlocks?.length ?? 0) > 0 && !hasKoreanPatchBlocks(note)) {
    return true;
  }
  return false;
}

/** GET /scout/games/{steamAppId}/patch-notes/{noteId}/korean — Steam 본문 조회·한글 번역 */
export async function fetchPatchNoteKorean(
  steamAppId: number,
  noteId: string,
): Promise<ScoutPatchNote | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch(
      `${apiBaseUrl}/scout/games/${steamAppId}/patch-notes/${encodeURIComponent(noteId)}/korean`,
      { cache: "no-store", signal: controller.signal },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as ScoutPatchNote;
    return {
      ...data,
      bodyKo: data.bodyKo?.trim() ?? "",
      imageUrls: data.imageUrls ?? [],
      contentBlocks: data.contentBlocks ?? [],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** GET /scout/games/{steamAppId}/detail — 실패 시 플레이스홀더 */
export async function fetchScoutGameDetail(
  steamAppId: number,
  title: string,
): Promise<ScoutGameDetail> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(
      `${apiBaseUrl}/scout/games/${steamAppId}/detail`,
      { cache: "no-store", signal: controller.signal },
    );
    if (!res.ok) {
      return getScoutGameDetailPlaceholder(steamAppId, title);
    }
    const data = (await res.json()) as ScoutGameDetail;
    return {
      ...data,
      patchNotes: data.patchNotes.map((note) => ({
        ...note,
        bodyKo: note.bodyKo?.trim() ?? "",
        imageUrls: note.imageUrls ?? [],
        contentBlocks: note.contentBlocks ?? [],
      })),
    };
  } catch {
    return getScoutGameDetailPlaceholder(steamAppId, title);
  } finally {
    clearTimeout(timeout);
  }
}

/** API 연동 전 프론트 플레이스홀더 */
function defaultStoreUrl(steamAppId: number): string {
  return `https://store.steampowered.com/app/${steamAppId}`;
}

export function getScoutGameDetailPlaceholder(
  steamAppId: number,
  title: string,
): ScoutGameDetail {
  const steamStoreUrl = defaultStoreUrl(steamAppId);
  return {
    steamAppId,
    title,
    steamStoreUrl,
    officialSiteUrl: steamStoreUrl,
    patchNotes: [
      {
        id: `${steamAppId}-patch-1`,
        title: "최신 업데이트",
        publishedAt: "2026-05-01",
        summary:
          "밸런스 조정 및 버그 수정이 포함된 최신 빌드입니다. 클릭하면 한글 본문을 볼 수 있습니다.",
        bodyKo: [
          `${title} 최신 업데이트 안내입니다.`,
          "",
          "【개요】",
          "· 밸런스 조정 및 버그 수정이 포함된 빌드가 배포되었습니다.",
          "",
          "【안내】",
          "· Scout 에서 한글로 요약한 패치 노트입니다.",
          "· 원문은 Steam 뉴스 링크에서 확인할 수 있습니다.",
        ].join("\n"),
        sourceUrl: `${steamStoreUrl}/news/`,
      },
    ],
    mods: [
      {
        id: `${steamAppId}-mod-1`,
        name: "커뮤니티 모드 예시",
        author: "Community",
        summary: "Steam Workshop·Nexus 등 모드 목록이 이 영역에 표시됩니다.",
      },
    ],
    videos: [
      {
        id: `${steamAppId}-video-1`,
        title: `${title} 공략·하이라이트`,
        channel: "Scout Curated",
        publishedAt: "2026-04-15",
        watchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
      },
    ],
  };
}
