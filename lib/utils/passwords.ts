// lib/utils/passwords.ts
import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Pick an index from a hex hash segment.
 */
function idxFromHex(hex: string, start = 0, mod = 1) {
  const seg = hex.slice(start, start + 8); // up to 8 hex chars -> safe integer
  const num = parseInt(seg, 16) || 0;
  return num % mod;
}

const SPECIALS = "!@#$%^&*()-_=+[]{}<>?/|~"; // pool of special characters
const DIGITS = "0123456789";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Ensure password contains at least one char from each required set.
 */
function ensureComplexity(
  base: string,
  specialsToInsert: string[],
  length: number
) {
  let pwd = base;

  // Guarantee presence of each category
  if (!/[a-z]/.test(pwd))
    pwd =
      LOWER[
        idxFromHex(
          crypto.createHash("sha256").update(pwd).digest("hex"),
          0,
          LOWER.length
        )
      ] + pwd;
  if (!/[A-Z]/.test(pwd))
    pwd =
      UPPER[
        idxFromHex(
          crypto.createHash("sha256").update(pwd).digest("hex"),
          2,
          UPPER.length
        )
      ] + pwd;
  if (!/[0-9]/.test(pwd))
    pwd =
      DIGITS[
        idxFromHex(
          crypto.createHash("sha256").update(pwd).digest("hex"),
          4,
          DIGITS.length
        )
      ] + pwd;
  // Insert supplied unique special chars if not present
  for (const s of specialsToInsert) {
    if (!pwd.includes(s)) pwd = pwd + s;
  }

  // Trim or pad to desired length: if too long, slice; if too short, pad deterministically
  if (pwd.length > length) {
    return pwd.slice(0, length);
  }
  // pad using deterministic hash expansion
  const hash = crypto.createHash("sha256").update(pwd).digest("hex");
  let i = 0;
  while (pwd.length < length) {
    const charPool = LOWER + UPPER + DIGITS + SPECIALS;
    const idx = idxFromHex(hash, (i * 6) % hash.length, charPool.length);
    pwd += charPool[idx];
    i++;
  }
  return pwd;
}

/**
 * Deterministic password generated from email + registerNumber.
 * Repeatable: same inputs -> same password. Useful for seeding.
 */
export function generateDeterministicPassword(
  email: string,
  registerNumber: string,
  length = 14
): string {
  if (!email || !registerNumber) {
    throw new Error("email and registerNumber are required");
  }
  const seed = `${email.toLowerCase()}|${registerNumber}`;
  const hash = crypto.createHash("sha256").update(seed).digest("hex");

  // Choose two special chars uniquely derived from the hash
  const s1 = SPECIALS[idxFromHex(hash, 0, SPECIALS.length)];
  const s2 = SPECIALS[idxFromHex(hash, 8, SPECIALS.length)];
  const specials = Array.from(new Set([s1, s2])); // unique

  // Build base characters from hash deterministically
  const charPool = LOWER + UPPER + DIGITS;
  let base = "";
  for (let i = 0; base.length < Math.max(8, Math.floor(length * 0.6)); i++) {
    const idx = idxFromHex(hash, (i * 6) % hash.length, charPool.length);
    base += charPool[idx];
  }

  // Insert the specials at positions derived from hash
  const pos1 = idxFromHex(hash, 12, Math.max(1, base.length));
  const pos2 = idxFromHex(hash, 20, Math.max(1, base.length + 1)); // allow different pos after first insert
  base = base.slice(0, pos1) + specials[0] + base.slice(pos1);
  base = base.slice(0, pos2) + (specials[1] ?? specials[0]) + base.slice(pos2);

  const password = ensureComplexity(base, specials, length);
  return password;
}

/**
 * Random password: uses crypto.randomBytes + user info to ensure uniqueness
 * and injects two specials derived from email + registerNumber.
 */
export function generateRandomPassword(
  email: string,
  registerNumber: string,
  length = 14
): string {
  if (!email || !registerNumber) {
    throw new Error("email and registerNumber are required");
  }
  const rnd = crypto.randomBytes(16).toString("hex");
  const seed = `${email.toLowerCase()}|${registerNumber}|${rnd}`;
  const hash = crypto.createHash("sha256").update(seed).digest("hex");

  // unique specials based on user info only (so each user tends to have consistent specials)
  const s1 = SPECIALS[idxFromHex(hash, 0, SPECIALS.length)];
  const s2 = SPECIALS[idxFromHex(hash, 8, SPECIALS.length)];
  const specials = Array.from(new Set([s1, s2]));

  // build random base from hash
  const charPool = LOWER + UPPER + DIGITS;
  let base = "";
  for (let i = 0; base.length < Math.max(8, Math.floor(length * 0.6)); i++) {
    const idx = idxFromHex(hash, (i * 7) % hash.length, charPool.length);
    base += charPool[idx];
  }

  // insert specials at pseudo-random positions
  const pos1 = idxFromHex(hash, 12, Math.max(1, base.length));
  const pos2 = idxFromHex(hash, 20, Math.max(1, base.length + 1));
  base = base.slice(0, pos1) + specials[0] + base.slice(pos1);
  base = base.slice(0, pos2) + (specials[1] ?? specials[0]) + base.slice(pos2);

  const password = ensureComplexity(base, specials, length);
  return password;
}
