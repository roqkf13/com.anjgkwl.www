"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  Puzzle,
  Youtube,
} from "lucide-react";

import { ScoutPatchNoteModal } from "@/components/scout-patch-note-modal";
import { STEAM_CDN, getScoutGenre } from "@/lib/scout-genres";
import {
  fetchPatchNoteKorean,
  fetchScoutGameDetail,
  hasFullPatchBody,
  mergePatchNotesWithCache,
  needsPatchNoteTranslation,
  savePatchNotesToCache,
  type ScoutGameDetail,
  type ScoutPatchNote,
} from "@/lib/scout-game-detail";

type ScoutGameDetailViewProps = {
  genreId: string;
  steamAppId: number;
  initialTitle: string;
};

export function ScoutGameDetailView({
  genreId,
  steamAppId,
  initialTitle,
}: ScoutGameDetailViewProps) {
  const [detail, setDetail] = useState<ScoutGameDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [patchNotes, setPatchNotes] = useState<ScoutPatchNote[]>([]);
  const [openNote, setOpenNote] = useState<ScoutPatchNote | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const prefetchStarted = useRef(false);

  useEffect(() => {
    prefetchStarted.current = false;
  }, [steamAppId]);

  const genre = getScoutGenre(genreId);
  if (!genre) return null;

  const title = detail?.title ?? initialTitle;
  const showSteamLink =
    detail &&
    detail.steamStoreUrl !== detail.officialSiteUrl;

  useEffect(() => {
    let cancelled = false;
    setDetailLoading(true);
    fetchScoutGameDetail(steamAppId, initialTitle)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setPatchNotes(mergePatchNotesWithCache(steamAppId, d.patchNotes));
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [steamAppId, initialTitle]);

  useEffect(() => {
    if (patchNotes.length === 0) return;
    savePatchNotesToCache(steamAppId, patchNotes);
  }, [steamAppId, patchNotes]);

  useEffect(() => {
    if (detailLoading || prefetchStarted.current) return;
    const pending = patchNotes.filter(
      (n) => needsPatchNoteTranslation(n) && !hasFullPatchBody(n),
    );
    if (pending.length === 0) return;
    prefetchStarted.current = true;

    let cancelled = false;
    (async () => {
      for (const note of pending) {
        if (cancelled) return;
        const full = await fetchPatchNoteKorean(steamAppId, note.id);
        if (cancelled || !full) continue;
        setPatchNotes((prev) => {
          const next = prev.map((n) => (n.id === full.id ? full : n));
          savePatchNotesToCache(steamAppId, next);
          return next;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [detailLoading, patchNotes, steamAppId]);

  function updateNoteInList(note: ScoutPatchNote) {
    setPatchNotes((prev) => {
      const next = prev.map((n) => (n.id === note.id ? note : n));
      savePatchNotesToCache(steamAppId, next);
      return next;
    });
  }

  async function openPatchNote(note: ScoutPatchNote) {
    const current = patchNotes.find((n) => n.id === note.id) ?? note;
    setOpenNote(current);
    setDetailError(false);

    if (hasFullPatchBody(current)) return;

    setLoadingDetail(true);
    try {
      const full = await fetchPatchNoteKorean(steamAppId, note.id);
      if (full && hasFullPatchBody(full)) {
        setOpenNote(full);
        updateNoteInList(full);
      } else {
        setDetailError(true);
      }
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col min-h-0 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="relative h-40 sm:h-48 shrink-0 overflow-hidden bg-gray-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${STEAM_CDN}/${steamAppId}/library_hero.jpg`}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${genre.overlayClass} opacity-90`}
          aria-hidden
        />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-6">
          <p className="text-xs text-white/70 mb-1">{genre.label}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
            {title}
          </h1>
          {detail && (
            <div className="flex flex-wrap gap-2 mt-3">
              <a
                href={detail.officialSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-white/95 text-gray-900 hover:bg-white transition-colors shadow-sm"
              >
                <ExternalLink size={16} aria-hidden />
                공식 사이트
              </a>
              {showSteamLink && (
                <a
                  href={detail.steamStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-black/40 text-white border border-white/30 hover:bg-black/55 transition-colors"
                >
                  <ExternalLink size={16} aria-hidden />
                  Steam 스토어
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              href={genre.href}
              className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft size={16} aria-hidden />
              {genre.label} 허브
            </Link>
            <span className="text-gray-300 dark:text-gray-600" aria-hidden>
              /
            </span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              게임 상세
            </span>
          </nav>

          <section aria-labelledby="patch-notes-heading">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={20} className="text-violet-600" aria-hidden />
              <h2 id="patch-notes-heading" className="text-lg font-semibold">
                최신 패치노트
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Steam 공식 패치를 한글로 불러옵니다. 항목을 누르면 번역된 전문을
              바로 볼 수 있습니다.
            </p>
            {detailLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-6">
                <Loader2 size={18} className="animate-spin" aria-hidden />
                패치 목록 불러오는 중…
              </div>
            ) : (
              <ul className="space-y-3">
                {patchNotes.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => openPatchNote(note)}
                      className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {note.title}
                        </h3>
                        <ChevronRight
                          size={18}
                          className="shrink-0 text-gray-400 mt-0.5"
                          aria-hidden
                        />
                      </div>
                      <time
                        dateTime={note.publishedAt}
                        className="text-xs text-gray-500"
                      >
                        {note.publishedAt}
                      </time>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {note.summary}
                      </p>
                      <span className="mt-2 inline-block text-xs font-medium text-violet-600 dark:text-violet-400">
                        한글 전문 보기
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {detail && (
            <>
              <section aria-labelledby="mods-heading">
                <div className="flex items-center gap-2 mb-4">
                  <Puzzle size={20} className="text-violet-600" aria-hidden />
                  <h2 id="mods-heading" className="text-lg font-semibold">
                    모드
                  </h2>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detail.mods.map((mod) => (
                    <li
                      key={mod.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
                    >
                      <h3 className="font-medium">{mod.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{mod.author}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {mod.summary}
                      </p>
                      {mod.sourceUrl && (
                        <a
                          href={mod.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-violet-600 dark:text-violet-400 hover:underline"
                        >
                          모드 페이지
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="videos-heading">
                <div className="flex items-center gap-2 mb-4">
                  <Youtube size={20} className="text-red-600" aria-hidden />
                  <h2 id="videos-heading" className="text-lg font-semibold">
                    관련 영상
                  </h2>
                </div>
                <ul className="space-y-3">
                  {detail.videos.map((video) => (
                    <li
                      key={video.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
                    >
                      <a
                        href={video.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                      >
                        {video.title}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">
                        {video.channel} · {video.publishedAt}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </div>

      {openNote && (
        <ScoutPatchNoteModal
          note={openNote}
          gameTitle={title}
          isLoading={loadingDetail}
          loadError={detailError}
          onClose={() => {
            setOpenNote(null);
            setDetailError(false);
          }}
        />
      )}
    </main>
  );
}
