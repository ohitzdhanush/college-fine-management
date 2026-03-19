// lib/utils/generateStaticPassword.ts

/**
 * Generate a static, deterministic password based on name and department.
 * Example:
 *  name = "Parthiban", department = "Maths"
 *  => "Parthi@Maths#84"
 */

export function generateStaticPassword(
  name: string,
  department: string
): string {
  if (!name || !department) {
    throw new Error("Name and Department are required to generate password");
  }

  // Capitalize first letter of name and department
  const cap = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const namePart = cap(name.trim()).slice(0, 6); // first 6 chars of name
  const deptPart = cap(department.trim());

  // create a small deterministic numeric hash (2 digits)
  const hash = (name + department)
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    .toString()
    .slice(-2); // last two digits

  // mix with unique special characters
  const specials = ["@", "#", "$", "*", "&"];
  const specialChar = specials[hash.charCodeAt(0) % specials.length];

  // combine all parts
  const password = `${namePart}${specialChar}${deptPart}#${hash}`;

  return password;
}
