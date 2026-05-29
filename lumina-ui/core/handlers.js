import { captureRenderError } from "./errors.js";

const wrappedHandlers = new WeakMap();

export function wrapHandler(dom, eventType, handler) {
  const wrapped = function (e) {
    try { handler(e); } catch (error) {
      captureRenderError(error, { phase: "event", source: "event" });
    }
  };
  let events = wrappedHandlers.get(dom);
  if (!events) {
    events = {};
    wrappedHandlers.set(dom, events);
  }
  events[eventType] = wrapped;
  return wrapped;
}

export function getWrappedHandler(dom, eventType) {
  const events = wrappedHandlers.get(dom);
  return events ? events[eventType] : null;
}

export function clearWrappedHandler(dom, eventType) {
  const events = wrappedHandlers.get(dom);
  if (events) delete events[eventType];
}

export function addWrappedListener(dom, eventType, handler) {
  const existing = getWrappedHandler(dom, eventType);
  if (existing) dom.removeEventListener(eventType, existing);
  const wrapped = wrapHandler(dom, eventType, handler);
  dom.addEventListener(eventType, wrapped);
  return wrapped;
}

export function removeWrappedListener(dom, eventType) {
  const wrapped = getWrappedHandler(dom, eventType);
  if (wrapped) dom.removeEventListener(eventType, wrapped);
  clearWrappedHandler(dom, eventType);
}
