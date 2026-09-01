export function isInternalStatsAuthorized(
  authorization: string | null,
  username: string | undefined,
  password: string | undefined,
): boolean {
  if (!authorization || !username || !password) return false;
  const expected = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  return authorization === expected;
}
