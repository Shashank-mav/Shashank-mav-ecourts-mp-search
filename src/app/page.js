'use client';

import { useState, useCallback } from 'react';

const TABS = [
  { id: 'party', label: 'Party Name' },
  { id: 'cnr', label: 'CNR Lookup' },
  { id: 'advocate', label: 'Advocate' },
  { id: 'causelist', label: 'Cause List' },
];

const MP_STATE_CODE = 'MP';

function formatDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function statusClass(s) {
  if (!s) return 'tag-default';
  const l = s.toLowerCase();
  if (l === 'disposed' || l === 'dismissed') return 'tag-status-disposed';
  if (l === 'pending') return 'tag-status-pending';
  return 'tag-default';
}

function buildTitle(pet, res) {
  const p = (pet && pet.length > 0) ? pet[0] : 'Unknown';
  const r = (res && res.length > 0) ? res[0] : 'Unknown';
  const extra = (pet && pet.length > 1) ? ` +${pet.length - 1}` : '';
  return `${p}${extra} vs. ${r}`;
}

// ─── Case Detail View ────────────────────────────────────────
function CaseDetail({ cnr, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useState(() => {
    (async () => {
      try {
        const res = await fetch(`/api/case?cnr=${encodeURIComponent(cnr)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || json.message || 'Failed to load case');
        setData(json.data);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [cnr]);

  if (loading) return <div className="loading"><div className="spinner" />Loading case details…</div>;
  if (error) return <><button className="back-btn" onClick={onBack}>← Back to results</button><div className="error-box">{error}</div></>;

  const c = data?.courtCaseData;
  if (!c) return <><button className="back-btn" onClick={onBack}>← Back</button><div className="error-box">No case data found for {cnr}</div></>;

  const hearings = (c.historyOfCaseHearings || []).slice(-15);

  return (
    <div className="detail-panel">
      <button className="back-btn" onClick={onBack}>← Back to results</button>
      <h2>{buildTitle(c.petitioners, c.respondents)}</h2>

      <div className="case-meta" style={{ marginBottom: 20 }}>
        {c.caseStatus && <span className={`tag ${statusClass(c.caseStatus)}`}>{c.caseStatus}</span>}
        {c.caseTypeRaw && <span className="tag tag-default">{c.caseTypeRaw}</span>}
      </div>

      <div className="detail-section">
        <h3>Case Information</h3>
        <div className="detail-grid">
          <div className="detail-item"><span className="detail-label">CNR</span><span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{c.cnr}</span></div>
          <div className="detail-item"><span className="detail-label">Filing No.</span><span className="detail-value">{c.filingNumber || '—'}</span></div>
          <div className="detail-item"><span className="detail-label">Filing Date</span><span className="detail-value">{formatDate(c.filingDate)}</span></div>
          <div className="detail-item"><span className="detail-label">Reg. No.</span><span className="detail-value">{c.registrationNumber || '—'}</span></div>
          <div className="detail-item"><span className="detail-label">First Hearing</span><span className="detail-value">{formatDate(c.firstHearingDate)}</span></div>
          <div className="detail-item"><span className="detail-label">Next Hearing</span><span className="detail-value">{formatDate(c.nextHearingDate)}</span></div>
          <div className="detail-item"><span className="detail-label">Decision Date</span><span className="detail-value">{formatDate(c.decisionDate)}</span></div>
          <div className="detail-item"><span className="detail-label">Court</span><span className="detail-value">{c.courtName || '—'}</span></div>
        </div>
      </div>

      {c.firDetails && c.firDetails.caseNumber && (
        <div className="detail-section">
          <h3>FIR Details</h3>
          <div className="detail-grid">
            <div className="detail-item"><span className="detail-label">FIR No.</span><span className="detail-value">{c.firDetails.caseNumber}/{c.firDetails.year}</span></div>
            <div className="detail-item"><span className="detail-label">Police Station</span><span className="detail-value">{c.firDetails.policeStation || '—'}</span></div>
          </div>
        </div>
      )}

      <div className="detail-section">
        <h3>Parties</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Petitioner(s)</span>
            <span className="detail-value">{(c.petitioners || []).join(', ') || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Respondent(s)</span>
            <span className="detail-value">{(c.respondents || []).join(', ') || '—'}</span>
          </div>
        </div>
      </div>

      {c.actsAndSections && (
        <div className="detail-section">
          <h3>Acts & Sections</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.actsAndSections}</p>
        </div>
      )}

      {hearings.length > 0 && (
        <div className="detail-section">
          <h3>Hearing History (last {hearings.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="hearing-table">
              <thead>
                <tr><th>Date</th><th>Judge</th><th>Purpose</th><th>Next Date</th></tr>
              </thead>
              <tbody>
                {hearings.map((h, i) => (
                  <tr key={i}>
                    <td>{formatDate(h.businessOnDate)}</td>
                    <td>{h.judge || '—'}</td>
                    <td>{h.purposeOfListing || '—'}</td>
                    <td>{formatDate(h.hearingDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(c.interimOrders?.length > 0 || c.judgmentOrders?.length > 0) && (
        <div className="detail-section">
          <h3>Orders ({(c.interimOrders?.length || 0) + (c.judgmentOrders?.length || 0)})</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {c.interimOrders?.length || 0} interim orders, {c.judgmentOrders?.length || 0} judgments
          </p>
        </div>
      )}

      <a
        className="case-link"
        href={`https://ecourtsindia.com/cnr/${c.cnr}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View full case on eCourtsIndia →
      </a>
    </div>
  );
}

// ─── Search Forms ─────────────────────────────────────────────
function PartySearch({ onSearch, loading }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const params = new URLSearchParams();
    params.set('litigants', name.trim());
    params.set('stateCodes', MP_STATE_CODE);
    params.set('courtLevels', 'DC');
    if (year) params.set('filingYears', year);
    if (status) params.set('caseStatuses', status);
    params.set('pageSize', '20');
    onSearch(params.toString());
  };

  return (
    <form onSubmit={submit} className="search-panel">
      <div className="form-row">
        <div className="field" style={{ flex: 2 }}>
          <label>Party Name (Petitioner / Respondent / Accused)</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" required />
        </div>
        <div className="field">
          <label>Filing Year</label>
          <input value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2024" type="number" min="1990" max="2026" />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>Case Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="DISPOSED">Disposed</option>
          </select>
        </div>
      </div>
      <div className="search-actions">
        <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
          {loading ? 'Searching…' : 'Search Cases'}
        </button>
        <span className="credits-badge">Madhya Pradesh District Courts</span>
      </div>
    </form>
  );
}

function CnrSearch({ onCnrLookup, loading }) {
  const [cnr, setCnr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (cnr.trim().length >= 10) onCnrLookup(cnr.trim().toUpperCase());
  };

  return (
    <form onSubmit={submit} className="search-panel">
      <div className="form-row">
        <div className="field">
          <label>CNR Number (16-character unique case ID)</label>
          <input value={cnr} onChange={e => setCnr(e.target.value)} placeholder="e.g. MPJB010012342024" required minLength={10} style={{ fontFamily: 'monospace' }} />
        </div>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Format: 4 letter court code + 6 digit case number + 4 digit year
      </p>
      <div className="search-actions">
        <button type="submit" className="btn btn-primary" disabled={loading || cnr.trim().length < 10}>
          {loading ? 'Loading…' : 'Lookup Case'}
        </button>
      </div>
    </form>
  );
}

function AdvocateSearch({ onSearch, loading }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const params = new URLSearchParams();
    params.set('advocates', name.trim());
    params.set('stateCodes', MP_STATE_CODE);
    params.set('courtLevels', 'DC');
    if (year) params.set('filingYears', year);
    params.set('pageSize', '20');
    onSearch(params.toString());
  };

  return (
    <form onSubmit={submit} className="search-panel">
      <div className="form-row">
        <div className="field" style={{ flex: 2 }}>
          <label>Advocate Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sharma" required />
        </div>
        <div className="field">
          <label>Filing Year</label>
          <input value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2024" type="number" min="1990" max="2026" />
        </div>
      </div>
      <div className="search-actions">
        <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
          {loading ? 'Searching…' : 'Search by Advocate'}
        </button>
        <span className="credits-badge">Madhya Pradesh District Courts</span>
      </div>
    </form>
  );
}

function CauseListSearch({ loading, onCauseSearch }) {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams();
    params.set('q', query.trim());
    params.set('state', MP_STATE_CODE);
    if (date) params.set('date', date);
    params.set('limit', '20');
    onCauseSearch(params.toString());
  };

  return (
    <form onSubmit={submit} className="search-panel">
      <div className="form-row">
        <div className="field" style={{ flex: 2 }}>
          <label>Search (Party name, Case number, or FIR number)</label>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. Rajesh Kumar or G.R.case/533/2023" required />
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>
      <div className="search-actions">
        <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search Cause List'}
        </button>
        <span className="credits-badge">Madhya Pradesh Courts</span>
      </div>
    </form>
  );
}

// ─── Result Cards ────────────────────────────────────────────
function CaseCard({ result, onSelect }) {
  return (
    <div className="case-card">
      <div className="case-card-top">
        <span className="case-title">{buildTitle(result.petitioners, result.respondents)}</span>
        {result.cnr && <span className="case-cnr">{result.cnr}</span>}
      </div>
      <div className="case-meta">
        {result.caseStatus && <span className={`tag ${statusClass(result.caseStatus)}`}>{result.caseStatus}</span>}
        {result.caseType && <span className="tag tag-default">{result.caseType}</span>}
      </div>
      <div className="case-details">
        <div className="detail-item"><span className="detail-label">Filed:</span><span className="detail-value">{formatDate(result.filingDate)}</span></div>
        <div className="detail-item"><span className="detail-label">Next Hearing:</span><span className="detail-value">{formatDate(result.nextHearingDate)}</span></div>
        {result.petitionerAdvocates?.[0] && <div className="detail-item"><span className="detail-label">Advocate:</span><span className="detail-value">{result.petitionerAdvocates[0]}</span></div>}
        {result.judges?.[0] && <div className="detail-item"><span className="detail-label">Judge:</span><span className="detail-value">{result.judges[0]}</span></div>}
      </div>
      {result.cnr && (
        <button className="case-link" onClick={() => onSelect(result.cnr)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          View full details →
        </button>
      )}
    </div>
  );
}

function CauseListCard({ entry }) {
  return (
    <div className="case-card">
      <div className="case-card-top">
        <span className="case-title">{entry.party || (entry.caseNumber || []).join(', ') || 'Untitled'}</span>
        <span className="case-cnr">{formatDate(entry.date)}</span>
      </div>
      <div className="case-meta">
        {entry.listType && <span className={`tag ${entry.listType === 'CRIMINAL' ? 'tag-nature-criminal' : 'tag-nature-civil'}`}>{entry.listType}</span>}
        {entry.status && <span className="tag tag-default">{entry.status}</span>}
      </div>
      <div className="case-details">
        {entry.caseNumber?.[0] && <div className="detail-item"><span className="detail-label">Case:</span><span className="detail-value">{entry.caseNumber[0]}</span></div>}
        {entry.judge?.[0] && <div className="detail-item"><span className="detail-label">Judge:</span><span className="detail-value">{entry.judge[0]}</span></div>}
        {entry.courtName && <div className="detail-item"><span className="detail-label">Court:</span><span className="detail-value">{entry.courtName}</span></div>}
        {entry.district && <div className="detail-item"><span className="detail-label">District:</span><span className="detail-value">{entry.district}</span></div>}
      </div>
      {entry.cnr && (
        <a className="case-link" href={`https://ecourtsindia.com/cnr/${entry.cnr}`} target="_blank" rel="noopener noreferrer">
          View on eCourtsIndia →
        </a>
      )}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState('party');
  const [results, setResults] = useState(null);
  const [causeResults, setCauseResults] = useState(null);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCnr, setSelectedCnr] = useState(null);
  const [page, setPage] = useState(1);
  const [lastQuery, setLastQuery] = useState('');

  const doSearch = useCallback(async (qs, pageNum = 1) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setCauseResults(null);
    setSelectedCnr(null);
    setPage(pageNum);
    setLastQuery(qs);

    try {
      const sep = qs.includes('?') ? '&' : '?';
      const paged = `${qs}&page=${pageNum}`;
      const res = await fetch(`/api/search?${paged}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Search failed');
      setResults(json.data?.results || []);
      setTotalHits(json.data?.totalHits || 0);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const doCauseSearch = useCallback(async (qs) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setCauseResults(null);
    setSelectedCnr(null);

    try {
      const res = await fetch(`/api/causelist?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Search failed');
      setCauseResults(json.data?.results || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const doCnrLookup = useCallback((cnr) => {
    setResults(null);
    setCauseResults(null);
    setError(null);
    setSelectedCnr(cnr);
  }, []);

  const totalPages = Math.ceil(totalHits / 20);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div>
            <h1>MP District Courts — Case Search</h1>
            <p>Search Madhya Pradesh district court records</p>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingBottom: 40 }}>
        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => { setTab(t.id); setResults(null); setCauseResults(null); setError(null); setSelectedCnr(null); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'party' && <PartySearch onSearch={doSearch} loading={loading} />}
        {tab === 'cnr' && <CnrSearch onCnrLookup={doCnrLookup} loading={loading} />}
        {tab === 'advocate' && <AdvocateSearch onSearch={doSearch} loading={loading} />}
        {tab === 'causelist' && <CauseListSearch onCauseSearch={doCauseSearch} loading={loading} />}

        {loading && <div className="loading"><div className="spinner" />Searching court records…</div>}
        {error && <div className="error-box">{error}</div>}

        {selectedCnr && !loading && (
          <CaseDetail
            cnr={selectedCnr}
            onBack={() => setSelectedCnr(null)}
          />
        )}

        {results && !selectedCnr && !loading && (
          <>
            <div className="results-header">
              <h2>Results</h2>
              <span className="results-count">{totalHits.toLocaleString()} case{totalHits !== 1 ? 's' : ''} found</span>
            </div>
            {results.length === 0 ? (
              <div className="empty-state">
                <p>No cases found</p>
                <span>Try a different name or broader search criteria.</span>
              </div>
            ) : (
              <>
                {results.map((r, i) => <CaseCard key={r.cnr || i} result={r} onSelect={doCnrLookup} />)}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button disabled={page <= 1} onClick={() => doSearch(lastQuery, page - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => doSearch(lastQuery, page + 1)}>Next</button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {causeResults && !loading && (
          <>
            <div className="results-header">
              <h2>Cause List Results</h2>
              <span className="results-count">{causeResults.length} entries</span>
            </div>
            {causeResults.length === 0 ? (
              <div className="empty-state">
                <p>No cause list entries found</p>
                <span>Try a different date or search term.</span>
              </div>
            ) : (
              causeResults.map((entry, i) => <CauseListCard key={entry.id || i} entry={entry} />)
            )}
          </>
        )}

        {!results && !causeResults && !selectedCnr && !loading && !error && (
          <div className="empty-state" style={{ marginTop: 48 }}>
            <p>Search MP district court records</p>
            <span>Look up cases by party name, CNR number, advocate, or cause list.</span>
          </div>
        )}
      </main>

      <footer className="footer">
        Data from <a href="https://ecourtsindia.com" target="_blank" rel="noopener noreferrer">eCourtsIndia.com</a> · Filtered to Madhya Pradesh District Courts
      </footer>
    </>
  );
}
