import React, { useState, useEffect, useRef } from 'react';
import api from '../../../utils/api';

// ─── Utility ────────────────────────────────────────────────────────────────
const formatNumber = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const formatDuration = (seconds = 0) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

// ─── Skeleton Loader ────────────────────────────────────────────────────────
const Skeleton = ({ style = {} }) => (
  <div
    style={{
      borderRadius: 8,
      background: 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }}
  />
);

// ─── Animated Counter ────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, format = 'default' }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 1200;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  if (format === 'short') return <>{formatNumber(display)}</>;
  return <>{display.toLocaleString()}</>;
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = '#53e076', loading, badge }) => (
  <div style={styles.statCard}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <span style={{ ...styles.iconBox, background: `${color}18`, color }}>
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{icon}</span>
      </span>
      {badge && (
        <span style={{ ...styles.badge, color, background: `${color}15`, borderColor: `${color}30` }}>
          {badge}
        </span>
      )}
    </div>
    <p style={styles.cardLabel}>{label}</p>
    {loading ? (
      <Skeleton style={{ height: 40, width: '60%', marginTop: 4 }} />
    ) : (
      <p style={{ ...styles.cardValue, color }}>
        <AnimatedNumber value={value} format="short" />
      </p>
    )}
    {sub && !loading && <p style={styles.cardSub}>{sub}</p>}
  </div>
);

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '28px 16px' }}>
    <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#2a2a2a', display: 'block', marginBottom: 10 }}>{icon}</span>
    <p style={{ color: '#4a4a4a', fontSize: 13 }}>{text}</p>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const ArtistDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/artist/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          setError('Không thể tải dữ liệu dashboard.');
        }
      } catch (err) {
        setError('Lỗi kết nối. Vui lòng thử lại.');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const topPlays = stats?.topTracks?.[0]?.plays || 1;

  const statusCards = stats ? [
    { label: 'Published', value: stats.publishedTracks, color: '#53e076', icon: 'check_circle' },
    { label: 'Pending Review', value: stats.pendingTracks, color: '#f59e0b', icon: 'schedule' },
  ] : [];

  // ─── Error State ──────────────────────────────────────────────────────────
  if (!loading && error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ef4444' }}>error_outline</span>
        <p style={{ color: '#a1a1aa', fontSize: 15 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.retryBtn}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.8)} }
        .dash-root * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        .stat-card-hover:hover { transform: translateY(-2px) !important; background: #222 !important; }
        .track-row:hover { background: rgba(83,224,118,0.04) !important; }
        .upload-row:hover { background: rgba(255,255,255,0.04) !important; }
        .dash-fade-up { animation: fadeUp 0.5s ease both; }
        .dash-fade-up-1 { animation: fadeUp 0.5s 0.05s ease both; }
        .dash-fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .dash-fade-up-3 { animation: fadeUp 0.5s 0.15s ease both; }
        .dash-fade-up-4 { animation: fadeUp 0.5s 0.2s ease both; }
        .dash-quick-action:hover { background: #222 !important; transform: translateY(-1px); }
        @media (max-width: 960px) {
          .dash-grid-main { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .dash-grid-four { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .dash-grid-four { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="dash-root" style={styles.root}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="dash-fade-up" style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {loading ? (
              <Skeleton style={{ width: 64, height: 64, borderRadius: '50%' }} />
            ) : stats?.artistImage ? (
              <img src={stats.artistImage} alt="avatar" style={styles.avatar} />
            ) : (
              <div style={{ ...styles.avatar, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#53e076' }}>person</span>
              </div>
            )}

            <div>
              {loading ? (
                <Skeleton style={{ width: 240, height: 28, marginBottom: 8 }} />
              ) : (
                <h1 style={styles.headerTitle}>
                  Welcome back, <span style={{ color: '#53e076' }}>{stats?.artistName || 'Artist'}</span>
                </h1>
              )}
              <p style={styles.headerSub}>
                <span style={styles.liveDot} />
                Creator Studio · Dashboard Overview
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={styles.dateBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#53e076' }}>calendar_today</span>
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* ── Stat Cards ────────────────────────────────────────────── */}
        <div className="dash-fade-up-1 dash-grid-four" style={styles.gridFour}>
          <StatCard
            icon="equalizer"
            label="Total Streams"
            value={stats?.totalStreams || 0}
            color="#53e076"
            badge="Live"
            loading={loading}
            sub={stats ? 'All-time plays across your tracks' : null}
          />
          <StatCard
            icon="library_music"
            label="Total Tracks"
            value={stats?.totalTracks || 0}
            color="#818cf8"
            loading={loading}
            sub={stats ? `${stats.publishedTracks} published · ${stats.pendingTracks} pending` : null}
          />
          <StatCard
            icon="album"
            label="Albums"
            value={stats?.totalAlbums || 0}
            color="#f59e0b"
            loading={loading}
            sub={stats?.totalAlbums === 0 ? 'No albums yet' : `${stats?.totalAlbums} collection${stats?.totalAlbums > 1 ? 's' : ''}`}
          />
          <StatCard
            icon="group"
            label="Followers"
            value={stats?.followers || 0}
            color="#ec4899"
            loading={loading}
            sub={stats ? 'Total fan base' : null}
          />
        </div>

        {/* ── Main Grid: Top Tracks + Right Panel ──────────────────── */}
        <div className="dash-fade-up-2 dash-grid-main" style={styles.gridMain}>

          {/* Top Tracks Leaderboard */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#53e076', verticalAlign: 'middle', marginRight: 8 }}>leaderboard</span>
                  Top Tracks by Plays
                </h2>
                <p style={styles.cardDesc}>Your best-performing published songs</p>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Skeleton style={{ width: 28, height: 28, borderRadius: 6 }} />
                    <Skeleton style={{ width: 44, height: 44, borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <Skeleton style={{ width: '55%', height: 14, marginBottom: 6 }} />
                      <Skeleton style={{ width: '80%', height: 6, borderRadius: 3 }} />
                    </div>
                    <Skeleton style={{ width: 56, height: 14 }} />
                  </div>
                ))}
              </div>
            ) : !stats?.topTracks?.length ? (
              <EmptyState icon="music_note" text="No published tracks yet. Upload your first song!" />
            ) : (
              <div>
                {stats.topTracks.map((track, idx) => {
                  const pct = Math.max(Math.round((track.plays / topPlays) * 100), 2);
                  const rankColors = ['#f59e0b', '#a1a1aa', '#cd7f32', '#53e076', '#818cf8'];
                  const rankEmojis = ['🥇', '🥈', '🥉'];
                  return (
                    <div
                      key={track._id}
                      className="track-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '12px 6px',
                        borderRadius: 10,
                        cursor: 'default',
                        transition: 'background 0.2s',
                        borderBottom: idx < stats.topTracks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}
                    >
                      {/* Rank */}
                      <span style={{
                        width: 30,
                        textAlign: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        color: rankColors[idx] || '#a1a1aa',
                        flexShrink: 0,
                      }}>
                        {rankEmojis[idx] || `#${idx + 1}`}
                      </span>

                      {/* Artwork */}
                      <div style={{
                        width: 46,
                        height: 46,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: '#2a2a2a',
                        overflow: 'hidden',
                      }}>
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>

                      {/* Info + Play Bar */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 8,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {track.title}
                        </p>
                        <div style={{ background: '#222', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${rankColors[idx] || '#53e076'}, #53e076)`,
                            borderRadius: 4,
                            transition: 'width 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
                          }} />
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 64 }}>
                        <p style={{ color: '#53e076', fontWeight: 700, fontSize: 14 }}>{formatNumber(track.plays)}</p>
                        <p style={{ color: '#3a3a3a', fontSize: 11, marginTop: 3 }}>{formatDuration(track.duration)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Status Breakdown */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#818cf8', verticalAlign: 'middle', marginRight: 8 }}>donut_small</span>
                    Track Status
                  </h2>
                  <p style={styles.cardDesc}>Publication breakdown</p>
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...Array(2)].map((_, i) => <Skeleton key={i} style={{ height: 60, borderRadius: 10 }} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {statusCards.map(({ label, value, color, icon }) => {
                    const total = Math.max(stats.totalTracks, 1);
                    const pct = Math.round((value / total) * 100);
                    return (
                      <div key={label} style={{
                        background: `${color}0a`,
                        border: `1px solid ${color}20`,
                        borderRadius: 12,
                        padding: '14px 16px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color }}>{icon}</span>
                            <span style={{ color: '#d4d4d4', fontSize: 13, fontWeight: 600 }}>{label}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ color, fontWeight: 800, fontSize: 20 }}>{value}</span>
                            <span style={{ color: '#4a4a4a', fontSize: 11 }}>{pct}%</span>
                          </div>
                        </div>
                        <div style={{ background: '#2a2a2a', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    );
                  })}

                  {/* Total row */}
                  <div style={{
                    marginTop: 4,
                    padding: '11px 16px',
                    background: '#1a1a1a',
                    borderRadius: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ color: '#a1a1aa', fontSize: 13 }}>Total Tracks</span>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{stats?.totalTracks || 0}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Uploads */}
            <div style={{ ...styles.card, flex: 1 }}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#f59e0b', verticalAlign: 'middle', marginRight: 8 }}>history</span>
                    Recent Uploads
                  </h2>
                  <p style={styles.cardDesc}>Latest activity</p>
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Skeleton style={{ width: 44, height: 44, borderRadius: 8 }} />
                      <div style={{ flex: 1 }}>
                        <Skeleton style={{ width: '65%', height: 12, marginBottom: 6 }} />
                        <Skeleton style={{ width: '40%', height: 10 }} />
                      </div>
                      <Skeleton style={{ width: 52, height: 20, borderRadius: 20 }} />
                    </div>
                  ))}
                </div>
              ) : !stats?.recentUploads?.length ? (
                <EmptyState icon="cloud_upload" text="No uploads yet. Start sharing your music!" />
              ) : (
                <div>
                  {stats.recentUploads.map((item, idx) => {
                    const statusMap = {
                      live: { label: 'Live', color: '#53e076' },
                      pending_review: { label: 'Pending', color: '#f59e0b' },
                      pending: { label: 'Pending', color: '#f59e0b' },
                      rejected: { label: 'Rejected', color: '#ef4444' },
                    };
                    const s = statusMap[item.status] || { label: item.status || 'Unknown', color: '#a1a1aa' };
                    return (
                      <div
                        key={item._id}
                        className="upload-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 4px',
                          borderRadius: 8,
                          cursor: 'default',
                          transition: 'background 0.2s',
                          borderBottom: idx < stats.recentUploads.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}
                      >
                        <div style={{
                          width: 46,
                          height: 46,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: '#2a2a2a',
                          overflow: 'hidden',
                        }}>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            color: '#e5e5e5',
                            fontWeight: 600,
                            fontSize: 13,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {item.title}
                          </p>
                          <p style={{ color: '#4a4a4a', fontSize: 11, marginTop: 3 }}>{getTimeAgo(item.createdAt)}</p>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '3px 9px',
                            borderRadius: 20,
                            background: `${s.color}15`,
                            color: s.color,
                            border: `1px solid ${s.color}30`,
                            display: 'inline-block',
                          }}>
                            {s.label}
                          </span>
                          {item.plays > 0 && (
                            <p style={{ color: '#4a4a4a', fontSize: 10, marginTop: 4 }}>
                              {formatNumber(item.plays)} plays
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div className="dash-fade-up-4" style={styles.quickActionsBox}>
          <p style={{ color: '#4a4a4a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Quick Actions
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { icon: 'upload', label: 'Upload Track', href: '/studio/tracks', color: '#53e076' },
              { icon: 'album', label: 'Create Album', href: '/studio/albums', color: '#818cf8' },
              { icon: 'library_music', label: 'Manage Content', href: '/studio/tracks', color: '#f59e0b' },
            ].map(({ icon, label, href, color }) => (
              <a
                key={label}
                href={href}
                className="dash-quick-action"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 18px',
                  background: '#1c1c1c',
                  border: `1px solid ${color}18`,
                  borderRadius: 10,
                  textDecoration: 'none',
                  transition: 'background 0.2s, transform 0.15s',
                  cursor: 'pointer',
                  flex: '1 1 160px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color }}>{icon}</span>
                <span style={{ color: '#d4d4d4', fontSize: 13, fontWeight: 600 }}>{label}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#3a3a3a', marginLeft: 'auto' }}>arrow_forward</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  root: {
    padding: '32px 28px 40px',
    maxWidth: 1400,
    margin: '0 auto',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid rgba(83,224,118,0.3)',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: '#fff',
    margin: 0,
    lineHeight: 1.2,
    fontFamily: 'Inter, sans-serif',
  },
  headerSub: {
    color: '#4a4a4a',
    fontSize: 13,
    marginTop: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#53e076',
    display: 'inline-block',
    animation: 'pulse-dot 2s infinite',
  },
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 20,
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.07)',
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: 600,
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: '20px 22px',
    transition: 'transform 0.2s ease, background 0.2s ease',
    cursor: 'default',
  },
  iconBox: {
    display: 'inline-flex',
    padding: '10px',
    borderRadius: 10,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 20,
    border: '1px solid',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  cardLabel: {
    color: '#4a4a4a',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 34,
    fontWeight: 900,
    lineHeight: 1,
    marginBottom: 4,
    fontFamily: 'Inter, sans-serif',
  },
  cardSub: {
    color: '#3a3a3a',
    fontSize: 11,
    marginTop: 6,
  },
  gridMain: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 20,
    marginBottom: 20,
    alignItems: 'start',
  },
  card: {
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: '22px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    margin: '0 0 3px',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Inter, sans-serif',
  },
  cardDesc: {
    color: '#4a4a4a',
    fontSize: 12,
    marginLeft: 28,
  },
  quickActionsBox: {
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: '20px 22px',
  },
  retryBtn: {
    padding: '10px 24px',
    background: '#53e076',
    color: '#003914',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
  },
};

export default ArtistDashboard;