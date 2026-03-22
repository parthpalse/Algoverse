/**
 * Parse comma-separated elements; trim; drop empty.
 */
export function parseElements(raw) {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function union(a, b) {
  return Array.from(new Set([...a, ...b]));
}

export function intersection(a, b) {
  const sb = new Set(b);
  return a.filter((x) => sb.has(x));
}

export function difference(a, b) {
  const sb = new Set(b);
  return a.filter((x) => !sb.has(x));
}

export function symmetricDifference(a, b) {
  return union(difference(a, b), difference(b, a));
}

/**
 * Three-set operations (arrays of string elements).
 */
export function union3(a, b, c) {
  return Array.from(new Set([...a, ...b, ...c]));
}

export function intersection3(a, b, c) {
  const sb = new Set(b);
  const sc = new Set(c);
  return a.filter((x) => sb.has(x) && sc.has(x));
}

export function onlyA(a, b, c) {
  const sb = new Set(b);
  const sc = new Set(c);
  return a.filter((x) => !sb.has(x) && !sc.has(x));
}

export function onlyB(a, b, c) {
  return onlyA(b, a, c);
}

export function onlyC(a, b, c) {
  return onlyA(c, a, b);
}
