// In-memory stand-in for the Supabase client, enabled with NEXT_PUBLIC_USE_MOCK_DATA=true.
// Supports the subset of the query builder, auth and storage APIs this app uses.
// Data lives in process memory: changes survive hot reloads but reset when the dev server restarts.

import { createSeed, mockUserId, MOCK_ADMIN } from './mock-data';
import { evaluateCoupon, normalizeCode, type Coupon } from '../coupons';

type Row = Record<string, any>;
type Result = { data: any; error: { message: string; code?: string } | null; count?: number | null };

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
export const MOCK_AUTH_COOKIE = 'mock-auth-user';

export interface MockCookieAdapter {
  get(name: string): string | undefined;
  set(name: string, value: string): void;
  remove(name: string): void;
}

const store = globalThis as unknown as { __mockDb?: Record<string, Row[]>; __mockFiles?: Record<string, string> };
function db(): Record<string, Row[]> {
  return (store.__mockDb ??= createSeed());
}
function table(name: string): Row[] {
  return (db()[name] ??= []);
}

const uuid = () => globalThis.crypto.randomUUID();
const now = () => new Date().toISOString();

// ─── Filters ────────────────────────────────────────────

function likeToRegex(pattern: string, flags: string) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
  return new RegExp(`^${escaped}$`, flags);
}

function compare(op: string, actual: any, expected: any): boolean {
  switch (op) {
    case 'eq': return actual == expected;
    case 'neq': return actual != expected;
    case 'gt': return actual > expected;
    case 'gte': return actual >= expected;
    case 'lt': return actual < expected;
    case 'lte': return actual <= expected;
    case 'like': return likeToRegex(String(expected), '').test(String(actual ?? ''));
    case 'ilike': return likeToRegex(String(expected), 'i').test(String(actual ?? ''));
    case 'is': return expected === null ? actual == null : actual === expected;
    case 'in': return (expected as any[]).includes(actual);
    default: return true;
  }
}

// Parses PostgREST "or" syntax, e.g. "name.ilike.%foo%,category.ilike.%foo%"
function parseOr(expr: string): ((row: Row) => boolean) {
  const clauses = expr.split(',').map((part) => {
    const [col, op, ...rest] = part.split('.');
    const value = rest.join('.');
    return (row: Row) => compare(op, row[col], value);
  });
  return (row) => clauses.some((c) => c(row));
}

// ─── Select / embedded relations ────────────────────────

function splitTopLevel(cols: string): string[] {
  const parts: string[] = [];
  let depth = 0, current = '';
  for (const ch of cols) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; } else current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const singular = (name: string) => name.replace(/s$/, '');

function project(row: Row, tableName: string, cols: string): Row {
  const out: Row = {};
  for (const part of splitTopLevel(cols)) {
    const rel = part.match(/^(\w+)\((.*)\)$/);
    if (part === '*') Object.assign(out, row);
    else if (rel) {
      const [, relTable, relCols] = rel;
      const fk = `${singular(relTable)}_id`;
      if (fk in row) {
        // many-to-one, e.g. collection_products -> products(*)
        const target = table(relTable).find((r) => r.id === row[fk]);
        out[relTable] = target ? project(target, relTable, relCols) : null;
      } else {
        // one-to-many, e.g. orders -> order_items(*)
        const backRef = `${singular(tableName)}_id`;
        out[relTable] = table(relTable).filter((r) => r[backRef] === row.id).map((r) => project(r, relTable, relCols));
      }
    } else if (part in row) out[part] = row[part];
  }
  return structuredClone(out);
}

// ─── Query builder ──────────────────────────────────────

class MockQuery implements PromiseLike<Result> {
  private filters: ((row: Row) => boolean)[] = [];
  private orders: { col: string; ascending: boolean }[] = [];
  private limitN?: number;
  private rangeFrom?: number;
  private columns = '*';
  private returning = false;
  private countMode = false;
  private head = false;
  private singleMode: 'single' | 'maybe' | null = null;
  private shouldThrow = false;
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: any;
  private upsertKey = 'id';

  constructor(private tableName: string) {}

  select(cols = '*', opts?: { count?: string; head?: boolean }) {
    this.columns = cols;
    if (this.op !== 'select') this.returning = true;
    if (opts?.count) this.countMode = true;
    if (opts?.head) this.head = true;
    return this;
  }
  insert(values: Row | Row[]) { this.op = 'insert'; this.payload = values; return this; }
  update(values: Row) {
    this.op = 'update';
    // Like supabase-js (JSON serialisation), undefined fields are left untouched
    this.payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined));
    return this;
  }
  upsert(values: Row | Row[], opts?: { onConflict?: string }) {
    this.op = 'upsert'; this.payload = values;
    const sample = Array.isArray(values) ? values[0] : values;
    this.upsertKey = opts?.onConflict ?? (sample && !('id' in sample) && 'email' in sample ? 'email' : 'id');
    return this;
  }
  delete() { this.op = 'delete'; return this; }

  private where(op: string, col: string, value: any) {
    // Ignore values we can't evaluate (e.g. column references built from rpc calls)
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) return this;
    this.filters.push((row) => compare(op, row[col], value));
    return this;
  }
  eq(col: string, v: any) { return this.where('eq', col, v); }
  neq(col: string, v: any) { return this.where('neq', col, v); }
  gt(col: string, v: any) { return this.where('gt', col, v); }
  gte(col: string, v: any) { return this.where('gte', col, v); }
  lt(col: string, v: any) { return this.where('lt', col, v); }
  lte(col: string, v: any) { return this.where('lte', col, v); }
  like(col: string, v: string) { return this.where('like', col, v); }
  ilike(col: string, v: string) { return this.where('ilike', col, v); }
  is(col: string, v: any) { return this.where('is', col, v); }
  in(col: string, v: any[]) { return this.where('in', col, v); }
  not(col: string, op: string, v: any) {
    this.filters.push((row) => !compare(op, row[col], v));
    return this;
  }
  match(obj: Row) { for (const [k, v] of Object.entries(obj)) this.eq(k, v); return this; }
  or(expr: string) { this.filters.push(parseOr(expr)); return this; }
  filter(col: string, op: string, v: any) { return this.where(op, col, v); }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orders.push({ col, ascending: opts?.ascending ?? true });
    return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  range(from: number, to: number) { this.rangeFrom = from; this.limitN = to - from + 1; return this; }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybe'; return this; }
  throwOnError() { this.shouldThrow = true; return this; }

  private matches(row: Row) { return this.filters.every((f) => f(row)); }

  private run(): Result {
    const rows = table(this.tableName);
    let affected: Row[];

    switch (this.op) {
      case 'insert': {
        const values = Array.isArray(this.payload) ? this.payload : [this.payload];
        affected = values.map((v: Row) => ({ id: uuid(), created_at: now(), updated_at: now(), ...v }));
        rows.push(...affected);
        break;
      }
      case 'upsert': {
        const values = Array.isArray(this.payload) ? this.payload : [this.payload];
        affected = values.map((v: Row) => {
          const existing = rows.find((r) => r[this.upsertKey] === v[this.upsertKey]);
          if (existing) return Object.assign(existing, v, { updated_at: now() });
          const created = { id: uuid(), created_at: now(), updated_at: now(), ...v };
          rows.push(created);
          return created;
        });
        break;
      }
      case 'update':
        affected = rows.filter((r) => this.matches(r));
        affected.forEach((r) => Object.assign(r, this.payload, { updated_at: now() }));
        break;
      case 'delete':
        affected = rows.filter((r) => this.matches(r));
        db()[this.tableName] = rows.filter((r) => !affected.includes(r));
        break;
      default:
        affected = rows.filter((r) => this.matches(r));
    }

    if (this.op !== 'select' && !this.returning) return { data: null, error: null };

    let result = [...affected];
    for (const { col, ascending } of [...this.orders].reverse()) {
      result.sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (ascending ? 1 : -1));
    }
    const count = result.length;
    if (this.rangeFrom !== undefined) result = result.slice(this.rangeFrom);
    if (this.limitN !== undefined) result = result.slice(0, this.limitN);

    if (this.head) return { data: null, error: null, count };
    const data = result.map((r) => project(r, this.tableName, this.columns));
    const countField = this.countMode ? { count } : {};

    if (this.singleMode) {
      if (data.length === 1) return { data: data[0], error: null, ...countField };
      if (data.length === 0 && this.singleMode === 'maybe') return { data: null, error: null, ...countField };
      return {
        data: null,
        error: { message: data.length ? 'Multiple rows returned' : 'No rows found', code: 'PGRST116' },
      };
    }
    return { data, error: null, ...countField };
  }

  then<T1 = Result, T2 = never>(onfulfilled?: ((v: Result) => T1 | PromiseLike<T1>) | null, onrejected?: ((e: any) => T2 | PromiseLike<T2>) | null) {
    return new Promise<Result>((resolve, reject) => {
      const res = this.run();
      if (this.shouldThrow && res.error) reject(new Error(res.error.message));
      else resolve(res);
    }).then(onfulfilled, onrejected);
  }
}

// ─── RPC ────────────────────────────────────────────────

function rpc(fn: string, args: Row = {}, userId: string | null = null) {
  const exec = (): Result => {
    if (fn === 'update_product_stock') {
      const product = table('products').find((p) => p.id === args.p_product_id);
      if (!product) return { data: null, error: { message: 'Product not found' } };
      product.stock = Math.max(0, Number(product.stock) + Number(args.p_change));
      product.updated_at = now();
      table('inventory_log').push({ id: uuid(), product_id: product.id, change: args.p_change, reason: args.p_reason || '', created_at: now() });
      return { data: null, error: null };
    }
    if (fn === 'validate_coupon' || fn === 'redeem_coupon') {
      // Mirrors the SQL functions in migration 00013
      if (fn === 'redeem_coupon' && !userId) return { data: { valid: false, discount: 0, message: 'Sign in to use a code' }, error: null };
      const coupon = table('coupons').find((c) => c.code === normalizeCode(String(args.p_code || ''))) as Coupon | undefined;
      const usedBefore = !!userId && !!coupon && table('orders').some((o) => o.customer_id === userId && o.coupon_code === coupon.code && o.status !== 'cancelled');
      const result = evaluateCoupon(coupon, Number(args.p_subtotal || 0), { alreadyUsedByCustomer: usedBefore });
      if (fn === 'redeem_coupon' && result.valid && coupon) {
        (coupon as Row).used_count = Number(coupon.used_count || 0) + 1;
      }
      return { data: result, error: null };
    }
    if (fn === 'release_coupon') {
      const coupon = table('coupons').find((c) => c.code === normalizeCode(String(args.p_code || '')));
      if (coupon) coupon.used_count = Math.max(0, Number(coupon.used_count || 0) - 1);
      return { data: null, error: null };
    }
    if (fn === 'remove_product_like') {
      const events = table('product_events');
      const idx = events.map((e, i) => [e, i] as const).filter(([e]) => e.product_id === args.p_product_id && e.event_type === 'like').pop()?.[1];
      if (idx !== undefined) events.splice(idx, 1);
      return { data: null, error: null };
    }
    if (fn === 'product_event_stats' || fn === 'product_event_daily') {
      // Mirrors the SQL functions in migration 00011: counts per product/type, or per day/type
      const since = args.since ? new Date(args.since).getTime() : 0;
      const counts = new Map<string, Row>();
      for (const e of table('product_events')) {
        if (new Date(e.created_at).getTime() < since) continue;
        const key = fn === 'product_event_stats' ? `${e.product_id}|${e.event_type}` : `${e.created_at.slice(0, 10)}|${e.event_type}`;
        const row = counts.get(key) || (fn === 'product_event_stats'
          ? { product_id: e.product_id, event_type: e.event_type, count: 0 }
          : { day: e.created_at.slice(0, 10), event_type: e.event_type, count: 0 });
        row.count += 1;
        counts.set(key, row);
      }
      return { data: [...counts.values()], error: null };
    }
    return { data: null, error: { message: `Mock rpc "${fn}" not implemented` } };
  };
  const promise: any = Promise.resolve().then(exec);
  promise.throwOnError = () => promise;
  return promise as Promise<Result> & { throwOnError(): Promise<Result> };
}

// ─── Auth ───────────────────────────────────────────────

interface MockUser { id: string; email: string; user_metadata: { name?: string } }

function makeUser(email: string, name?: string): MockUser {
  const existing = store.__mockDb?.customers?.find((c) => c.email === email);
  return { id: mockUserId(email), email, user_metadata: { name: name ?? existing?.name ?? email.split('@')[0] } };
}

function createAuth(cookies: MockCookieAdapter) {
  const readUser = (): MockUser | null => {
    let raw = cookies.get(MOCK_AUTH_COOKIE);
    if (!raw) return null;
    try {
      // Server-set cookies come back encoded twice when read from document.cookie
      for (let i = 0; i < 3 && !raw.startsWith('{'); i++) raw = decodeURIComponent(raw);
      return JSON.parse(raw);
    } catch { return null; }
  };
  const writeUser = (user: MockUser) => cookies.set(MOCK_AUTH_COOKIE, encodeURIComponent(JSON.stringify(user)));
  const session = (user: MockUser) => ({ user, access_token: 'mock-token', token_type: 'bearer', expires_in: 3600 });

  return {
    async getUser() {
      const user = readUser();
      return user
        ? { data: { user }, error: null }
        : { data: { user: null }, error: { message: 'Auth session missing!', status: 401 } };
    },
    async getSession() {
      const user = readUser();
      return { data: { session: user ? session(user) : null }, error: null };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      if (!email || !password) return { data: { user: null, session: null }, error: { message: 'Email and password are required' } };
      // The admin account has a real password in mock mode; shoppers can use any password
      if (email.toLowerCase() === MOCK_ADMIN.email && (!MOCK_ADMIN.password || password !== MOCK_ADMIN.password)) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      }
      const user = makeUser(email);
      writeUser(user);
      return { data: { user, session: session(user) }, error: null };
    },
    async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { name?: string } } }) {
      if (!email || !password) return { data: { user: null, session: null }, error: { message: 'Email and password are required' } };
      const user = makeUser(email, options?.data?.name);
      writeUser(user);
      return { data: { user, session: session(user) }, error: null };
    },
    async signOut() {
      cookies.remove(MOCK_AUTH_COOKIE);
      return { error: null };
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } };
    },
  };
}

// ─── Storage ────────────────────────────────────────────

function createStorage() {
  const files = (store.__mockFiles ??= {});
  return {
    from(bucket: string) {
      return {
        async upload(path: string, body: ArrayBuffer | Uint8Array | Blob, opts?: { contentType?: string }) {
          const bytes = body instanceof Blob ? new Uint8Array(await body.arrayBuffer()) : new Uint8Array(body as ArrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          files[`${bucket}/${path}`] = `data:${opts?.contentType || 'application/octet-stream'};base64,${btoa(binary)}`;
          return { data: { path }, error: null };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: files[`${bucket}/${path}`] ?? `https://placehold.co/800x1000?text=${encodeURIComponent(path)}` } };
        },
        async remove(paths: string[]) {
          paths.forEach((p) => delete files[`${bucket}/${p}`]);
          return { data: paths, error: null };
        },
      };
    },
  };
}

export function createMockClient(cookies: MockCookieAdapter) {
  const auth = createAuth(cookies);
  const currentUserId = () => {
    try {
      let raw = cookies.get(MOCK_AUTH_COOKIE) || '';
      for (let i = 0; i < 3 && raw && !raw.startsWith('{'); i++) raw = decodeURIComponent(raw);
      return raw ? (JSON.parse(raw).id as string) : null;
    } catch { return null; }
  };
  return {
    from: (tableName: string) => new MockQuery(tableName),
    rpc: (fn: string, args: Row = {}) => rpc(fn, args, currentUserId()),
    auth,
    storage: createStorage(),
  };
}
