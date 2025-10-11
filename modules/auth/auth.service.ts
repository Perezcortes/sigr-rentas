"use client";

import type { User, UserRole } from "@/types/auth";

const RAW = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const BASE = RAW.replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = 12_000;

// --- runtime helpers ---
const isBrowser = typeof window !== "undefined";

const getAccess = () => (isBrowser ? localStorage.getItem("access_token") : null);
const setAccess = (t?: string) => {
  if (!isBrowser) return;
  if (t) localStorage.setItem("access_token", t);
  else localStorage.removeItem("access_token");
};
const getRefresh = () => (isBrowser ? localStorage.getItem("refresh_token") : null);
const setRefresh = (t?: string) => {
  if (!isBrowser) return;
  if (t) localStorage.setItem("refresh_token", t);
  else localStorage.removeItem("refresh_token");
};

// siempre lee desde localStorage (solo cliente)
function readAccess(): string | null {
  return isBrowser ? localStorage.getItem("access_token") : null;
}

async function jsonOrText(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function extractMessage(body: any, fallback: string) {
  if (!body) return fallback;
  if (typeof body === "string") return body;
  return body.message ?? body.error ?? fallback;
}

type JwtClaims = { permissions?: string[]; role?: string; sub?: string; email?: string; exp?: number };

function b64UrlToUtf8(b64url: string): string {
  const base64 = b64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  try {
    // @ts-ignore
    if (typeof Buffer !== "undefined") {
      // @ts-ignore
      return Buffer.from(base64, "base64").toString("utf-8");
    }
  } catch {}
  // @ts-ignore
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    // @ts-ignore
    const bin = window.atob(base64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  }
  return "";
}

function decodeJwt<T = any>(token?: string | null): T | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = b64UrlToUtf8(parts[1]);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function isJwtExpired(token?: string | null): boolean {
  const claims = decodeJwt<JwtClaims>(token);
  if (!claims?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return now >= claims.exp - 5; // margen 5s
}

function normalizePermissions(input: any): string[] {
  if (!input) return [];
  let arr: string[] = [];
  if (Array.isArray(input)) {
    if (input.length > 0 && typeof input[0] === "object") {
      arr = input.map((p) => p?.name ?? p?.nombre).filter((x) => typeof x === "string");
    } else {
      arr = input.filter((p) => typeof p === "string");
    }
  }
  return Array.from(new Set(arr.map((s) => String(s).trim()))).filter(Boolean);
}

function extractRoleString(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.name ?? value.code ?? value.display_name ?? "";
  }
  return String(value ?? "");
}

function normalizeRole(value: any): UserRole {
  const v = extractRoleString(value).trim().toLowerCase();
  const map: Record<string, UserRole> = {
    administrador: "administrador",
    "administrador del sistema": "administrador",
    "administrador sistema": "administrador",
    "administrador_del_sistema": "administrador",
    admin: "administrador",
    gerente: "gerente",
    manager: "gerente",
    coordinador: "coordinador",
    coordinator: "coordinador",
    agente: "agente",
    agent: "agente",
    propietario: "propietario",
    owner: "propietario",
    inquilino: "inquilino",
    tenant: "inquilino",
  };
  return map[v] ?? "agente";
}

function pickNormalizedUser(me: any, loginBody: any, accessToken: string | null): User {
  const jwt = decodeJwt<JwtClaims>(accessToken);

  const pJWT = normalizePermissions(jwt?.permissions);
  const pMe = normalizePermissions(me?.permissions);
  const pMeRole = normalizePermissions(me?.role?.permissions);
  const pLogin = normalizePermissions(loginBody?.user?.permissions);
  const permissions = pJWT.length ? pJWT : pMe.length ? pMe : pMeRole.length ? pMeRole : pLogin;

  const role = normalizeRole(jwt?.role ?? me?.role ?? loginBody?.user?.role);

  const name =
    me?.full_name || [me?.first_name, me?.last_name].filter(Boolean).join(" ").trim() || me?.name || me?.email;

  const oficina = (typeof me?.office === "object" ? me?.office?.name : me?.office) ?? me?.oficina ?? null;

  return {
    ...me,
    name,
    role,
    permissions,
    oficina,
  } as unknown as User;
}

type HttpErrorData = { message?: string | string[]; error?: string; statusCode?: number } & Record<string, any>;

export class HttpError extends Error {
  status?: number;
  data?: HttpErrorData;
  response?: { status?: number; data?: HttpErrorData }; 

  constructor(status?: number, data?: HttpErrorData, message?: string) {
    const msg =
      message ??
      (Array.isArray(data?.message) ? data?.message?.[0] : data?.message) ??
      data?.error ??
      (status ? `Error ${status}` : "HTTP error");
    super(msg);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
    this.response = { status, data }; 
  }
}

let refreshingPromise: Promise<string | null> | null = null;
async function refreshAccessTokenOnce(): Promise<string | null> {
  if (refreshingPromise) return refreshingPromise;
  const rt = getRefresh();
  if (!rt) return null;

  refreshingPromise = (async () => {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }), 
    });
    const body = await jsonOrText(res);
    if (!res.ok) throw new HttpError(res.status, body as any);

    const newAccess =
      body?.access_token ?? body?.accessToken ?? body?.data?.access_token ?? body?.result?.access_token;

    const newRefresh =
      body?.refresh_token ?? body?.refreshToken ?? body?.data?.refresh_token ?? body?.result?.refresh_token;

    if (typeof newAccess === "string" && newAccess.length > 0) setAccess(newAccess);
    if (typeof newRefresh === "string" && newRefresh.length > 0) setRefresh(newRefresh);

    return typeof newAccess === "string" && newAccess.length > 0 ? newAccess : null;
  })();

  try {
    return await refreshingPromise;
  } finally {
    refreshingPromise = null;
  }
}

async function req<T = any>(
  path: string,
  init: RequestInit = {},
  {
    expectJson = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryOn401 = true,
  }: { expectJson?: boolean; timeoutMs?: number; retryOn401?: boolean } = {}
): Promise<T> {
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  if (!headers.has("Authorization") && isBrowser) {
    const t = readAccess();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }

  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      credentials: "omit", 
      headers,
      signal: ac.signal,
    });

    if (res.status === 401 && retryOn401 && isBrowser) {
      const newToken = await refreshAccessTokenOnce();
      if (newToken) {
        const retryHeaders = new Headers(init.headers || {});
        if (!retryHeaders.has("Content-Type") && init.body) retryHeaders.set("Content-Type", "application/json");
        retryHeaders.set("Authorization", `Bearer ${newToken}`);

        const retryRes = await fetch(url, {
          ...init,
          credentials: "omit",
          headers: retryHeaders,
          signal: ac.signal,
        });
        if (!retryRes.ok) {
          const body = await jsonOrText(retryRes);
          throw new HttpError(retryRes.status, body as any);
        }
        if (!expectJson) return undefined as unknown as T;
        const retryData = await jsonOrText(retryRes);
        return retryData as T;
      }
    }

    if (!res.ok) {
      const body = await jsonOrText(res);
      throw new HttpError(res.status, body as any);
    }

    if (!expectJson) return undefined as unknown as T;
    const data = await jsonOrText(res);
    return data as T;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new HttpError(408, { error: "timeout" }, "timeout");
    }
    throw err;
  } finally {
    clearTimeout(to);
  }
}

type LoginBody = { email: string; password: string };
type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User | any;
  expires_in?: number;
  token_type?: "Bearer";
} & Record<string, any>;

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const loginBody = await req<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password } satisfies LoginBody),
    },
    { retryOn401: false }
  );

  const access =
    loginBody?.access_token ?? loginBody?.accessToken ?? loginBody?.data?.access_token ?? loginBody?.result?.access_token;

  const refresh =
    loginBody?.refresh_token ??
    loginBody?.refreshToken ??
    loginBody?.data?.refresh_token ??
    loginBody?.result?.refresh_token;

  if (typeof access !== "string" || !access) {
    console.error("Login sin access token. Claves recibidas:", Object.keys(loginBody || {}));
    throw new HttpError(500, loginBody as any, "El backend no devolvió access_token");
  }

  setAccess(access);
  if (typeof refresh === "string" && refresh) setRefresh(refresh);

  if (!isBrowser) return null; 

  const meRaw = await req<any>("/auth/profile", {}, { retryOn401: false });
  const user = pickNormalizedUser(meRaw, loginBody, access);
  return user ?? null;
}

export async function fetchProfile(): Promise<User | null> {
  if (!isBrowser) return null;

  let token = readAccess();

  if (!token || isJwtExpired(token)) {
    const refreshed = await refreshAccessTokenOnce();
    if (!refreshed) return null;
    token = refreshed;
  }

  try {
    const meRaw = await req<any>("/auth/profile", {}, { retryOn401: false });
    const user = pickNormalizedUser(meRaw, null, token);
    return user ?? null;
  } catch {
    return null;
  }
}

export async function logoutServer(): Promise<void> {
  try {
    await req("/auth/logout", { method: "POST" }, { expectJson: false, retryOn401: false });
  } catch {
  } finally {
    setAccess(undefined);
    setRefresh(undefined);
  }
}

export function hasPermission(user: User | null, permission?: string): boolean {
  if (!user) return false;

  const raw = (user as any)?.permissions ?? [];
  const list: string[] = Array.isArray(raw)
    ? raw.map((p: any) => (typeof p === "string" ? p : p?.name ?? p?.nombre)).filter(Boolean)
    : [];

  const role = String((user as any)?.role ?? "").toLowerCase();

  if (role === "administrador") return true;
  if (list.includes("all") || list.includes("sistema.administrar")) return true;
  if (!permission) return true;

  if (permission.includes(".")) {
    const [resource] = permission.split(".");
    if (list.includes(`${resource}.*`)) return true;
  }
  return list.includes(permission);
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    administrador: "Administrador",
    gerente: "Gerente",
    coordinador: "Coordinador",
    agente: "Agente",
    propietario: "Propietario",
    inquilino: "Inquilino",
  };
  return roleNames[role];
}

export async function api<T = any>(
  path: string,
  init: RequestInit = {},
  opts?: { expectJson?: boolean; timeoutMs?: number; retryOn401?: boolean }
): Promise<T> {
  return req<T>(path, init, opts);
}
