// Chainable fake Supabase client for the data-deletion tests. Seeded per table,
// records every select/delete call and can inject an error per table.

export type FakeRow = Record<string, unknown>;

export type FakeCall = {
  table: string;
  op: "select" | "delete";
  column: string;
  value: unknown;
};

type Filter = { kind: "eq" | "in"; column: string; value: unknown };

export type FakeSupabase = {
  client: { from: (table: string) => unknown };
  calls: FakeCall[];
  tables: Record<string, FakeRow[]>;
  failTables: Set<string>;
};

export function createFakeSupabase(seed: Record<string, FakeRow[]> = {}): FakeSupabase {
  const tables: Record<string, FakeRow[]> = {};
  for (const [name, rows] of Object.entries(seed)) tables[name] = rows.map((row) => ({ ...row }));
  const calls: FakeCall[] = [];
  const failTables = new Set<string>();

  function matches(row: FakeRow, filter: Filter): boolean {
    if (filter.kind === "eq") return row[filter.column] === filter.value;
    return (filter.value as unknown[]).includes(row[filter.column]);
  }

  function builder(table: string, op: "select" | "delete", countMode: boolean) {
    const filters: Filter[] = [];
    const run = () => {
      const rows = tables[table] ?? [];
      const hit = rows.filter((row) => filters.every((filter) => matches(row, filter)));
      if (failTables.has(table)) {
        return { data: null, count: null, error: { code: "XX000", message: "boom for person@example.org" } };
      }
      if (op === "delete") {
        tables[table] = rows.filter((row) => !hit.includes(row));
        return { data: null, count: countMode ? hit.length : null, error: null };
      }
      return { data: hit.map((row) => ({ ...row })), count: null, error: null };
    };
    const chain = {
      eq(column: string, value: unknown) {
        calls.push({ table, op, column, value });
        filters.push({ kind: "eq", column, value });
        return chain;
      },
      in(column: string, value: unknown[]) {
        calls.push({ table, op, column, value });
        filters.push({ kind: "in", column, value });
        return chain;
      },
      then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
        return Promise.resolve(run()).then(resolve, reject);
      },
    };
    return chain;
  }

  const client = {
    from(table: string) {
      return {
        select: () => builder(table, "select", false),
        delete: (options?: { count?: string }) => builder(table, "delete", options?.count === "exact"),
      };
    },
  };

  return { client, calls, tables, failTables };
}
