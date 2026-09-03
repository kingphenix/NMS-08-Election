import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/nms-new-logo.webp'
import { supabase } from '../lib/supabase'
import { Vote, Award, CheckCircle2, Search, BookOpen, X, Maximize2, Camera } from 'lucide-react'

interface CandidateInfo {
  id: string
  name: string
  color: string
  photoUrl?: string
  tagline: string
  bio: string
  pledges: string[]
}

const LOREM_TAGLINE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
const LOREM_BIO = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
const LOREM_PLEDGES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco.'
]
const LOREM_FULL_MANIFESTO = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.',
  'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at multo elit. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.',
  'Morbi lectus risus, porta vel, pharetra dui, sed, pellentesque at, eros. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra.'
]

interface CompanyCandidate {
  name: string
  color: string
}

const COMPANY_CANDIDATES: CompanyCandidate[] = [
  { name: 'Alpha Company Candidate', color: '#1e40af' },   /* Deep Navy Blue */
  { name: 'Bravo Company Candidate', color: '#a16207' },   /* Dark Ochre / Muted Gold */
  { name: 'Charlie Company Candidate', color: '#991b1b' }, /* Dark Crimson / Burgundy */
  { name: 'Delta Company Candidate', color: '#065f46' },   /* Deep Forest Green */
  { name: 'Echo Company Candidate', color: '#6b21a8' },    /* Dark Regal Purple */
  { name: 'Foxtrot Company Candidate', color: '#571c05' }, /* Deep Bronze / Espresso */
  { name: 'Golf Company Candidate', color: '#9d174d' },    /* Deep Muted Rose */
]

export default function ManifestoPage() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<CandidateInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateInfo | null>(null)
  const [candidatePhotos, setCandidatePhotos] = useState<Record<string, string>>({})

  const handleImageUpload = (candidateId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCandidatePhotos(prev => ({
            ...prev,
            [candidateId]: event.target!.result as string
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    async function loadCandidates() {
      try {
        const { data } = await supabase.from('candidates').select('id, name')
        const mapped = COMPANY_CANDIDATES.map((comp, idx) => ({
          id: data && data[idx] ? data[idx].id : `c-${idx + 1}`,
          name: comp.name,
          color: comp.color,
          tagline: LOREM_TAGLINE,
          bio: LOREM_BIO,
          pledges: LOREM_PLEDGES
        }))
        setCandidates(mapped)
      } catch {
        const mapped = COMPANY_CANDIDATES.map((comp, idx) => ({
          id: `c-${idx + 1}`,
          name: comp.name,
          color: comp.color,
          tagline: LOREM_TAGLINE,
          bio: LOREM_BIO,
          pledges: LOREM_PLEDGES
        }))
        setCandidates(mapped)
      } finally {
        setLoading(false)
      }
    }

    loadCandidates()
  }, [])

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', color: '#0f172a' }}>
      {/* ── Hero Section (Starts Directly with NMS Logo & Official Class Manifesto Portal) ── */}
      <section
        style={{
          background: '#064e3b',
          color: '#ffffff',
          padding: 'var(--sp-12) var(--sp-6)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div className="max-w-xl" style={{ margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* NMS Logo */}
            <img
              src={logo}
              alt="NMS Logo"
              style={{
                height: '80px',
                width: 'auto',
                objectFit: 'contain',
                marginBottom: 'var(--sp-4)'
              }}
            />

            <div
              className="badge"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#6ee7b7',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '6px 16px',
                fontSize: '0.8rem',
                marginBottom: 'var(--sp-4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Award size={14} /> Official Class Manifesto Portal
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: 'var(--sp-4)'
              }}
            >
              Shaping the Future of NMS Class of 2008
            </h2>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.85)',
                maxWidth: '640px',
                margin: '0 auto var(--sp-8) auto',
                lineHeight: 1.6
              }}
            >
              Explore candidate manifestos, visions, and promises for the NMS Class of 2008 Set Chairman election.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                className="btn"
                style={{
                  background: '#10b981',
                  color: '#064e3b',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none'
                }}
              >
                <Vote size={18} />
                Proceed to Voting Booth
              </button>

              <a
                href="#candidates"
                className="btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none'
                }}
              >
                <BookOpen size={18} />
                Explore Manifestos
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Key Metrics Bar ── */}
      <div
        style={{
          background: '#ffffff',
          borderTop: '1px solid #cbd5e1',
          borderBottom: '1px solid #cbd5e1',
          padding: 'var(--sp-6) var(--sp-4)'
        }}
      >
        <div className="max-w-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-6)', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#004526' }}>7 Candidates</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Executive Council Aspirants</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#004526' }}>6 Votes</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Allocated Per Verified Voter</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#004526' }}>Max 3</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Candidates Per Ballot</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>100% Secure</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Token Verified & Audited</div>
          </div>
        </div>
      </div>

      {/* ── Candidates Section ── */}
      <section id="candidates" style={{ padding: 'var(--sp-12) var(--sp-6)' }}>
        <div className="max-w-xl">
          <div className="text-center" style={{ marginBottom: 'var(--sp-8)' }}>
            <span className="badge badge-purple" style={{ marginBottom: 'var(--sp-2)' }}>MEET THE CANDIDATES</span>
            <h2>Meet the Candidates</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '8px auto 0 auto' }}>
              Search and review each candidate’s manifesto and pledges for the Executive Council.
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: 'var(--sp-8)', position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Search candidates by company name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '48px', height: '48px', fontSize: '1rem', background: '#ffffff' }}
            />
          </div>

          {/* Candidate Cards Grid */}
          {loading ? (
            <div className="text-center" style={{ padding: 'var(--sp-12)' }}>
              <div className="spinner" style={{ margin: '0 auto', width: 36, height: 36 }} />
              <p className="text-muted" style={{ marginTop: 'var(--sp-4)' }}>Loading candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="card text-center" style={{ padding: 'var(--sp-10)', background: '#ffffff' }}>
              <p className="text-muted">No candidates found matching "{searchQuery}".</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: 'var(--sp-4)' }}
                onClick={() => setSearchQuery('')}
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-6)' }}>
              {filteredCandidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--sp-6)',
                    boxShadow: 'none'
                  }}
                >
                  <div>
                    {/* Candidate Picture Slot Beside Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                      {/* Circular Picture Slot (Interactive File Upload Slot) */}
                      <label
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          background: '#f8fafc',
                          border: `4px solid ${candidate.color}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                        title="Click to slot candidate image"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(candidate.id, e)}
                        />
                        {candidatePhotos[candidate.id] || candidate.photoUrl ? (
                          <img
                            src={candidatePhotos[candidate.id] || candidate.photoUrl}
                            alt={candidate.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: candidate.color }}>
                            <Camera size={26} />
                            <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                              Slot Photo
                            </span>
                          </div>
                        )}
                      </label>

                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                          {candidate.name}
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                          Candidate #{index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Lorem Ipsum Manifesto Text */}
                    <p style={{ fontWeight: 600, color: candidate.color, fontSize: '0.95rem', marginBottom: 'var(--sp-3)', lineHeight: 1.4 }}>
                      "{candidate.tagline}"
                    </p>

                    <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>
                      {candidate.bio}
                    </p>

                    <div style={{ marginBottom: 'var(--sp-6)' }}>
                      <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 'var(--sp-2)' }}>
                        Manifesto Highlights:
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {candidate.pledges.map((pledge, pIdx) => (
                          <li key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', color: '#1e293b' }}>
                            <CheckCircle2 size={16} style={{ color: candidate.color, flexShrink: 0, marginTop: '2px' }} />
                            <span>{pledge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Expand Manifesto Button using Candidate Color */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 'var(--sp-4)' }}>
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="btn btn--full"
                      style={{
                        background: candidate.color,
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Maximize2 size={16} />
                      Expand Manifesto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Expand Manifesto Modal Overlay ── */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--sp-4)',
              overflowY: 'auto'
            }}
            onClick={() => setSelectedCandidate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                maxWidth: '720px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 'var(--sp-8)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                border: '1px solid #cbd5e1'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCandidate(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
                aria-label="Close manifesto modal"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)', paddingRight: '40px' }}>
                <label
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#f8fafc',
                    border: `5px solid ${selectedCandidate.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  title="Click to slot candidate image"
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(selectedCandidate.id, e)}
                  />
                  {candidatePhotos[selectedCandidate.id] || selectedCandidate.photoUrl ? (
                    <img
                      src={candidatePhotos[selectedCandidate.id] || selectedCandidate.photoUrl}
                      alt={selectedCandidate.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: selectedCandidate.color }}>
                      <Camera size={32} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Slot Photo
                      </span>
                    </div>
                  )}
                </label>

                <div>
                  <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    {selectedCandidate.name}
                  </h2>
                  <span style={{ fontSize: '0.9rem', color: selectedCandidate.color, fontWeight: 600 }}>
                    Official Manifesto Document — NMS 08 Election
                  </span>
                </div>
              </div>

              {/* Tagline */}
              <div style={{ background: '#f8fafc', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${selectedCandidate.color}`, marginBottom: 'var(--sp-6)' }}>
                <p style={{ fontWeight: 600, color: selectedCandidate.color, fontSize: '1.05rem', margin: 0 }}>
                  "{selectedCandidate.tagline}"
                </p>
              </div>

              {/* Full Expanded Manifesto Body */}
              <div style={{ marginBottom: 'var(--sp-6)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 'var(--sp-3)' }}>
                  Executive Summary & Vision Statement
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, marginBottom: 'var(--sp-4)' }}>
                  {selectedCandidate.bio}
                </p>

                {LOREM_FULL_MANIFESTO.map((paragraph, pIdx) => (
                  <p key={pIdx} style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, marginBottom: 'var(--sp-4)' }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Core Pledges */}
              <div style={{ marginBottom: 'var(--sp-8)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 'var(--sp-3)' }}>
                  Key Strategic Action Items & Pledges
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedCandidate.pledges.map((pledge, pIdx) => (
                    <li key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: '#1e293b', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                      <CheckCircle2 size={20} style={{ color: selectedCandidate.color, flexShrink: 0, marginTop: '2px' }} />
                      <span>{pledge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 'var(--sp-6)' }}>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="btn btn-secondary"
                  style={{ background: '#f1f5f9', color: '#0f172a', borderColor: '#cbd5e1', fontWeight: 600 }}
                >
                  Close Manifesto
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="btn"
                  style={{ background: '#10b981', color: '#064e3b', fontWeight: 700, border: 'none' }}
                >
                  <Vote size={18} />
                  Proceed to Voting Booth
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Voting Process / Instructions Section ── */}
      <section style={{ padding: 'var(--sp-12) var(--sp-6)', background: '#064e3b', color: '#ffffff' }}>
        <div className="max-w-xl">
          <div className="text-center" style={{ marginBottom: 'var(--sp-10)' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#6ee7b7', marginBottom: 'var(--sp-2)' }}>VOTING INSTRUCTIONS</span>
            <h2 style={{ color: '#ffffff' }}>How to Cast Your Ballot</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '560px', margin: '8px auto 0 auto' }}>
              Follow these simple steps to cast your vote using your unique credential token.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-6)' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-6)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6ee7b7', marginBottom: 'var(--sp-2)' }}>01</div>
              <h3 style={{ color: '#ffffff', marginBottom: 'var(--sp-2)' }}>Get Token</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                Retrieve your 16-character alphanumeric voting token from your official credential letter.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-6)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6ee7b7', marginBottom: 'var(--sp-2)' }}>02</div>
              <h3 style={{ color: '#ffffff', marginBottom: 'var(--sp-2)' }}>Access Portal</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                Click 'Vote Booth Access', enter your token format (XXXX-XXXX-XXXX-XXXX), and authenticate.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-6)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6ee7b7', marginBottom: 'var(--sp-2)' }}>03</div>
              <h3 style={{ color: '#ffffff', marginBottom: 'var(--sp-2)' }}>Allocate 6 Votes</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                Choose 1 to 3 candidates and distribute your 6 votes between them according to preference.
              </p>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: 'var(--sp-10)' }}>
            <button
              onClick={() => navigate('/login')}
              className="btn"
              style={{
                background: '#10b981',
                color: '#064e3b',
                fontWeight: 800,
                fontSize: '1.1rem',
                padding: '16px 36px',
                borderRadius: 'var(--radius-md)',
                border: 'none'
              }}
            >
              🔐 Access Voting Booth Now
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: '#043427',
          color: 'rgba(255, 255, 255, 0.7)',
          padding: 'var(--sp-8) var(--sp-6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}
      >
        <div className="max-w-xl flex flex-col items-center gap-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="NMS Logo" style={{ height: '32px', width: 'auto' }} />
            <span style={{ color: '#ffffff', fontWeight: 700 }}>NMS Class of 2008 Set Chairman Election</span>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
            Official Democratic Portal & Electoral Committee 2026. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <a href="/login" style={{ color: '#6ee7b7' }}>Voter Login</a>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <a href="/admin" style={{ color: '#6ee7b7' }}>Election Admin</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
