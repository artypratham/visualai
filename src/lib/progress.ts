"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store for lesson completion.
 * No auth, no backend — progress lives in the browser. Synced across
 * components (and across tabs) via useSyncExternalStore.
 */

const KEY = "visualai:progress:v1";
const EMPTY: string[] = [];

const listeners = new Set<() => void>();
let cache: string[] = EMPTY;
let initialized = false;

function read(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function ensure() {
  if (!initialized) {
    cache = read();
    initialized = true;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  ensure();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): string[] {
  ensure();
  return cache;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

export function setCompleted(slug: string, done: boolean) {
  ensure();
  const set = new Set(cache);
  if (done) set.add(slug);
  else set.delete(slug);
  cache = Array.from(set);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota / private-mode errors */
  }
  emit();
}

/** All completed lesson slugs (reactive). */
export function useCompletedSlugs(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Whether a single lesson is complete, plus a toggle/setter. */
export function useLessonProgress(slug: string) {
  const completed = useCompletedSlugs();
  const isComplete = completed.includes(slug);
  const toggle = useCallback(() => setCompleted(slug, !completed.includes(slug)), [slug, completed]);
  const set = useCallback((done: boolean) => setCompleted(slug, done), [slug]);
  return { isComplete, toggle, set };
}
