'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const SECTIONS = [
  { id: 'presentation', label: '1. Presentation client' },
  { id: 'situation_pro', label: '2. Situation professionnelle' },
  { id: 'situation_financiere', label: '3. Situation financiere' },
  { id: 'projet', label: '4. Presentation du projet' },
  { id: 'atouts', label: '5. Atouts du dossier' },
  { id: 'vigilance', label: '6. Points de vigilance' },
  { id: 'conclusion', label: '7. Conclusion courtier' },
]

function fmt(v?: number) {
  if (!v && v !== 0) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

function genererNote(data: any): Record<string, string> {
  const { emprunteurs, projet, analyse, charges } = data
  const emp = emprunteurs?.[0]
  const coEmp = emprunteurs?.[1]
  const revenus = emprunteurs?.reduce((s: number, e: any) => s + (e.salaire_net_mensuel || 0) + (e.autres_revenus || 0) + (e.revenus_locatifs || 0), 0) || 0
  const chargesEmp = emprunteurs?.reduce((s: number, e: any) => s + (e.credits_en_cours || 0) + (e.pension_versee || 0), 0) || 0
  const chargesSupp = charges?.reduce((s: number, c: any) => s + (c.mensualite || 0), 0) || 0
  const chargesTotal = chargesEmp + chargesSupp
  const taux = revenus > 0 ? (chargesTotal / revenus) * 100 : 0
  const apportPct = projet?.prix_bien > 0 ? ((projet.apport || 0) / projet.prix_bien) * 100 : 0
  const typeContrat = emp?.type_contrat || 'CDI'
  const isStable = typeContrat === 'CDI' || typeContrat === 'Fonctionnaire'
  const isTNS = typeContrat === 'Independant' || typeContrat === 'Liberal' || typeContrat === 'Gerant'
  const atoutsList: string[] = []
  if (apportPct >= 15) atoutsList.push('Apport solide (' + apportPct.toFixed(0) + '%).')
  else if (apportPct >= 10) atoutsList.push('Apport correct (' + apportPct.toFixed(0) + '%).')
  if (typeContrat === 'CDI') atoutsList.push('Stabilite CDI confirmee.')
  if (typeContrat === 'Fonctionnaire') atoutsList.push('Emploi fonctionnaire garanti.')
  if (taux <= 30) atoutsList.push('Endettement tres confortable.')
  else if (taux <= 33) atoutsList.push('Endettement maitrise.')
  if (coEmp) atoutsList.push('Co-emprunt renforçant la solidite.')
  if ((analyse?.score_global || 0) >= 75) atoutsList.push('Score CortIA: ' + analyse.score_global + '/100.')
  const vigilanceList: string[] = []
  if (taux > 35) vigilanceList.push('Taux d endettement > 35% (' + taux.toFixed(1) + '%).')
  if (apportPct < 10) vigilanceList.push('Apport < 10% (' + apportPct.toFixed(0) + '%).')
  if (typeContrat === 'CDD') vigilanceList.push('CDD: stabilite a confirmer.')
  if (isTNS) vigilanceList.push('TNS: bilans 3 derniers exercices requis.')
  return {
    presentation: (emp ? emp.prenom + ' ' + emp.nom : 'Emprunteur') + (coEmp ? ' et ' + coEmp.prenom + ' ' + coEmp.nom : '') + '. ' + (isStable ? 'Salarie ' : 'Profil ') + typeContrat + (emp?.employeur ? ' chez ' + emp.employeur : '') + '. Revenus: ' + fmt(revenus) + '/mois.',
    situation_pro: 'Contrat ' + typeContrat + (emp?.employeur ? ' chez ' + emp.employeur : '') + '. ' + (typeContrat === 'CDI' ? 'Poste stable a duree indeterminee.' : typeContrat === 'Fonctionnaire' ? 'Fonction publique, revenu garanti.' : typeContrat === 'CDD' ? 'CDD - anciennete et renouvellement a verifier.' : isTNS ? 'Activite non salariee - bilans 3 derniers exercices requis.' : 'A preciser.'),
    situation_financiere: 'Revenus nets: ' + fmt(revenus) + '/mois. Charges: ' + fmt(chargesTotal) + '/mois. Taux endettement: ' + taux.toFixed(1) + '%. ' + (taux <= 33 ? 'Dans les normes bancaires.' : taux <= 38 ? 'Limite haute - validation requise.' : 'Superieur aux normes - optimisation recommandee.'),
    projet: (projet?.type_bien || 'Bien') + ' - ' + (projet?.usage || 'residence principale') + (projet?.ville ? ' a ' + projet.ville : '') + (projet?.surface ? ' ' + projet.surface + 'm2' : '') + '. Prix: ' + fmt(projet?.prix_bien) + '. Financement: ' + fmt(projet?.besoin_financement || ((projet?.prix_bien || 0) - (projet?.apport || 0))) + ' sur ' + (projet?.duree_souhaitee || 20) + ' ans.',
    atouts: atoutsList.length > 0 ? atoutsList.join(' ') : 'Profil standard a evaluer.',
    vigilance: vigilanceList.length > 0 ? vigilanceList.join(' ') : 'Aucun point majeur identifie.',
    conclusion: (analyse?.lecture_metier ? analyse.lecture_metier + ' ' : '') + 'Dossier ' + (taux <= 33 && apportPct >= 10 ? 'solide - recommande pour presentation.' : taux <= 38 ? 'acceptable - attention aux points de vigilance.' : 'a consolider avant presentation.'),
  }
}

export default function SynthesePage() {
  const params = useParams()
  const dossierId = params.id as string
  const [data, setData] = useState<any>({ emprunteurs: [], projet: null, analyse: null, charges: [] })
  const [sections, setSections] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [iaSource, setIaSource] = useState(false)
  const [active, setActive] = useState('presentation')
  useEffect(() => { loadData() }, [dossierId])
  async function loadData() {
    setLoading(true)
    try {
      const [e, p, a, c] = await Promise.all([
        fetch('/api/dossiers/' + dossierId + '/emprunteurs').then(r => r.ok ? r.json() : []),
        fetch('/api/dossiers/' + dossierId + '/projet').then(r => r.ok ? r.json() : null),
        fetch('/api/dossiers/' + dossierId + '/analyse').then(r => r.ok ? r.json() : null),
        fetch('/api/dossiers/' + dossierId + '/charges').then(r => r.ok ? r.json() : []),
      ])
      const d = { emprunteurs: Array.isArray(e) ? e : [], projet: p, analyse: a, charges: Array.isArray(c) ? c : [] }
      setData(d)
      setSections(genererNote(d))
    } catch (err) {}
    setLoading(false)
  }
  async function enrichirIA() {
    if (!data.emprunteurs.length) return
    setGenerating(true)
    try {
      const res = await fetch('/api/analyse-ia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dossier_id: dossierId, context: data }) })
      if (res.ok) {
        const result = await res.json()
        if (result.synthese) {
          const raw = result.synthese as string
          const updated: Record<string, string> = {}
          SECTIONS.forEach(s => {
            const lbl = s.label.replace(/^\d+\.\s*/, '')
            const idx = raw.indexOf(lbl)
            if (idx >= 0) {
              const rest = raw.substring(idx + lbl.length)
              const nxt = rest.indexOf('##')
              updated[s.id] = rest.substring(0, nxt > 0 ? nxt : undefined).replace(/^[:\n\r]+/, '').trim()
            }
          })
          if (Object.keys(updated).length > 0) { setSections(prev => ({ ...prev, ...updated })); setIaSource(true) }
        }
      }
    } catch (err) {}
    setGenerating(false)
  }
  function buildNote() { return SECTIONS.map(s => '## ' + s.label + '\n\n' + (sections[s.id] || '')).join('\n\n') }
  function copier() { navigator.clipboard.writeText(buildNote()); setCopied(true); setTimeout(() => setCopied(false), 2500) }
  if (loading) return <div className='page-container'><div className='loading-container'><div className='loading-spinner' /><p>Preparation synthese...</p></div></div>
  const emp = data.emprunteurs?.[0]
  return (
    <div className='page-container'>
      <div className='page-header' style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 className='page-title'>Note de synthese bancaire</h2>
            <p className='page-subtitle'>{iaSource ? 'Enrichie par IA' : 'Generee automatiquement'}{emp ? ' - ' + emp.prenom + ' ' + emp.nom : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={enrichirIA} disabled={generating || !data.emprunteurs.length} style={{ background: generating || !data.emprunteurs.length ? '#f1f5f9' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: generating || !data.emprunteurs.length ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              {generating ? 'Generation...' : '✨ Enrichir IA'}
            </button>
            <button onClick={copier} className='btn-primary'>{copied ? '✓ Copie!' : '📋 Copier'}</button>
          </div>
        </div>
      </div>
      {!data.emprunteurs.length && <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', fontSize: '14px', color: '#92400e' }}>⚠️ Ajoutez les emprunteurs et le projet pour une synthese complete.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: '20px', alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: '20px' }}>
          <div className='card' style={{ padding: '6px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 8px 2px' }}>Sections</div>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => { setActive(s.id); document.getElementById('s-' + s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 9px', fontSize: '12px', fontWeight: active === s.id ? 600 : 400, color: active === s.id ? '#1d4ed8' : '#475569', background: active === s.id ? '#eff6ff' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', borderLeft: active === s.id ? '3px solid #2563eb' : '3px solid transparent' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          {SECTIONS.map(s => (
            <div key={s.id} id={'s-' + s.id} className='card' style={{ marginBottom: '14px', scrollMarginTop: '20px' }} onClick={() => setActive(s.id)}>
              <div className='card-header' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className='card-title' style={{ color: active === s.id ? '#1d4ed8' : '#1e293b' }}>{s.label}</h3>
                {iaSource && <span style={{ fontSize: '10px', background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>IA</span>}
              </div>
              {sections[s.id] ? <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.75' }}>{sections[s.id]}</p> : <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Section vide.</p>}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>CortIA V2.5 - {new Date().toLocaleDateString('fr-FR')}</span>
            <button onClick={copier} className='btn-primary'>{copied ? '✓ Copie!' : '📋 Copier note complete'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
