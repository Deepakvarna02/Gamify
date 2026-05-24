
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

let redis = null;
if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL);
  } catch (e) {
    console.error("Failed to initialize Redis for eventQueue", e);
    redis = null;
  }
}

const IN_MEMORY = [];
const KEY = "gamify:events";

export async function pushEvent(evt) {
  const payload = JSON.stringify({ ...evt, _id: Date.now().toString(), createdAt: new Date() });
  if (redis) {
    await redis.rpush(KEY, payload);
    return;
  }
  IN_MEMORY.push(JSON.parse(payload));
}

export async function drainEvents() {
  if (redis) {
    const items = await redis.lrange(KEY, 0, -1);
    if (!items?.length) return [];
    await redis.del(KEY);
    return items.map((s) => JSON.parse(s));
  }

  const copy = IN_MEMORY.splice(0, IN_MEMORY.length);
  return copy;
}

export async function peekEvents() {
  if (redis) {
    const items = await redis.lrange(KEY, 0, -1);
    return items.map((s) => JSON.parse(s));
  }
  return IN_MEMORY.slice();
}
