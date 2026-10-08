import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService } from '../../services/tournamentService';
import { useTournaments } from '../../context/TournamentContext';
import { Plus, Search, Calendar, Users, Trophy, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export function TournamentsPage() {
  const navigate = useNavigate();
  const context = useTournaments();
  const contextTournaments = context?.tournaments;

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadTournaments = async () => {
    try {
      let apiData = [];

      if (tournamentService && typeof tournamentService.getAll === 'function') {
        const fetchFn = tournamentService.getMy || tournamentService.getOrganizerTournaments || tournamentService.getAll;
        const response = await fetchFn();

        if (Array.isArray(response)) {
          apiData = response;
        } else if (Array.isArray(response?.data)) {
          apiData = response.data;
        } else if (Array.isArray(response?.tournaments)) {
          apiData = response.tournaments;
        } else if (Array.isArray(response?.data?.tournaments)) {
          apiData = response.data.tournaments;
        }
      }

      // Sync both localStorage keys
      const local1 = JSON.parse(localStorage.getItem('nexus_tournaments') || '[]');
      const local2 = JSON.parse(localStorage.getItem('my_tournaments') || '[]');

      const combinedMap = new Map();
      [...local1, ...local2, ...apiData].forEach(item => {
        const id = item._id || item.id || item.title || item.name;
        if (id) combinedMap.set(id, item);
      });

      setTournaments(Array.from(combinedMap.values()));
    } catch (err) {
      console.error('Failed to load tournaments:', err);
      const local1 = JSON.parse(localStorage.getItem('nexus_tournaments') || '[]');
      const local2 = JSON.parse(localStorage.getItem('my_tournaments') || '[]');
      setTournaments([...local1, ...local2]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await loadTournaments();
    };
    run();
  }, []);

  const sourceList = (Array.isArray(contextTournaments) && contextTournaments.length > 0)
    ? contextTournaments
    : tournaments;

  const filteredTournaments = sourceList.filter((t) => {
    const titleMatch = (t.title || t.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const gameMatch = (t.game || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || gameMatch;

    if (filterStatus === 'All') return matchesSearch;
    return matchesSearch && (t.status || '').toLowerCase() === filterStatus.toLowerCase();
  });

  const getPrizeAmount = (t) => {
    return Number(t.totalPrizePool) || Number(t.prizePool) || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="np-eyebrow">Organizer</p>

          <h1 className="font-display text-2xl font-bold theme-text mt-1">All Tournaments</h1>
          <p className="text-sm theme-subtext">Manage, monitor, and create competitive events.</p>
        </div>
        <Button onClick={() => navigate('/organizer/tournaments/create')} icon={Plus}>
          Create Tournament
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 theme-subtext" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tournament name or game..."
            className="theme-input w-full pl-10 pr-4 py-2 text-sm border rounded-xl outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 theme-subtext hidden sm:block" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="theme-input px-3 py-2 text-sm border rounded-xl outline-none w-full sm:w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tournaments List */}
      {loading ? (
        <div className="theme-card p-8 text-center rounded-2xl border">
          <p className="text-sm theme-subtext">Loading live tournaments...</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="theme-card p-12 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] border border-[var(--np-accent)]/25 text-[var(--np-accent-2)] flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="theme-text font-bold text-base">No Tournaments Found</h3>
          <p className="theme-subtext text-xs max-w-sm">No events match your criteria or none have been created yet.</p>
        </div>
      ) : (
        <div className="np-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTournaments.map((t, idx) => {
            const tournamentId = t._id || t.id || `tourn-${idx}`;

            return (
              <div
                key={tournamentId}
                onClick={() => navigate(`/organizer/tournaments/${tournamentId}`)}
                className="theme-card p-5 rounded-2xl border shadow-xs hover:border-[var(--np-accent)]/40 cursor-pointer transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone="accent">{t.game || 'Esports'}</Badge>

                    <Badge status={t.status || 'Published'} className="capitalize" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold theme-text line-clamp-1">{t.title || t.name}</h3>
                    <p className="text-xs theme-subtext line-clamp-2 mt-1">{t.description || 'No description provided.'}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs theme-subtext">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start: {t.startDate ? new Date(t.startDate).toLocaleDateString() : 'TBA'}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Max: {t.maxParticipants || t.maxTeams || 16}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold theme-text pt-1">
                    <span>Prize Pool</span>
                    <span className="text-[var(--np-accent-2)] tabular-nums">₹{getPrizeAmount(t).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}