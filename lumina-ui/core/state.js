/**
 * Lightweight state utilities that work with renderer's forceUpdate pattern.
 *
 * API:
 *   createState(initial, forceUpdate) -> [get, set]
 *   useState(initial) -> same shape but subscriptions supported
 *   useEffect(effect, deps, subscribeFn) -> returns a runner to be called by renderer or subscribers
 *   createStore(reducer, initial)
 */

export function createState(initialValue, forceUpdate = null) {
  let value =
    typeof initialValue === "function" ? initialValue() : initialValue;
  const subs = new Set();

  if (typeof forceUpdate === "function") subs.add(forceUpdate);

  const get = () => value;

  const set = (next) => {
    const nextValue = typeof next === "function" ? next(value) : next;
    if (nextValue !== value) {
      value = nextValue;
      subs.forEach((fn) => {
        try {
          fn(value);
        } catch (e) {
          /* swallow */
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

// convenience alias (like React) - returns [get, set, subscribe]
export const useState = createState;

export function useEffect(effect, deps = undefined) {
  let cleanup = null;
  let prevDeps = undefined;

  const run = () => {
    if (cleanup) {
      try {
        cleanup();
      } catch (e) {}
    }
    const ret = effect();
    cleanup = typeof ret === "function" ? ret : null;
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

  // return a function that can be called by renderer or subscribers
  return checkAndRun;
}

export function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = new Set();

  const getState = () => state;

  const dispatch = (action) => {
    const nextState =
      typeof action === "function" ? action(state) : reducer(state, action);
    if (nextState !== state) {
      state = nextState;
      listeners.forEach((fn) => {
        try {
          fn(state);
        } catch (e) {}
      });
    }
  };

  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  return { getState, dispatch, subscribe };
}
