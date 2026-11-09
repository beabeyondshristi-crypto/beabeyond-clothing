// Alternates newest and oldest items (newest, oldest, 2nd newest, 2nd oldest, ...) so a short list
// mixes fresh drops with the established range instead of showing only the latest batch.
// Expects the input sorted newest first.
export function mixFreshAndEstablished<T>(items: T[]): T[] {
  const out: T[] = [];
  let i = 0;
  let j = items.length - 1;
  while (i <= j) {
    out.push(items[i++]);
    if (i <= j) out.push(items[j--]);
  }
  return out;
}
