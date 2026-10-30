import { useState, useEffect, useCallback } from "react";
import { tournamentService } from "../services/tournamentService";
import { TournamentContext } from "./TournamentContext";
import { useAuth } from "./AuthContext";

// Read local storage tournaments helper (module scope — no component state)
const getLocalTournaments = () => {
  try {
    const stored = localStorage.getItem("nexus_tournaments");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function TournamentProvider({ children }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Fetch API + LocalStorage tournaments combined
  const fetchMyTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const localData = getLocalTournaments();

    try {
      const response = await tournamentService.getMy();
      const apiList = response?.tournaments || response?.data || (Array.isArray(response) ? response : []);

      // Combine API and local items avoiding duplicates by ID
      const combinedMap = new Map();
      [...localData, ...apiList].forEach(item => {
        const key = item.id || item._id;
        if (key && !combinedMap.has(key)) {
          combinedMap.set(key, item);
        }
      });

      setTournaments(Array.from(combinedMap.values()));
    } catch (err) {
      console.warn("Context fetch error, falling back to local storage:", err);
      if (localData.length > 0) {
        setTournaments(localData);
      } else {
        setError(err?.response?.data?.message || "Failed to load tournaments");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Instant add tournament helper (Updates React State + Local Storage synchronously)
  const addTournament = (newItem) => {
    setTournaments((prev) => {
      const filteredPrev = prev.filter(t => (t.id || t._id) !== (newItem.id || newItem._id));
      const updated = [newItem, ...filteredPrev];
      localStorage.setItem("nexus_tournaments", JSON.stringify(updated));
      return updated;
    });
  };

  /*
   * GET /tournaments/me is organizer-only on the backend, so fetching it at
   * app root produced a guaranteed 401 for anonymous visitors and a 403 for
   * every participant/sponsor/superadmin session — on every page load, for a
   * context only the organizer pages consume. Wait for the auth probe, then
   * call it only for organizers; everyone else gets the local copy silently.
   */
  useEffect(() => {
    if (authLoading) return;

    // Defer every state update one tick: setState synchronously in an
    // effect body trips react-hooks/set-state-in-effect (cascading
    // renders). This effect only reacts to the auth probe resolving.
    const timer = setTimeout(() => {
      if (isAuthenticated && user?.role === "organizer") {
        fetchMyTournaments();
      } else {
        setTournaments(getLocalTournaments());
        setError(null);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchMyTournaments, authLoading, isAuthenticated, user?.role]);

  const value = {
    tournaments,
    loading,
    error,
    addTournament,
    fetchMyTournaments,
    setTournaments
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}
