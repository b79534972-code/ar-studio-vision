const RETRY_PREFIX = "lazy-retry:";

export function lazyWithRetry<TModule>(
  importer: () => Promise<TModule>,
  cacheKey: string,
): Promise<TModule> {
  return importer().catch((error) => {
    const storageKey = `${RETRY_PREFIX}${cacheKey}`;
    const hasRetried = sessionStorage.getItem(storageKey) === "1";

    if (!hasRetried && typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "1");
      window.location.reload();
      return new Promise<TModule>(() => {});
    }

    sessionStorage.removeItem(storageKey);
    throw error;
  }).then((module) => {
    sessionStorage.removeItem(`${RETRY_PREFIX}${cacheKey}`);
    return module;
  });
}
