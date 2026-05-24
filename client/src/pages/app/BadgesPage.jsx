import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../Context/AuthContext.jsx";

export const BadgesPage = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awardState, setAwardState] = useState({});

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

  const isElevated = ["Moderator", "Admin", "Organisation"].includes(
    user?.role,
  );

  const handleAward = async (badgeId, userId) => {
    setAwardState((s) => ({ ...s, [badgeId]: { loading: true } }));
    try {
      const res = await api.post(`/api/rewards/badges/${badgeId}/award`, {
        userId,
      });
      setAwardState((s) => ({ ...s, [badgeId]: { success: res.data?.message } }));
    } catch (err) {
      setAwardState((s) => ({ ...s, [badgeId]: { error: err?.response?.data?.message || 'Failed' } }));
    } finally {
      setTimeout(() => {
        setAwardState((s) => ({ ...s, [badgeId]: undefined }));
      }, 3000);
    }
  };

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
                <div className="text-sm text-gray-600 mb-3">{b.description}</div>

                {isElevated && (
                  <div className="award-row" style={{ marginTop: 8 }}>
                    <AwardForm
                      badgeId={b._id}
                      onAward={(userId) => handleAward(b._id, userId)}
                      state={awardState[b._id]}
                    />
                  </div>
                )}
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

const AwardForm = ({ badgeId, onAward, state }) => {
  const [userId, setUserId] = useState("");

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Target userId"
        className="input"
        style={{ flex: 1 }}
      />
      <button
        className="btn btn-primary"
        onClick={() => onAward(userId)}
        disabled={!userId || state?.loading}
      >
        {state?.loading ? "…" : "Award"}
      </button>
      {state?.success && <div style={{ color: "green" }}>{state.success}</div>}
      {state?.error && <div style={{ color: "red" }}>{state.error}</div>}
    </div>
  );
};

export default BadgesPage;
