import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { adminResetToken } from '../lib/api'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell,
} from 'recharts'

const TOTAL_VOTERS = 150
const POLL_INTERVAL_MS = 30_000

type Tab = 'results' | 'turnout' | 'tokens' | 'audit'
type TokenFilter = 'all' | 'unused' | 'used_not_voted' | 'voted' | 'expired'

interface CandidateResult { id: string; name: string; votes: number }
interface Credential {
  id: string
  status: string
  has_voted: boolean
  issued_at: string
  used_at: string | null
  token_last_four: string
}
interface AuditEntry {
  id: string
  action: string
  credential_id: string | null
  details: Record<string, unknown>
  created_at: string
}

/* ── Admin Password Gate ───────────────────────────────────── */
function PasswordGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)

  const submit = () => {
    // Minimal client-side check — real auth is on Edge Functions
    if (pw.length >= 6) {
      onAuth(pw)
    } else {
      setError(true)
    }
  }

  return (
    <div className="page-center">
      <motion.div
        className="card max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center" style={{ marginBottom: 'var(--sp-6)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>🔑</div>
          <h2>Admin Access</h2>
          <p className="text-muted" style={{ marginTop: 4 }}>Enter the admin password to continue.</p>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="admin-pw">Admin Password</label>
          <input
            id="admin-pw"
            className="input"
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="••••••••"
            style={error ? { borderColor: 'var(--color-error)' } : {}}
          />
          {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>Password too short.</p>}
        </div>

        <button
          className="btn btn-primary btn--full"
          style={{ marginTop: 'var(--sp-4)' }}
          onClick={submit}
        >
          Enter Dashboard
        </button>
      </motion.div>
    </div>
  )
}

/* ── Circular Turnout Meter ────────────────────────────────── */
function TurnoutRing({ voted, total }: { voted: number; total: number }) {
  const pct = total > 0 ? voted / total : 0
  const R = 70
  const circ = 2 * Math.PI * R
  const stroke = circ * (1 - pct)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-4)' }}>
      <div style={{ position: 'relative', width: 180, height: 180 }}>
        <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <motion.circle
            cx="90" cy="90" r={R}
            fill="none"
            stroke="url(#turnoutGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: stroke }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          <defs>
            <linearGradient id="turnoutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>{Math.round(pct * 100)}%</span>
          <span className="text-xs text-muted">Turnout</span>
        </div>
      </div>
      <div className="text-center">
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {voted} <span className="text-muted">of</span> {total}
        </div>
        <div className="text-sm text-muted">voters have submitted a ballot</div>
      </div>
    </div>
  )
}

/* ── Results Chart ─────────────────────────────────────────── */
function ResultsChart({ results }: { results: CandidateResult[] }) {
  const sorted = [...results].sort((a, b) => b.votes - a.votes)
  const maxVotes = Math.max(...results.map(r => r.votes), 1)
  const COLORS = ['#004526', '#064e3b', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7']

  return (
    <div>
      <h3 style={{ marginBottom: 'var(--sp-4)' }}>Live Vote Totals</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
          <XAxis type="number" domain={[0, maxVotes + 2]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fill: 'var(--color-text)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          {/* Tooltip removed per request */}
          <Bar dataKey="votes" radius={[0, 6, 6, 0]} label={{ position: 'right', fill: 'var(--color-text-muted)', fontSize: 13 }}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── Token Table ───────────────────────────────────────────── */
function TokenTable({
  credentials,
  adminPw,
  onReset,
}: {
  credentials: Credential[]
  adminPw: string
  onReset: () => void
}) {
  const [filter, setFilter] = useState<TokenFilter>('all')
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [resetResult, setResetResult] = useState<{ token: string; credentialId: string } | null>(null)
  const [reason, setReason] = useState('')

  const filtered = credentials.filter(c => {
    if (filter === 'unused') return c.status === 'unused'
    if (filter === 'used_not_voted') return c.status === 'used' && !c.has_voted
    if (filter === 'voted') return c.has_voted
    if (filter === 'expired') return c.status === 'expired'
    return true
  })

  const handleReset = async (credentialId: string) => {
    if (!reason.trim()) return
    setResettingId(credentialId)
    try {
      const newToken = await adminResetToken(adminPw, credentialId, reason)
      setResetResult({ token: newToken, credentialId })
      setResettingId(null)
      setReason('')
      onReset()
    } catch {
      setResettingId(null)
      alert('Reset failed. Check admin password and try again.')
    }
  }

  const statusBadge = (cred: Credential) => {
    if (cred.has_voted) return <span className="badge badge-success">✓ Voted</span>
    if (cred.status === 'used') return <span className="badge badge-warning">Logged in, not voted</span>
    if (cred.status === 'expired') return <span className="badge badge-error">Expired</span>
    return <span className="badge badge-muted">Unused</span>
  }

  const FILTER_OPTIONS: { value: TokenFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unused', label: 'Unused' },
    { value: 'used_not_voted', label: 'Logged In (No Vote)' },
    { value: 'voted', label: 'Voted' },
    { value: 'expired', label: 'Expired' },
  ]

  return (
    <div>
      {/* New token result */}
      <AnimatePresence>
        {resetResult && (
          <motion.div
            className="alert alert-success"
            style={{ marginBottom: 'var(--sp-4)' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div>
              <strong>New token issued!</strong>{' '}
              Give this to the voter in person — it will NOT be shown again:
              <br />
              <code style={{ fontSize: '1.1rem', letterSpacing: '0.12em', color: 'var(--color-success)' }}>
                {resetResult.token}
              </code>
              <button
                className="btn btn-sm btn-secondary"
                style={{ marginLeft: 12 }}
                onClick={() => setResetResult(null)}
              >Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`btn btn-sm ${filter === opt.value ? 'btn-primary' : 'btn-secondary'}`}
          >
            {opt.label}
          </button>
        ))}
        <span className="text-sm text-muted" style={{ alignSelf: 'center', marginLeft: 'auto' }}>
          {filtered.length} credential{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Reason input */}
      <div className="flex gap-3 items-center" style={{ marginBottom: 'var(--sp-4)' }}>
        <input
          className="input"
          placeholder="Reset reason (required before resetting a token)"
          value={reason}
          onChange={e => setReason(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Last 4</th>
              <th>Status</th>
              <th>Issued</th>
              <th>Last Used</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cred => (
              <tr key={cred.id}>
                <td>
                  <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                    ····-{cred.token_last_four}
                  </code>
                </td>
                <td>{statusBadge(cred)}</td>
                <td className="text-sm text-muted">
                  {new Date(cred.issued_at).toLocaleDateString()}
                </td>
                <td className="text-sm text-muted">
                  {cred.used_at ? new Date(cred.used_at).toLocaleString() : '—'}
                </td>
                <td>
                  {!cred.has_voted && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleReset(cred.id)}
                      disabled={resettingId === cred.id || !reason.trim()}
                    >
                      {resettingId === cred.id ? '…' : 'Reset'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted" style={{ padding: 'var(--sp-6)' }}>
                  No credentials match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Audit Log Table ───────────────────────────────────────── */
function AuditLogTable({ entries }: { entries: AuditEntry[] }) {
  const actionBadge = (action: string) => {
    const map: Record<string, string> = {
      login_success:    'badge-success',
      login_failure:    'badge-error',
      ballot_submitted: 'badge-purple',
      token_generated:  'badge-muted',
      token_reset:      'badge-warning',
      token_expired:    'badge-error',
    }
    return <span className={`badge ${map[action] ?? 'badge-muted'}`}>{action.replace(/_/g, ' ')}</span>
  }

  return (
    <div>
      <h3 style={{ marginBottom: 'var(--sp-4)' }}>Audit Log ({entries.length} entries)</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Credential</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>
                  {new Date(e.created_at).toLocaleString()}
                </td>
                <td>{actionBadge(e.action)}</td>
                <td className="text-xs font-mono text-muted">
                  {e.credential_id ? e.credential_id.slice(0, 8) + '…' : '—'}
                </td>
                <td className="text-xs text-subtle" style={{ maxWidth: 200 }}>
                  {e.details
                    ? Object.entries(e.details)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')
                    : '—'}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted" style={{ padding: 'var(--sp-6)' }}>
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}



const ADMIN_PW_KEY = 'nms_admin_pw'

/* ── Main Admin Page ───────────────────────────────────────── */
export default function AdminPage() {
  const [adminPw, setAdminPwState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(ADMIN_PW_KEY)
    } catch {
      return null
    }
  })

  const setAdminPw = (pw: string | null) => {
    try {
      if (pw) sessionStorage.setItem(ADMIN_PW_KEY, pw)
      else sessionStorage.removeItem(ADMIN_PW_KEY)
    } catch {}
    setAdminPwState(pw)
  }

  const [activeTab, setActiveTab] = useState<Tab>('results')

  const [results, setResults] = useState<CandidateResult[]>([])
  const [votedCount, setVotedCount] = useState(0)
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchResults = useCallback(async () => {
    // Vote totals
    const { data: ballotData } = await supabase
      .from('ballots')
      .select('candidate_id, votes_given')

    const { data: cands } = await supabase
      .from('candidates')
      .select('id, name')

    if (cands) {
      const totals: Record<string, number> = {}
      for (const b of ballotData ?? []) {
        totals[b.candidate_id] = (totals[b.candidate_id] ?? 0) + b.votes_given
      }
      setResults(cands.map(c => ({ ...c, votes: totals[c.id] ?? 0 })))
    }

    // Turnout
    const { count } = await supabase
      .from('voter_credentials')
      .select('*', { count: 'exact', head: true })
      .eq('has_voted', true)
    setVotedCount(count ?? 0)

    setLastUpdated(new Date())
  }, [])

  const fetchCredentials = useCallback(async () => {
    const { data } = await supabase
      .from('voter_credentials')
      .select('id, status, has_voted, issued_at, used_at, token_last_four')
      .order('issued_at', { ascending: true })
    if (data) setCredentials(data)
  }, [])

  const fetchAuditLog = useCallback(async () => {
    const { data } = await supabase
      .from('audit_log')
      .select('id, action, credential_id, details, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setAuditLog(data)
  }, [])

  const handleManualRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([fetchResults(), fetchCredentials(), fetchAuditLog()])
    setRefreshing(false)
  }, [fetchResults, fetchCredentials, fetchAuditLog])

  useEffect(() => {
    if (!adminPw) return

    fetchResults()
    fetchCredentials()
    fetchAuditLog()

    const interval = setInterval(() => {
      fetchResults()
      fetchCredentials()
      fetchAuditLog()
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [adminPw, fetchResults, fetchCredentials, fetchAuditLog])

  if (!adminPw) return <PasswordGate onAuth={setAdminPw} />

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'results', label: 'Results', icon: '📊' },
    { id: 'turnout', label: 'Turnout', icon: '📈' },
    { id: 'tokens', label: 'Tokens', icon: '🔑' },
    { id: 'audit', label: 'Audit Log', icon: '📋' },
  ]

  return (
    <div style={{ minHeight: '100dvh', padding: 'var(--sp-6) var(--sp-4)', paddingBottom: 'var(--sp-16)' }}>
      <div className="max-w-xl">
        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-6)', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem' }}>Admin Dashboard</h1>
            <p className="text-sm text-muted">
              {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Loading…'}
              {' · '}
              <span style={{ color: 'var(--color-success)' }}>Live (30s auto-refresh)</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
            >
              🔄 {refreshing ? 'Refreshing…' : 'Refresh Data'}
            </button>
            <a href="/" className="btn btn-secondary btn-sm">← Voter View</a>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setAdminPw(null)}
              title="Lock Admin Session"
            >
              🔒 Logout
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="tabs" style={{ marginBottom: 'var(--sp-6)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`admin-tab-${tab.id}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'results' && (
              <div className="card">
                <ResultsChart results={results} />
                <div className="divider" />
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Candidate</th>
                        <th>Votes</th>
                        <th>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...results]
                        .sort((a, b) => b.votes - a.votes)
                        .map((r, i) => {
                          const total = results.reduce((s, x) => s + x.votes, 0)
                          return (
                            <tr key={r.id}>
                              <td>
                                {i === 0 && r.votes > 0
                                  ? <span className="badge badge-warning">🥇 1st</span>
                                  : <span className="text-muted">#{i + 1}</span>
                                }
                              </td>
                              <td style={{ fontWeight: 600 }}>{r.name}</td>
                              <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{r.votes}</td>
                              <td className="text-muted text-sm">
                                {total > 0 ? `${Math.round((r.votes / total) * 100)}%` : '—'}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'turnout' && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-8)' }}>
                <TurnoutRing voted={votedCount} total={TOTAL_VOTERS} />
                <div className="divider" style={{ width: '100%' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-4)', width: '100%' }}>
                  {[
                    { label: 'Voted', value: votedCount, color: 'var(--color-success)' },
                    { label: 'Not Yet Voted', value: TOTAL_VOTERS - votedCount, color: 'var(--color-text-muted)' },
                    { label: 'Total Voters', value: TOTAL_VOTERS, color: 'var(--color-primary)' },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--sp-4)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted" style={{ marginTop: 4 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="card">
                <TokenTable
                  credentials={credentials}
                  adminPw={adminPw}
                  onReset={() => { fetchCredentials(); fetchAuditLog() }}
                />
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="card">
                <AuditLogTable entries={auditLog} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
