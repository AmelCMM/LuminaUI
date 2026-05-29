import { captureStateError, captureEffectError } from "./errors.js";

export function createState(initialValue, forceUpdate = null) {
  let value =
    typeof initialValue === "function" ? initialValue() : initialValue;
  const subs = new Set();

  if (typeof forceUpdate === "function") subs.add(forceUpdate);

  const get = () => value;

  const set = (next) => {
    let nextValue;
    try {
      nextValue = typeof next === "function" ? next(value) : next;
    } catch (e) {
      captureStateError(e, { phase: "compute" });
      return;
    }
    if (nextValue !== value) {
      value = nextValue;
      subs.forEach((fn) => {
        try {
          fn(value);
        } catch (e) {
          captureStateError(e, { phase: "notify" });
        }
      });
    }
  };

  const subscribe = (fn) => {
    subs.add(fn);
    return () => subs.delete(fn);
  };

  return [get, set, subscribe];
}

export const useState = createState;

export function useEffect(effect, deps = undefined) {
  let cleanup = null;
  let prevDeps = undefined;

  const run = () => {
    if (cleanup) {
      try {
        cleanup();
      } catch (e) {
        captureEffectError(e, { phase: "cleanup" });
      }
    }
    try {
      const ret = effect();
      cleanup = typeof ret === "function" ? ret : null;
    } catch (e) {
      captureEffectError(e, { phase: "effect" });
      cleanup = null;
    }
  };

  const checkAndRun = (currentDeps = deps) => {
    const changed =
      !prevDeps ||
      !currentDeps ||
      currentDeps.some((d, i) => d !== prevDeps[i]);
    if (changed) {
      run();
      prevDeps = currentDeps ? [...currentDeps] : null;
    }
  };

  return checkAndRun;
}

export function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = new Set();

  const getState = () => state;

  const dispatch = (action) => {
    let nextState;
    try {
      nextState =
        typeof action === "function" ? action(state) : reducer(state, action);
    } catch (e) {
      captureStateError(e, { phase: "dispatch" });
      return;
    }
    if (nextState !== state) {
      state = nextState;
      listeners.forEach((fn) => {
        try {
          fn(state);
        } catch (e) {
          captureStateError(e, { phase: "notify" });
        }
      });
    }
  };

  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  return { getState, dispatch, subscribe };
}
