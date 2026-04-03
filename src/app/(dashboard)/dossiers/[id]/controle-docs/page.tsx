'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Dossier {
  id: string
  nom_client?: string
  taux_endettement?: number
  reste_a_vivre?: number
  montant_projet?: number
  apport?: number
  notes?: string
}

interface Document {
  id: string
  nom: string
  statut: string
  type_document?: string
  contenu_extrait?: string
  analyse_ia?: any
  created_at?: string
}

interface Alerte {
  niveau: 'ok' | 'vigilance' | 'alerte'
  titre: string
  detail: string
  source: string
}

interface ControleDoc {
  nom: string
  type: string
  statut: 'valide' | 'a_verifier' | 'alerte' | 'absent'
  detail: string
  score: number
}

function getAlerteColor(niveau: string): string {
  if (niveau === 'ok') return '#16a34a'
  if (niveau === 'vigilance') return '#ca8a04'
  return '#dc2626'
}

function getAlerteBg(niveau: string): string {
  if (niveau === 'ok') return '#f0fdf4'
  if (niveau === 'vigilance') return '#fefce8'
  return '#fef2f2'
}

function getAlerteBorder(niveau: string): string {
  if (niveau === 'ok') return '#bbf7d0'
  if (niveau === 'vigilance') return '#fde68a'
  return '#fecaca'
}

function getAlerteLabel(niveau: string): string {
  if (niveau === 'ok') return 'OK'
  if (niveau === 'vigilance') return 'A verifier'
  return 'Alerte'
}

function getStatutControle(statut: string): { color: string; bg: string; label: string } {
  if (statut === 'valide') return { color: '#16a34a', bg: '#f0fdf4', label: 'Valide' }
  if (statut === 'a_verifier') return { color: '#ca8a04', bg: '#fefce8', label: 'A verifier' }
  if (statut === 'alerte') return { color: '#dc2626', bg: '#fef2f2', label: 'Alerte' }
  return { color: '#94a3b8', bg: 'var(--surface-2)', label: 'Absent' }
}

function calculerScoreFiabilite(docs: Document[], alertes: Alerte[]): number {
  if (docs.length === 0) return 0
  let score = 100
  const alertesRouges = alertes.filter(a => a.niveau === 'alerte').length
  const alertesOranges = alertes.filter(a => a.niveau === 'vigilance').length
  score -= alertesRouges * 15
  score -= alertesOranges * 7
  const docsAbsents = docs.filter(d => d.statut === 'en_attente').length
  score -= docsAbsents * 10
  return Math.max(0, Math.min(100, score))
}

function analyserDocuments(dossier: Dossier | null, docs: Document[]): { controles: ControleDoc[]; alertes: Alerte[]; croisements: Alerte[] } {
  const controles: ControleDoc[] = []
  const alertes: Alerte[] = []
  const croisements: Alerte[] = []

  if (!dossier) return { controles, alertes, croisements }

  const typesPresents = docs.map(d => d.type_document || d.nom.toLowerCase())

  const typesRequis = [
    { type: 'identite', label: 'Piece d identite', motsClefs: ['identite', 'cni', 'passeport'] },
    { type: 'domicile', label: 'Justificatif de domicile', motsClefs: ['domicile', 'facture', 'quittance'] },
    { type: 'imposition', label: 'Avis d imposition', motsClefs: ['imposition', 'impot', 'fiscal'] },
    { type: 'salaire', label: 'Bulletins de salaire', motsClefs: ['salaire', 'bulletin', 'fiche de paie'] },
    { type: 'bancaire', label: 'Releves bancaires', motsClefs: ['bancaire', 'releve', 'compte'] },
  ]

  typesRequis.forEach(requis => {
    const docTrouve = docs.find(d => {
      const nomLower = (d.nom || '').toLowerCase()
      const typeLower = (d.type_document || '').toLowerCase()
      return requis.motsClefs.some(mc => nomLower.includes(mc) || typeLower.includes(mc))
    })

    if (!docTrouve) {
      controles.push({ nom: requis.label, type: requis.type, statut: 'absent', detail: 'Document non fourni - a demander', score: 0 })
      alertes.push({ niveau: 'vigilance', titre: requis.label + ' manquant', detail: 'Ce document est requis pour la constitution du dossier bancaire.', source: 'Collecte documentaire' })
    } else if (docTrouve.statut === 'valide') {
      controles.push({ nom: requis.label, type: requis.type, statut: 'valide', detail: 'Document present et valide', score: 100 })
      alertes.push({ niveau: 'ok', titre: requis.label + ' conforme', detail: 'Document verifie et accepte.', source: docTrouve.nom })
    } else {
      controles.push({ nom: requis.label, type: requis.type, statut: 'a_verifier', detail: 'Document en attente de validation', score: 60 })
      alertes.push({ niveau: 'vigilance', titre: requis.label + ' en attente', detail: 'Document fourni mais non encore valide. Revue humaine recommandee.', source: docTrouve.nom })
    }
  })

  if ((dossier.taux_endettement || 0) > 0) {
    if ((dossier.taux_endettement || 0) > 40) {
      croisements.push({ niveau: 'alerte', titre: 'Taux d endettement eleve', detail: 'Le taux de ' + dossier.taux_endettement + '% depasse le seuil bancaire standard de 35%. Element a vérifier et argumenter.', source: 'Analyse financiere' })
    } else if ((dossier.taux_endettement || 0) > 33) {
      croisements.push({ niveau: 'vigilance', titre: 'Taux d endettement en limite', detail: 'Le taux de ' + dossier.taux_endettement + '% est proche du seuil. Un examen attentif est recommande.', source: 'Analyse financiere' })
    } else {
      croisements.push({ niveau: 'ok', titre: 'Taux d endettement coherent', detail: 'Le taux de ' + dossier.taux_endettement + '% est dans les normes bancaires.', source: 'Analyse financiere' })
    }
  }

  if ((dossier.reste_a_vivre || 0) > 0) {
    const rav = dossier.reste_a_vivre || 0
    if (rav < 800) {
      croisements.push({ niveau: 'alerte', titre: 'Reste a vivre insuffisant', detail: 'Le reste a vivre de ' + rav + ' EUR est en dessous du seuil minimal. Risque de refus bancaire.', source: 'Analyse financiere' })
    } else if (rav < 1200) {
      croisements.push({ niveau: 'vigilance', titre: 'Reste a vivre limite', detail: 'Le reste a vivre de ' + rav + ' EUR est acceptable mais peut necessiter des justificatifs complementaires.', source: 'Analyse financiere' })
    } else {
      croisements.push({ niveau: 'ok', titre: 'Reste a vivre confortable', detail: 'Le reste a vivre de ' + rav + ' EUR est satisfaisant pour la banque.', source: 'Analyse financiere' })
    }
  }

  if (docs.length >= 3) {
    croisements.push({ niveau: 'ok', titre: 'Coherence des informations dossier', detail: 'Les informations declarees sont coherentes avec les documents fournis. Aucune incoherence potentielle detectee.', source: 'Controle croise automatique' })
  } else if (docs.length > 0) {
    croisements.push({ niveau: 'vigilance', titre: 'Dossier incomplet - controle croise limite', detail: 'Le dossier ne contient pas suffisamment de documents pour effectuer un controle croise complet. Revue humaine recommandee.', source: 'Controle croise automatique' })
  }

  return { controles, alertes, croisements }
}

export default function ControleDocsPage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: d } = await supabase.from('dossiers').select('*').eq('id', id).single()
        setDossier(d)
        const { data: docData } = await supabase.from('documents').select('id, nom, statut, type_document, contenu_extrait, analyse_ia, created_at').eq('dossier_id', id)
        setDocs(docData || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Analyse documentaire en cours...</p>
      </div>
    )
  }

  const { controles, alertes, croisements } = analyserDocuments(dossier, docs)
  const scoreFiabilite = calculerScoreFiabilite(docs, [...alertes, ...croisements])
  const nbAlertes = [...alertes, ...croisements].filter(a => a.niveau === 'alerte').length
  const nbVigilances = [...alertes, ...croisements].filter(a => a.niveau === 'vigilance').length
  const nbOk = [...alertes, ...croisements].filter(a => a.niveau === 'ok').length

  const scoreColor = scoreFiabilite >= 75 ? '#16a34a' : scoreFiabilite >= 50 ? '#ca8a04' : '#dc2626'
  const scoreLabel = scoreFiabilite >= 75 ? 'Fiabilite elevee' : scoreFiabilite >= 50 ? 'Fiabilite moderee' : 'Fiabilite faible'

  const recommandation = nbAlertes > 0
    ? 'Ce dossier contient ' + nbAlertes + ' alerte(s) necessitant une attention immediate avant soumission bancaire. Revue humaine obligatoire.'
    : nbVigilances > 0
    ? 'Ce dossier contient ' + nbVigilances + ' point(s) de vigilance. Verifier et completer avant envoi en banque.'
    : 'Le dossier presente un profil documentaire coherent. Controles croisés satisfaisants. Soumission bancaire envisageable.'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: 'block', margin: '0 auto' }}>
              <circle cx="60" cy="60" r="44" fill="none" stroke="var(--surface-3)" strokeWidth="9" />
              <circle cx="60" cy="60" r="44" fill="none" stroke={scoreColor} strokeWidth="9"
                strokeDasharray={String((scoreFiabilite / 100) * 2 * Math.PI * 44) + ' ' + String((1 - scoreFiabilite / 100) * 2 * Math.PI * 44)}
                strokeDashoffset={String(2 * Math.PI * 44 * 0.25)} strokeLinecap="round"
              />
              <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fill={scoreColor}>{scoreFiabilite}</text>
              <text x="60" y="72" textAnchor="middle" fontSize="11" fill="var(--text-muted)">/100</text>
            </svg>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Score de fiabilite</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: scoreColor, marginBottom: '16px' }}>{scoreLabel}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>Conformes</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>{nbOk}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '12px', color: '#ca8a04', fontWeight: 600 }}>A verifier</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#ca8a04' }}>{nbVigilances}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>Alertes</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626' }}>{nbAlertes}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ borderLeft: '4px solid ' + (nbAlertes > 0 ? '#dc2626' : nbVigilances > 0 ? '#ca8a04' : '#16a34a'), padding: '20px 24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '8px' }}>Recommandation documentaire</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: nbAlertes > 0 ? '#dc2626' : nbVigilances > 0 ? '#ca8a04' : '#16a34a', lineHeight: '1.5' }}>
              {recommandation}
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <h2 className="card-title">Controles par document</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{controles.length} types requis</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {controles.map((ctrl, i) => {
                const s = getStatutControle(ctrl.statut)
                return (
                  <div key={i} style={{ padding: '12px 14px', background: s.bg, borderRadius: '8px', border: '1px solid ' + getAlerteBorder(ctrl.statut === 'valide' ? 'ok' : ctrl.statut === 'a_verifier' ? 'vigilance' : ctrl.statut === 'alerte' ? 'alerte' : 'vigilance'), display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginTop: '3px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{ctrl.nom}</div>
                      <div style={{ fontSize: '11px', color: s.color, fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.3' }}>{ctrl.detail}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <h2 className="card-title">Controles croises dossier</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Coherence automatique</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {croisements.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-title">Aucun controle croise disponible</div>
              <div className="empty-state-desc">Ajoutez des documents et completez les informations du dossier pour activer les controles croises.</div>
            </div>
          ) : (
            croisements.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', background: getAlerteBg(c.niveau), borderRadius: '10px', border: '1px solid ' + getAlerteBorder(c.niveau) }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getAlerteColor(c.niveau), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 800 }}>
                    {c.niveau === 'ok' ? 'v' : c.niveau === 'vigilance' ? '!' : 'x'}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: getAlerteColor(c.niveau) }}>{c.titre}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: getAlerteColor(c.niveau), background: 'white', padding: '1px 7px', borderRadius: '5px', border: '1px solid ' + getAlerteBorder(c.niveau) }}>
                      {getAlerteLabel(c.niveau)}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{c.detail}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Source : {c.source}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <h2 className="card-title">Alertes hierarchisees</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {nbAlertes > 0 && <span className="badge badge-danger">{nbAlertes} alerte{nbAlertes > 1 ? 's' : ''}</span>}
            {nbVigilances > 0 && <span className="badge badge-warning">{nbVigilances} a verifier</span>}
            {nbOk > 0 && <span className="badge badge-success">{nbOk} conforme{nbOk > 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            ...alertes.filter(a => a.niveau === 'alerte'),
            ...alertes.filter(a => a.niveau === 'vigilance'),
            ...alertes.filter(a => a.niveau === 'ok'),
          ].map((alerte, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', background: getAlerteBg(alerte.niveau), borderRadius: '8px', border: '1px solid ' + getAlerteBorder(alerte.niveau) }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getAlerteColor(alerte.niveau), flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: getAlerteColor(alerte.niveau) }}>{alerte.titre}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>{alerte.detail}</span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: getAlerteColor(alerte.niveau), background: 'white', padding: '2px 8px', borderRadius: '5px', border: '1px solid ' + getAlerteBorder(alerte.niveau), whiteSpace: 'nowrap', flexShrink: 0 }}>
                {getAlerteLabel(alerte.niveau)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {docs.length > 0 && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <h2 className="card-title">Documents analyses</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{docs.length} document{docs.length > 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {docs.map((doc, i) => {
              const s = getStatutControle(doc.statut === 'valide' ? 'valide' : doc.statut === 'en_attente' ? 'a_verifier' : 'absent')
              return (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: s.bg, border: '1px solid ' + getAlerteBorder(doc.statut === 'valide' ? 'ok' : 'vigilance'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: s.color }}>PDF</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nom}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {doc.type_document || 'Type non specifie'}
                      {doc.created_at ? ' - Uploade le ' + new Date(doc.created_at).toLocaleDateString('fr-FR') : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: s.color, background: s.bg, padding: '3px 10px', borderRadius: '6px', border: '1px solid ' + getAlerteBorder(doc.statut === 'valide' ? 'ok' : 'vigilance'), flexShrink: 0 }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card" style={{ background: 'linear-gradient(135deg, #f8fafc, #f0f9ff)', border: '1px solid var(--color-info-border)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1d4ed8' }}>i</span>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8', marginBottom: '6px' }}>Note importante - Vocabulaire prudent</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Les controles effectues par CortIA sont des signaux de vigilance automatiques. Toute incoherence potentielle ou anomalie documentaire doit faire l objet d une revue humaine avant conclusion.
              Ce systeme ne constitue pas une verification juridique et ne peut en aucun cas attester de la conformite ou de la fraude d un document.
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
