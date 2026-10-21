// PostgREST kappt jede Antwort bei 1000 Zeilen, deshalb seitenweise laden.
const PAGE_SIZE = 1000;

export async function fetchAllRows<T, E>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: E | null }>,
): Promise<{ data: T[] | null; error: E | null }> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return { data: rows, error: null };
  }
}
