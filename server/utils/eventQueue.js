const events = [];

export function pushEvent(evt) {
  events.push({ ...evt, _id: Date.now().toString(), createdAt: new Date() });
}

export function drainEvents() {
  const copy = events.splice(0, events.length);
  return copy;
}

export function peekEvents() {
  return events.slice();
}
