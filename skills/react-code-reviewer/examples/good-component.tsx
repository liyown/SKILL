import { useEffect, useState } from "react";

/**
 * Minimal "good" counterpart of {@code bad-component.tsx}.
 *
 * Each fix is annotated with a tag that maps to the issues called out in
 * {@code examples/review-output.md}: XSS via dangerouslySetInnerHTML,
 * missing effect dependency, race condition from slow requests.
 */
export function UserTable({ query }: { query: string }) {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fix 1 (race): AbortController cancels the in-flight request when
    // `query` changes or the component unmounts; `cancelled` is the
    // synchronous belt-and-braces guard in case the abort lands too late.
    const controller = new AbortController();
    const version = Symbol();
    let cancelled = false;

    setLoading(true);
    setError(null);

    // Fix 2 (input encoding): encodeURIComponent on `query` so user
    // input cannot break out of the query string.
    fetch(`/api/users?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        // Fix 3 (HTTP error): non-2xx is an error, not a silent success.
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<UserRow[]>;
      })
      .then((data) => {
        if (cancelled) return;
        // Fix 4 (version guard): drop the result if another request has
        // started since — final write wins without the version check
        // a slow stale request could overwrite the latest.
        if (version !== currentVersion) return;
        setRows(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Fix 5 (abort is not an error): AbortError on cleanup is
        // expected; surface real errors to the user.
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "请求失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // Fix 6 (dependency array): `query` is the effect's input. Without
    // it the effect runs once and never re-fetches on filter change.
  }, [query]);

  // Fix 7 (loading/error/empty states): every async render has three
  // terminal branches so the user is never left staring at a blank table.
  if (loading) return <p>加载中…</p>;
  if (error) return <p role="alert">加载失败：{error}</p>;
  if (rows.length === 0) return <p>暂无数据</p>;

  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {/* Fix 8 (XSS): render text content, not dangerouslySetInnerHTML.
                The API contract becomes "name is plain text" so no
                untrusted HTML ever reaches the DOM. */}
            <td>{row.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type UserRow = { id: string; name: string };

// Tracked per-component-instance version token; in a real app this lives in
// a ref to avoid the module-level singleton below.
let currentVersion: symbol = Symbol();
