import { timingSafeEqual } from "node:crypto";

export function isAuthorized(header: string | undefined, token: string) {
  const supplied = Buffer.from(header ?? "");
  const expected = Buffer.from(`Bearer ${token}`);
  return (
    token.length >= 24 &&
    supplied.length === expected.length &&
    timingSafeEqual(supplied, expected)
  );
}
