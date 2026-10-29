/**
 * Circuit Breaker
 * ===============
 * Trips a provider when error rate exceeds threshold over a rolling window.
 * After trip → HALF_OPEN probe → CLOSED or re-trip.
 *
 * State machine:
 *   CLOSED    — all requests pass
 *   OPEN      — all requests fail-fast with CircuitOpenError
 *   HALF_OPEN — 1 probe request; success → CLOSED, fail → OPEN
 */

interface CircuitState {
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastFailureAt?: number;
  openedAt?: number;
}

const STATES = new Map<string, CircuitState>();

const CONFIG = {
  failureThreshold: 5, // consecutive failures → OPEN
  errorRateThreshold: 0.05, // 5% over rolling window
  rollingWindowMs: 60_000,
  openTimeoutMs: 30_000, // 30s in OPEN before HALF_OPEN
  halfOpenMaxAttempts: 1,
};

const recentCalls = new Map<string, { ts: number; ok: boolean }[]>();

export function isCircuitOpen(provider: string): boolean {
  const state = STATES.get(provider);
  if (!state) return false;

  if (state.state === "OPEN") {
    // Move to HALF_OPEN after the open timeout
    if (state.openedAt && Date.now() - state.openedAt > CONFIG.openTimeoutMs) {
      state.state = "HALF_OPEN";
      return false;
    }
    return true;
  }

  return false;
}

export function recordSuccess(provider: string): void {
  let state = STATES.get(provider);
  if (!state) {
    state = { state: "CLOSED", consecutiveFailures: 0, consecutiveSuccesses: 0 };
    STATES.set(provider, state);
  }
  state.consecutiveFailures = 0;
  state.consecutiveSuccesses += 1;
  if (state.state === "HALF_OPEN") {
    state.state = "CLOSED";
  }
  pushCall(provider, true);
}

export function recordFailure(provider: string): void {
  let state = STATES.get(provider);
  if (!state) {
    state = { state: "CLOSED", consecutiveFailures: 0, consecutiveSuccesses: 0 };
    STATES.set(provider, state);
  }
  state.consecutiveFailures += 1;
  state.consecutiveSuccesses = 0;
  state.lastFailureAt = Date.now();
  pushCall(provider, false);

  // Trip if either threshold is hit
  const recent = recentCalls.get(provider) ?? [];
  const window = recent.filter((c) => Date.now() - c.ts < CONFIG.rollingWindowMs);
  const errorRate = window.length ? window.filter((c) => !c.ok).length / window.length : 0;

  if (
    state.consecutiveFailures >= CONFIG.failureThreshold ||
    (window.length >= 10 && errorRate >= CONFIG.errorRateThreshold)
  ) {
    state.state = "OPEN";
    state.openedAt = Date.now();
  }
}

export function getCircuitState(provider: string): CircuitState {
  return STATES.get(provider) ?? {
    state: "CLOSED",
    consecutiveFailures: 0,
    consecutiveSuccesses: 0,
  };
}

export function resetCircuit(provider: string): void {
  STATES.delete(provider);
  recentCalls.delete(provider);
}

function pushCall(provider: string, ok: boolean): void {
  let arr = recentCalls.get(provider);
  if (!arr) {
    arr = [];
    recentCalls.set(provider, arr);
  }
  arr.push({ ts: Date.now(), ok });
  // Trim to last 100
  if (arr.length > 100) arr.shift();
}

export class CircuitOpenError extends Error {
  constructor(public readonly provider: string) {
    super(`Circuit breaker OPEN for provider "${provider}". Fallback will be used.`);
    this.name = "CircuitOpenError";
  }
}
