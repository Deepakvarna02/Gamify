# Badges API

This document describes the backend Badge APIs added in `feature/badges-phase-1`.

Base path: `/api/rewards`

Endpoints

- GET /badges
  - Description: Return a list of available badges.
  - Response: 200 JSON array of badge objects (may be empty when DB disconnected).

- GET /badges/:id
  - Description: Return badge details by id.
  - Response: 200 badge object or 404 if not found.

- POST /badges
  - Description: Create a new badge (admin only).
  - Body: { name, slug, description?, iconUrl?, type?, criteria? }
  - Response: 201 created badge.

- POST /badges/:id/award
  - Description: Award a badge to a user (admin only).
  - Body: { userId }
  - Response: 200 { message: 'Badge awarded', badge, userId }

- GET /events
  - Description: Bot-protected endpoint. Returns and clears queued events produced by the server (e.g. `badge_awarded`). Requires header `X-Bot-Api-Key: <BOT_API_KEY>`.
  - Response: { events: [ ... ] }

Notes
- The server returns an empty array for `GET /badges` when the database is unavailable (degraded mode) so frontends can operate in read-only mode.
- Events are stored in Redis when `REDIS_URL` is configured; otherwise an in-memory queue is used (single-process only).

Quick curl examples

List badges:

```bash
curl -sS http://localhost:5173/api/rewards/badges | jq
```

Create badge (admin):

```bash
curl -X POST http://localhost:5173/api/rewards/badges \
  -H "Content-Type: application/json" \
  -d '{"name":"Helper","slug":"helper","description":"Answered 10 questions"}'
```

Award badge (admin):

```bash
curl -X POST http://localhost:5173/api/rewards/badges/<BADGE_ID>/award \
  -H "Content-Type: application/json" \
  -d '{"userId":"<USER_ID>"}'
```

Bot poll example (requires BOT_API_KEY):

```bash
curl -H "X-Bot-Api-Key: $BOT_API_KEY" http://localhost:5173/api/rewards/events
```

Minimal frontend example (React hook)

```js
// useBadges.js
import { useEffect, useState } from 'react';

export default function useBadges() {
  const [badges, setBadges] = useState([]);
  useEffect(() => {
    fetch('/api/rewards/badges')
      .then(r => r.json())
      .then(setBadges)
      .catch(() => setBadges([]));
  }, []);
  return badges;
}
```
