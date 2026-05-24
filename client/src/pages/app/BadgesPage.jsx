import { useEffect, useState } from "react";
import { api } from "../../api/client";

export const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/rewards/badges")
      .then((res) => {
        if (mounted) setBadges(res.data || []);
      })
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Badges</h2>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.length ? (
            badges.map((b) => (
              <div key={b._id} className="p-4 rounded-lg border bg-white">
                <div className="font-semibold">{b.name}</div>
                <div className="text-sm text-gray-600">{b.description}</div>
              </div>
            ))
          ) : (
            <div>No badges yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BadgesPage;
