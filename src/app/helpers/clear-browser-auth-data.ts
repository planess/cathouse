/** Storage and cookie keys that hold authorization data in the browser. */
const AUTH_KEYS = ['token'];

/**
 * Removes authorization data kept in the browser: auth keys in
 * `localStorage`, the whole `sessionStorage`, and readable auth cookies.
 * The HTTP-only session cookie is expired by the sign-out API.
 */
export function clearBrowserAuthData(): void {
  try {
    for (const key of AUTH_KEYS) {
      window.localStorage.removeItem(key);
    }

    window.sessionStorage.clear();
  } catch {
    // storage may be unavailable (private mode, blocked site data)
  }

  for (const key of AUTH_KEYS) {
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  }
}
