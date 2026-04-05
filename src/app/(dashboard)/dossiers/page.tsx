'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DossierRow {
  id: string
  reference?: string
  statut: string
  updated_at?: string
  created_at?: string
  // Derived from joins
  nom_client: string
  email_client: string
  score_global: number
  montant_projet: number
  besoin_financement: number
  taux_endettement: number
  niveau_risque: string
  type_contrat: string
}

const STATUTS = ['', 'nouveau', 'en_attente', 'en_cours', 'analyse', 'soumis', 'accepte', 'accorde', 'refuse', 'archive']
const STATUT_LABELS: Record<string, string> = {
  '': 'Tous les statuts',
  nouveau: 'Nouveau',
  en_attente: 'En attente',
  en_cours: 'En cours',
  analyse: 'Analyse',
  soumis: 'Soumis',
  accepte: 'Accepté',
  accorde: 'Accordé',
  refuse: 'Refusé',
  archive: 'Archivé',
}

const STATUT_CLASSES: Record<string, string> = {
  nouveau: 'badge-blue',
  en_attente: 'badge-warning',
  en_cours: 'badge-info',
  analyse: 'badge-purple',
  soumis: 'badge-blue',
  accepte: 'badge-success',
  accorde: 'badge-success',
  refuse: 'badge-danger',
  archive: 'badge-neutral',
}

const RISQUES = ['', 'faible', 'moyen', 'eleve', 'non_calcule']
const RISQUE_LABELS: Record<string, string> = {
  '': 'Tous les risques',
  faible: 'Faible',
  moyen: 'Moyen',
  eleve: 'Élevé',
  non_calcule: 'Non calculé',
}

function getScoreColor(score?: number) {
  if (!score) return '#94a3b8'
  if (score >= 75) return '#16a34a'
  if (score >= 55) return '#0ea5e9'
  if (score >= 40) return '#ca8a04'
  return '#dc2626'
}

function getRiskLevel(score: number): string {
  if (score === 0) return 'non_calcule'
  if (score >= 75) return 'faible'
  if (score >= 55) return 'moyen'
  return 'eleve'
}

function getRiskLabel(risk: string): string {
  const m: Record<string, string> = {
    faible: 'Faible', moyen: 'Moyen', eleve: 'Élevé', non_calcule: 'non_calculé'
  }
  return m[risk] || risk
}

function getRiskDot(risk: string): string {
  const m: Record<string, string> = {
    faible: '#16a34a', moyen: '#ca8a04', eleve: '#dc2626', non_calcule: '#94a3b8'
  }
  return m[risk] || '#94a3b8'
}

function formatCurrency(amount?: number) {
  if (!amount) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function DossiersPage() {
  const supabase = createClient()
  const router = useRouter()
  const [dossiers, setDossiers] = useState<DossierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterRisque, setFilterRisque] = useState('')
  const [sortField, setSortField] = useState<string>('updated_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const load = async () => {
      try {
        // Load base dossiers
        const { data: rawDossiers } = await supabase
          .from('dossiers')
          .select('id, reference, statut, updated_at, created_at')
          .order('updated_at', { ascending: false })

        if (!rawDossiers || rawDossiers.length === 0) {
          setDossiers([])
          setLoading(false)
          return
        }

        const ids = rawDossiers.map(d => d.id)

        // Load related data in parallel
        const [empRes, projRes, anaRes] = await Promise.all([
          supabase.from('emprunteurs').select('dossier_id, prenom, nom, email, est_co_emprunteur, type_contrat').in('dossier_id', ids),
          supabase.from('projets').select('dossier_id, prix_bien, montant_emprunt').in('dossier_id', ids),
          supabase.from('analyses_financieres').select('dossier_id, score_global, taux_endettement_projet').in('dossier_id', ids),
        ])

        const empMap = new Map<string, any>()
        ;(empRes.data || []).forEach(e => {
          if (!e.est_co_emprunteur || !empMap.has(e.dossier_id)) {
            empMap.set(e.dossier_id, e)
          }
        })

        const projMap = new Map<string, any>()
        ;(projRes.data || []).forEach(p => projMap.set(p.dossier_id, p))

        const anaMap = new Map<string, any>()
        ;(anaRes.data || []).forEach(a => anaMap.set(a.dossier_id, a))

        const enriched: DossierRow[] = rawDossiers.map(d => {
          const emp = empMap.get(d.id)
          const proj = projMap.get(d.id)
          const ana = anaMap.get(d.id)

          const score = ana?.score_global || 0
          return {
            id: d.id,
            reference: d.reference,
            statut: d.statut,
            updated_at: d.updated_at,
            created_at: d.created_at,
            nom_client: emp ? (emp.prenom + ' ' + emp.nom) : '',
            email_client: emp?.email || '',
            score_global: score,
            montant_projet: proj?.prix_bien || 0,
            besoin_financement: proj?.montant_emprunt || 0,
            taux_endettement: ana?.taux_endettement_projet || 0,
            niveau_risque: getRiskLevel(score),
            type_contrat: emp?.type_contrat || '',
          }
        })

        setDossiers(enriched)
      } catch (e) {
        console.error('Erreur chargement dossiers:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const filtered = dossiers.filter(d => {
    const matchSearch = !search ||
      d.nom_client.toLowerCase().includes(search.toLowerCase()) ||
      (d.reference || '').toLowerCase().includes(search.toLowerCase()) ||
      d.email_client.toLowerCase().includes(search.toLowerCase())
    const matchStatut = !filterStatut || d.statut === filterStatut
    const matchRisque = !filterRisque || d.niveau_risque === filterRisque
    return matchSearch && matchStatut && matchRisque
  }).sort((a, b) => {
    let va: any = (a as any)[sortField] || ''
    let vb: any = (b as any)[sortField] || ''
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const sortIndicator = (field: string) => sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dossiers</h1>
          <p className="page-subtitle">{dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/dossiers/nouveau" className="btn-primary">+ Nouveau dossier</Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Rechercher un client, référence..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
          />
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>⌕</span>
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: '150px' }}>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s] || s}</option>)}
        </select>
        <select value={filterRisque} onChange={e => setFilterRisque(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: '150px' }}>
          {RISQUES.map(r => <option key={r} value={r}>{RISQUE_LABELS[r] || r}</option>)}
        </select>
        {(search || filterStatut || filterRisque) && (
          <button onClick={() => { setSearch(''); setFilterStatut(''); setFilterRisque('') }}
            style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--border-primary)', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Effacer
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /><p>Chargement...</p></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{dossiers.length === 0 ? 'Aucun dossier' : 'Aucun résultat'}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {dossiers.length === 0 ? 'Créez votre premier dossier pour démarrer.' : 'Modifiez vos filtres de recherche.'}
            </p>
            {dossiers.length === 0 && (
              <Link href="/dossiers/nouveau" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Créer un dossier</Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('reference')} style={{ cursor: 'pointer' }}>Référence{sortIndicator('reference')}</th>
                <th onClick={() => handleSort('nom_client')} style={{ cursor: 'pointer' }}>Client{sortIndicator('nom_client')}</th>
                <th>Projet</th>
                <th>Financement</th>
                <th onClick={() => handleSort('score_global')} style={{ cursor: 'pointer' }}>Score{sortIndicator('score_global')}</th>
                <th onClick={() => handleSort('taux_endettement')} style={{ cursor: 'pointer' }}>Endettement{sortIndicator('taux_endettement')}</th>
                <th>Risque</th>
                <th onClick={() => handleSort('statut')} style={{ cursor: 'pointer' }}>Statut{sortIndicator('statut')}</th>
                <th onClick={() => handleSort('updated_at')} style={{ cursor: 'pointer' }}>Modifié{sortIndicator('updated_at')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} onClick={() => router.push('/dossiers/' + d.id)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {d.reference || d.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.nom_client || '—'}</div>
                    {d.email_client && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.email_client}</div>}
                  </td>
                  <td style={{ fontWeight: 500 }}>{d.montant_projet > 0 ? formatCurrency(d.montant_projet) : '—'}</td>
                  <td>{d.besoin_financement > 0 ? formatCurrency(d.besoin_financement) : '—'}</td>
                  <td>
                    {d.score_global > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '2rem', height: '2rem', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: getScoreColor(d.score_global) + '20',
                          border: '2px solid ' + getScoreColor(d.score_global),
                          fontSize: '0.65rem', fontWeight: 800, color: getScoreColor(d.score_global)
                        }}>{d.score_global}</div>
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    {d.taux_endettement > 0 ? (
                      <span style={{ fontWeight: 600, color: d.taux_endettement > 35 ? '#dc2626' : 'var(--text-secondary)' }}>
                        {d.taux_endettement.toFixed(1)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getRiskDot(d.niveau_risque) }} />
                      {getRiskLabel(d.niveau_risque)}
                    </span>
                  </td>
                  <td><span className={'badge ' + (STATUT_CLASSES[d.statut] || 'badge-neutral')}>{STATUT_LABELS[d.statut] || d.statut}</span></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(d.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
