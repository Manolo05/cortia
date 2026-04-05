'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Emprunteur {
  id: string
  prenom: string
  nom: string
  est_co_emprunteur: boolean
  civilite?: string
  date_naissance?: string
  situation_familiale?: string
  nb_enfants_charge?: number
  type_contrat?: string
  employeur?: string
  anciennete_emploi?: number
  salaire_net_mensuel?: number
  autres_revenus?: number
  revenus_locatifs?: number
  loyer_actuel?: number
  credits_en_cours?: number
  pension_versee?: number
  autres_charges?: number
  epargne?: number
  valeur_patrimoine_immo?: number
  email?: string
  telephone?: string
  adresse?: string
  code_postal?: string
  ville?: string
  nationalite?: string
}

interface Projet {
  id: string
  type_operation: string
  usage_bien: string
  adresse_bien?: string
  code_postal_bien?: string
  ville_bien?: string
  surface_bien?: number
  prix_bien: number
  montant_travaux?: number
  apport_personnel: number
  montant_emprunt: number
  duree_souhaitee: number
  taux_interet_cible?: number
  taux_assurance?: number
}

interface Analyse {
  score_global: number
  score_revenus: number
  score_stabilite: number
  score_endettement: number
  score_apport: number
  score_patrimoine: number
  revenus_nets_mensuels_total: number
  charges_mensuelles_total: number
  reste_a_vivre: number
  taux_endettement_actuel: number
  taux_endettement_projet: number
  capacite_emprunt_max: number
  taux_apport: number
  mensualite_estimee: number
  points_forts: string[]
  points_vigilance: string[]
  recommandations: string[]
}

interface DocumentDossier {
  id: string
  nom_fichier: string
  type_document: string
  statut_verification: string
}

interface DossierBase {
  id: string
  reference: string
  statut: string
  notes?: string
  created_at: string
}

function fmt(amount?: number): string {
  if (!amount && amount !== 0) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function fmtPct(val?: number): string {
  if (val === undefined || val === null) return '-'
  return val.toFixed(1) + ' %'
}

function getUsageLabel(u?: string): string {
  const m: Record<string, string> = {
    residence_principale: 'Résidence principale',
    residence_secondaire: 'Résidence secondaire',
    investissement_locatif: 'Investissement locatif'
  }
  return u ? (m[u] || u) : '-'
}

function getTypeOpLabel(t?: string): string {
  const m: Record<string, string> = {
    achat_neuf: 'Achat neuf',
    achat_ancien: 'Achat ancien',
    travaux: 'Travaux',
    rachat_credit: 'Rachat de crédit',
    autre: 'Autre'
  }
  return t ? (m[t] || t) : 'Acquisition immobilière'
}

function getContratLabel(c?: string): string {
  const m: Record<string, string> = {
    cdi: 'CDI', cdd: 'CDD', fonctionnaire: 'Fonctionnaire',
    independant: 'Indépendant', retraite: 'Retraité', autre: 'Autre'
  }
  return c ? (m[c] || c) : '-'
}

function getSituationLabel(s?: string): string {
  const m: Record<string, string> = {
    celibataire: 'Célibataire', marie: 'Marié(e)', pacse: 'Pacsé(e)',
    divorce: 'Divorcé(e)', veuf: 'Veuf/Veuve', concubinage: 'Concubinage'
  }
  return s ? (m[s] || s) : '-'
}

function getBanqueReady(score: number): { label: string; color: string; bg: string; border: string; icon: string } {
  if (score >= 65) return { label: 'Oui', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅' }
  if (score >= 45) return { label: 'Presque', color: '#ca8a04', bg: '#fefce8', border: '#fde68a', icon: '⚠️' }
  return { label: 'Non', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '❌' }
}

function getScoreAppreciation(score: number): string {
  if (score >= 80) return 'Excellent – Dossier très solide'
  if (score >= 65) return 'Bon – Dossier présentable'
  if (score >= 45) return 'Moyen – Des points à renforcer'
  if (score > 0) return 'Insuffisant – Travail nécessaire'
  return 'Non évalué'
}

export default function SyntheseBanquePage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [dossier, setDossier] = useState<DossierBase | null>(null)
  const [emprunteurs, setEmprunteurs] = useState<Emprunteur[]>([])
  const [projet, setProjet] = useState<Projet | null>(null)
  const [analyse, setAnalyse] = useState<Analyse | null>(null)
  const [docs, setDocs] = useState<DocumentDossier[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedNote, setCopiedNote] = useState(false)
  const [copiedResume, setCopiedResume] = useState(false)
  const [markedReady, setMarkedReady] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: d } = await supabase.from('dossiers').select('id, reference, statut, notes, created_at').eq('id', id).single()
        if (!d) { setLoading(false); return }
        setDossier(d)

        const [empRes, projRes, anaRes, docRes] = await Promise.all([
          supabase.from('emprunteurs').select('*').eq('dossier_id', id),
          supabase.from('projets').select('*').eq('dossier_id', id).single(),
          supabase.from('analyses_financieres').select('*').eq('dossier_id', id).single(),
          supabase.from('documents').select('id, nom_fichier, type_document, statut_verification').eq('dossier_id', id)
        ])
        setEmprunteurs(empRes.data || [])
        setProjet(projRes.data)
        setAnalyse(anaRes.data)
        setDocs(docRes.data || [])
      } catch (e) {
        console.error('Erreur chargement synthèse:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, supabase])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Préparation de la synthèse banque...</p>
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Dossier introuvable</div>
      </div>
    )
  }

  const emp = emprunteurs.find(e => !e.est_co_emprunteur) || emprunteurs[0]
  const coEmp = emprunteurs.find(e => e.est_co_emprunteur)
  const score = analyse?.score_global || 0
  const banqueReady = getBanqueReady(score)
  const docsValides = docs.filter(d => d.statut_verification === 'valide').length
  const docsTotal = docs.length

  // Calculate financial details
  const revenus = analyse?.revenus_nets_mensuels_total || (emp?.salaire_net_mensuel || 0) + (emp?.autres_revenus || 0) + (emp?.revenus_locatifs || 0) + (coEmp?.salaire_net_mensuel || 0)
  const charges = analyse?.charges_mensuelles_total || (emp?.loyer_actuel || 0) + (emp?.credits_en_cours || 0) + (emp?.pension_versee || 0) + (emp?.autres_charges || 0)
  const rav = analyse?.reste_a_vivre || (revenus - charges)
  const endettement = analyse?.taux_endettement_projet || analyse?.taux_endettement_actuel || 0
  const mensualite = analyse?.mensualite_estimee || 0

  // Build atouts and points
  const atouts: string[] = []
  const pointsExpliquer: string[] = []

  if (analyse?.points_forts) {
    analyse.points_forts.forEach(p => atouts.push(p))
  } else {
    if (endettement > 0 && endettement <= 33) atouts.push('Taux d’endettement maîtrisé à ' + endettement.toFixed(1) + ' % (norme < 35 %)')
    if (rav > 1500) atouts.push('Reste à vivre confortable : ' + fmt(rav) + ' /mois')
    if ((projet?.apport_personnel || 0) > 0) atouts.push('Apport personnel : ' + fmt(projet?.apport_personnel))
    if ((analyse?.taux_apport || 0) >= 10) atouts.push('Taux d’apport de ' + (analyse?.taux_apport || 0).toFixed(1) + ' % (signal positif pour la banque)')
    if (emp?.type_contrat === 'cdi' || emp?.type_contrat === 'fonctionnaire') atouts.push('Stabilité professionnelle : ' + getContratLabel(emp?.type_contrat))
    if ((emp?.anciennete_emploi || 0) >= 2) atouts.push('Ancienneté de ' + emp?.anciennete_emploi + ' ans chez l’employeur')
    if (docsValides === docsTotal && docsTotal > 0) atouts.push('Dossier documentaire complet (' + docsTotal + ' pièces validées)')
    if (score >= 70) atouts.push('Score de finançabilité solide : ' + score + '/100')
    if ((emp?.epargne || 0) > 0) atouts.push('Épargne disponible : ' + fmt(emp?.epargne))
  }

  if (analyse?.points_vigilance) {
    analyse.points_vigilance.forEach(p => pointsExpliquer.push(p))
  } else {
    if (endettement > 33) pointsExpliquer.push('Taux d’endettement à ' + endettement.toFixed(1) + ' % : justifier la capacité de remboursement')
    if (rav > 0 && rav < 800) pointsExpliquer.push('Reste à vivre limité : ' + fmt(rav) + ' – prévoir justificatifs complémentaires')
    if (docsValides < docsTotal && docsTotal > 0) pointsExpliquer.push((docsTotal - docsValides) + ' document(s) manquant(s) ou à compléter')
    if ((emp?.credits_en_cours || 0) > 0) pointsExpliquer.push('Crédits en cours : ' + fmt(emp?.credits_en_cours) + ' /mois – impact sur la capacité')
    if (mensualite > 0 && revenus > 0 && (mensualite / revenus) > 0.30) pointsExpliquer.push('Mensualité estimée représente ' + ((mensualite / revenus) * 100).toFixed(1) + ' % des revenus')
  }

  // Generate premium bank note
  const nl = String.fromCharCode(10)
  const sep = '─'.repeat(50)
  const noteDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const empNom = emp ? (emp.prenom + ' ' + emp.nom) : 'Emprunteur'

  const noteLines: string[] = [
    '┌' + '─'.repeat(50) + '┐',
    '│  PRÉSENTATION DOSSIER EMPRUNTEUR',
    '│  Généré par CortIA le ' + noteDate,
    '└' + '─'.repeat(50) + '┘',
    '',
    '● EMPRUNTEUR',
    sep,
    'Nom : ' + empNom,
  ]

  if (emp?.situation_familiale) noteLines.push('Situation : ' + getSituationLabel(emp.situation_familiale))
  if (emp?.nb_enfants_charge) noteLines.push('Enfants à charge : ' + emp.nb_enfants_charge)
  if (emp?.type_contrat) noteLines.push('Contrat : ' + getContratLabel(emp.type_contrat))
  if (emp?.employeur) noteLines.push('Employeur : ' + emp.employeur)
  if (emp?.anciennete_emploi) noteLines.push('Ancienneté : ' + emp.anciennete_emploi + ' an(s)')

  if (coEmp) {
    noteLines.push('')
    noteLines.push('● CO-EMPRUNTEUR')
    noteLines.push(sep)
    noteLines.push('Nom : ' + coEmp.prenom + ' ' + coEmp.nom)
    if (coEmp.type_contrat) noteLines.push('Contrat : ' + getContratLabel(coEmp.type_contrat))
    if (coEmp.salaire_net_mensuel) noteLines.push('Revenus nets : ' + fmt(coEmp.salaire_net_mensuel) + ' /mois')
  }

  noteLines.push('')
  noteLines.push('● PROJET IMMOBILIER')
  noteLines.push(sep)
  noteLines.push('Type : ' + getTypeOpLabel(projet?.type_operation))
  noteLines.push('Usage : ' + getUsageLabel(projet?.usage_bien))
  if (projet?.adresse_bien) noteLines.push('Adresse : ' + projet.adresse_bien + (projet.ville_bien ? ', ' + projet.ville_bien : ''))
  if (projet?.surface_bien) noteLines.push('Surface : ' + projet.surface_bien + ' m²')
  noteLines.push('Prix du bien : ' + fmt(projet?.prix_bien))
  if (projet?.montant_travaux) noteLines.push('Travaux : ' + fmt(projet.montant_travaux))
  noteLines.push('Apport personnel : ' + fmt(projet?.apport_personnel))
  noteLines.push('Montant emprunté : ' + fmt(projet?.montant_emprunt))
  noteLines.push('Durée souhaitée : ' + (projet?.duree_souhaitee || '-') + ' mois')

  noteLines.push('')
  noteLines.push('● SITUATION FINANCIÈRE')
  noteLines.push(sep)
  noteLines.push('Revenus nets mensuels : ' + fmt(revenus))
  noteLines.push('Charges mensuelles : ' + fmt(charges))
  noteLines.push('Reste à vivre : ' + fmt(rav))
  noteLines.push('Taux d’endettement projet : ' + fmtPct(endettement))
  if (mensualite > 0) noteLines.push('Mensualité estimée : ' + fmt(mensualite))
  if (analyse?.capacite_emprunt_max) noteLines.push('Capacité d’emprunt max : ' + fmt(analyse.capacite_emprunt_max))

  noteLines.push('')
  noteLines.push('● ÉVALUATION')
  noteLines.push(sep)
  noteLines.push('Score de finançabilité : ' + (score > 0 ? score + '/100' : 'Non évalué'))
  noteLines.push('Appréciation : ' + getScoreAppreciation(score))
  noteLines.push('Statut banque-ready : ' + banqueReady.label)

  if (atouts.length > 0) {
    noteLines.push('')
    noteLines.push('● ATOUTS DU DOSSIER')
    noteLines.push(sep)
    atouts.forEach(a => noteLines.push('✓ ' + a))
  }

  if (pointsExpliquer.length > 0) {
    noteLines.push('')
    noteLines.push('● POINTS À EXPLIQUER / ANTICIPER')
    noteLines.push(sep)
    pointsExpliquer.forEach(p => noteLines.push('⚠ ' + p))
  }

  if (analyse?.recommandations && analyse.recommandations.length > 0) {
    noteLines.push('')
    noteLines.push('● RECOMMANDATIONS')
    noteLines.push(sep)
    analyse.recommandations.forEach(r => noteLines.push('→ ' + r))
  }

  noteLines.push('')
  noteLines.push(sep)
  noteLines.push('Référence dossier : ' + (dossier.reference || id))
  noteLines.push('Document généré par CortIA – ' + noteDate)
  noteLines.push('Ce document ne constitue pas un accord de financement.')

  const noteBancaire = noteLines.join(nl)

  // Resume executif (shorter version for quick sharing)
  const resumeLines = [
    'SYNTHÈSE – ' + empNom + ' – ' + (dossier.reference || ''),
    '',
    'Projet : ' + getTypeOpLabel(projet?.type_operation) + ' – ' + fmt(projet?.prix_bien),
    'Emprunt : ' + fmt(projet?.montant_emprunt) + ' sur ' + (projet?.duree_souhaitee || '-') + ' mois',
    'Apport : ' + fmt(projet?.apport_personnel) + (analyse?.taux_apport ? ' (' + analyse.taux_apport.toFixed(1) + ' %)' : ''),
    '',
    'Revenus : ' + fmt(revenus) + ' /mois | Charges : ' + fmt(charges) + ' /mois',
    'Endettement : ' + fmtPct(endettement) + ' | Reste à vivre : ' + fmt(rav),
    'Score : ' + (score > 0 ? score + '/100' : 'N/A') + ' | Banque-ready : ' + banqueReady.label,
  ]
  if (atouts.length > 0) { resumeLines.push(''); resumeLines.push('Atouts : ' + atouts.slice(0, 3).join(' ; ')) }
  if (pointsExpliquer.length > 0) { resumeLines.push('Points : ' + pointsExpliquer.slice(0, 3).join(' ; ')) }
  resumeLines.push('')
  resumeLines.push('CortIA – ' + noteDate)
  const resumeExec = resumeLines.join(nl)

  const handleCopyNote = async () => {
    try { await navigator.clipboard.writeText(noteBancaire); setCopiedNote(true); setTimeout(() => setCopiedNote(false), 2500) } catch {}
  }

  const handleCopyResume = async () => {
    try { await navigator.clipboard.writeText(resumeExec); setCopiedResume(true); setTimeout(() => setCopiedResume(false), 2500) } catch {}
  }

  const handleMarkReady = async () => {
    try {
      await supabase.from('dossiers').update({ statut: 'soumis' }).eq('id', id)
      setMarkedReady(true)
    } catch {}
  }

  // Sub-scores for radar display
  const subScores = analyse ? [
    { label: 'Revenus', value: analyse.score_revenus, max: 25 },
    { label: 'Stabilité', value: analyse.score_stabilite, max: 20 },
    { label: 'Endettement', value: analyse.score_endettement, max: 25 },
    { label: 'Apport', value: analyse.score_apport, max: 20 },
    { label: 'Patrimoine', value: analyse.score_patrimoine, max: 10 },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* HEADER PREMIUM */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)', color: 'white', padding: '32px', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {/* Score Ring */}
          <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <circle cx="55" cy="55" r="48" fill="none" stroke={banqueReady.color} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 48}`} strokeDashoffset={`${2 * Math.PI * 48 * (1 - score / 100)}`}
                strokeLinecap="round" transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{score > 0 ? score : '–'}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>/100</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: 0 }}>
                Synthèse Banque
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700,
                background: banqueReady.bg, color: banqueReady.color, border: '1px solid ' + banqueReady.border
              }}>
                {banqueReady.icon} {banqueReady.label === 'Oui' ? 'Prêt banque' : banqueReady.label === 'Presque' ? 'Presque prêt' : 'Non prêt'}
              </span>
            </div>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', margin: '0 0 12px 0' }}>
              {empNom} – {dossier.reference || 'Dossier'} – {getTypeOpLabel(projet?.type_operation)}
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[
                { label: 'Projet', value: fmt(projet?.prix_bien) },
                { label: 'Emprunt', value: fmt(projet?.montant_emprunt) },
                { label: 'Apport', value: fmt(projet?.apport_personnel) },
                { label: 'Endettement', value: fmtPct(endettement) },
                { label: 'Reste à vivre', value: fmt(rav) },
              ].map((kpi, i) => (
                <div key={i}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: 'white', marginTop: '2px' }}>{kpi.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
            <button onClick={handleCopyNote} className="btn-primary" style={{ whiteSpace: 'nowrap', fontSize: '13px', padding: '10px 20px' }}>
              {copiedNote ? '✅ Copié !' : '📋 Copier la note'}
            </button>
            <button onClick={handleCopyResume} className="btn-ghost" style={{ whiteSpace: 'nowrap', fontSize: '13px', padding: '10px 20px', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              {copiedResume ? '✅ Copié !' : '📤 Résumé rapide'}
            </button>
            {!markedReady && score >= 45 && (
              <button onClick={handleMarkReady} className="btn-ghost" style={{ whiteSpace: 'nowrap', fontSize: '13px', padding: '10px 20px', color: '#86efac', borderColor: 'rgba(134,239,172,0.4)' }}>
                ✅ Marquer Prêt Banque
              </button>
            )}
            {markedReady && (
              <div style={{ fontSize: '12px', color: '#86efac', textAlign: 'center', padding: '8px' }}>
                ✅ Dossier marqué prêt
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RÉSUMÉ EXÉCUTIF + SUB-SCORES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Résumé exécutif */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Résumé exécutif</h2>
            <span className="badge-blue" style={{ fontSize: '11px' }}>{getScoreAppreciation(score)}</span>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '16px', fontSize: '13px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{empNom}</strong> présente un dossier
              {score >= 65 ? ' solide' : score >= 45 ? ' à consolider' : score > 0 ? ' nécessitant un renforcement' : ' en attente d’analyse'}
              {' '}pour {getTypeOpLabel(projet?.type_operation).toLowerCase()} d’un bien de <strong>{fmt(projet?.prix_bien)}</strong>.
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              Financement demandé : <strong>{fmt(projet?.montant_emprunt)}</strong> sur <strong>{projet?.duree_souhaitee || '-'} mois</strong>
              {(projet?.apport_personnel || 0) > 0 && <> avec un apport de <strong>{fmt(projet?.apport_personnel)}</strong>{analyse?.taux_apport ? ' (' + analyse.taux_apport.toFixed(1) + ' %)' : ''}</>}.
            </p>
            <p style={{ margin: 0 }}>
              {endettement > 0 && <>Taux d’endettement projeté : <strong>{fmtPct(endettement)}</strong>. </>}
              {rav > 0 && <>Reste à vivre : <strong>{fmt(rav)}</strong>/mois. </>}
              {atouts.length > 0 && <><br />Principaux atouts : {atouts.slice(0, 2).join(', ').toLowerCase()}.</>}
            </p>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Détail du scoring</h2>
          {subScores.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Analyse non encore réalisée</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subScores.map((s, i) => {
                const pct = s.max > 0 ? Math.min((s.value / s.max) * 100, 100) : 0
                const barColor = pct >= 70 ? '#16a34a' : pct >= 40 ? '#ca8a04' : '#dc2626'
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: barColor }}>{s.value}/{s.max}</span>
                    </div>
                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: pct + '%', height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                )
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Score global</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: banqueReady.color }}>{score}/100</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PROFIL EMPRUNTEUR + SITUATION FINANCIÈRE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Profil emprunteur */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
            Profil emprunteur
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { label: 'Emprunteur', value: empNom },
              { label: 'Situation', value: getSituationLabel(emp?.situation_familiale) },
              { label: 'Enfants à charge', value: emp?.nb_enfants_charge !== undefined ? String(emp.nb_enfants_charge) : '-' },
              { label: 'Contrat', value: getContratLabel(emp?.type_contrat) },
              { label: 'Employeur', value: emp?.employeur || '-' },
              { label: 'Ancienneté', value: emp?.anciennete_emploi ? emp.anciennete_emploi + ' an(s)' : '-' },
              { label: 'Salaire net', value: fmt(emp?.salaire_net_mensuel) },
              { label: 'Autres revenus', value: fmt((emp?.autres_revenus || 0) + (emp?.revenus_locatifs || 0)) },
              { label: 'Épargne', value: fmt(emp?.epargne) },
              { label: 'Patrimoine immo', value: fmt(emp?.valeur_patrimoine_immo) },
            ].map((r, i) => (
              <div key={i} className="stat-row" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.value}</span>
              </div>
            ))}
          </div>
          {coEmp && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Co-emprunteur : {coEmp.prenom} {coEmp.nom}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {getContratLabel(coEmp.type_contrat)} {coEmp.salaire_net_mensuel ? '– ' + fmt(coEmp.salaire_net_mensuel) + ' /mois' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Situation financière */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
            Situation financière
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { label: 'Revenus nets mensuels', value: fmt(revenus), highlight: false, alert: false },
              { label: 'Charges mensuelles', value: fmt(charges), highlight: false, alert: false },
              { label: 'Reste à vivre', value: fmt(rav), highlight: true, alert: rav > 0 && rav < 800 },
              { label: 'Taux d’endettement actuel', value: fmtPct(analyse?.taux_endettement_actuel), highlight: false, alert: (analyse?.taux_endettement_actuel || 0) > 33 },
              { label: 'Taux d’endettement projet', value: fmtPct(endettement), highlight: true, alert: endettement > 33 },
              { label: 'Mensualité estimée', value: fmt(mensualite), highlight: false, alert: false },
              { label: 'Capacité emprunt max', value: fmt(analyse?.capacite_emprunt_max), highlight: false, alert: false },
              { label: 'Taux d’apport', value: analyse?.taux_apport ? analyse.taux_apport.toFixed(1) + ' %' : '-', highlight: false, alert: (analyse?.taux_apport || 0) < 10 && (analyse?.taux_apport || 0) > 0 },
            ].map((r, i) => (
              <div key={i} className="stat-row" style={{
                padding: '8px 0', borderBottom: '1px solid var(--border-light)',
                background: r.highlight ? 'var(--bg-secondary)' : 'transparent',
                margin: r.highlight ? '0 -12px' : '0',
                padding: r.highlight ? '8px 12px' : '8px 0',
                borderRadius: r.highlight ? '6px' : '0'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{
                  fontSize: '13px', fontWeight: 700,
                  color: r.alert ? '#dc2626' : r.highlight ? banqueReady.color : 'var(--text-primary)'
                }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRÉSENTATION PROJET */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
          Présentation du projet
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Type', value: getTypeOpLabel(projet?.type_operation), sub: getUsageLabel(projet?.usage_bien) },
            { label: 'Localisation', value: projet?.ville_bien || '-', sub: projet?.code_postal_bien || '' },
            { label: 'Prix du bien', value: fmt(projet?.prix_bien), sub: projet?.surface_bien ? projet.surface_bien + ' m²' : '' },
            { label: 'Montant emprunté', value: fmt(projet?.montant_emprunt), sub: (projet?.duree_souhaitee || 0) > 0 ? Math.round((projet?.duree_souhaitee || 0) / 12) + ' ans' : '' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{item.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{item.value}</div>
              {item.sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.sub}</div>}
            </div>
          ))}
        </div>
        {(projet?.montant_travaux || 0) > 0 && (
          <div style={{ marginTop: '12px', padding: '10px 16px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '13px', color: '#92400e' }}>
            Travaux prévus : <strong>{fmt(projet?.montant_travaux)}</strong> – intégrés dans le montant total du projet
          </div>
        )}
        {(projet?.apport_personnel || 0) > 0 && (
          <div style={{ marginTop: '8px', padding: '10px 16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#166534' }}>
            Apport personnel : <strong>{fmt(projet?.apport_personnel)}</strong>
            {analyse?.taux_apport ? <> soit <strong>{analyse.taux_apport.toFixed(1)} %</strong> du bien</> : ''}
            {(analyse?.taux_apport || 0) >= 10 ? ' – Signal positif pour la banque' : ''}
          </div>
        )}
      </div>

      {/* ATOUTS + POINTS À EXPLIQUER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Atouts bancaires */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#16a34a', margin: 0 }}>Atouts bancaires</h2>
            {atouts.length > 0 && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>({atouts.length})</span>}
          </div>
          {atouts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              À identifier après analyse complète du dossier
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {atouts.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '10px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0'
                }}>
                  <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '14px', lineHeight: '1.4', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '13px', color: '#166534', lineHeight: '1.4' }}>{a}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Points à expliquer */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ca8a04' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', margin: 0 }}>Points à expliquer / anticiper</h2>
            {pointsExpliquer.length > 0 && <span style={{ fontSize: '12px', color: '#ca8a04', fontWeight: 600 }}>({pointsExpliquer.length})</span>}
          </div>
          {pointsExpliquer.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ Aucun point critique identifié</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pointsExpliquer.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '10px 12px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a'
                }}>
                  <span style={{ color: '#ca8a04', fontWeight: 800, fontSize: '14px', lineHeight: '1.4', flexShrink: 0 }}>⚠</span>
                  <span style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.4' }}>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECOMMANDATIONS (if available from AI analysis) */}
      {analyse?.recommandations && analyse.recommandations.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recommandations CortIA</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analyse.recommandations.map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                padding: '10px 12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe'
              }}>
                <span style={{ color: '#3b82f6', fontWeight: 800, fontSize: '14px', lineHeight: '1.4', flexShrink: 0 }}>→</span>
                <span style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.4' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCUMENTS */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>État documentaire</h2>
          <span style={{
            fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px',
            background: docsValides === docsTotal && docsTotal > 0 ? '#f0fdf4' : '#fefce8',
            color: docsValides === docsTotal && docsTotal > 0 ? '#16a34a' : '#ca8a04',
            border: '1px solid ' + (docsValides === docsTotal && docsTotal > 0 ? '#bbf7d0' : '#fde68a')
          }}>
            {docsTotal === 0 ? 'Aucun document' : docsValides + '/' + docsTotal + ' validé(s)'}
          </span>
        </div>
        {docsTotal === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Aucun document téléversé pour ce dossier
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
            {docs.map((doc, i) => {
              const isValid = doc.statut_verification === 'valide'
              const isRefused = doc.statut_verification === 'refuse' || doc.statut_verification === 'a_remplacer'
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px',
                  background: isValid ? '#f0fdf4' : isRefused ? '#fef2f2' : 'var(--bg-secondary)',
                  border: '1px solid ' + (isValid ? '#bbf7d0' : isRefused ? '#fecaca' : 'var(--border-light)')
                }}>
                  <span style={{ fontSize: '16px' }}>{isValid ? '✅' : isRefused ? '❌' : '⏳'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.nom_fichier}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doc.type_document.replace(/_/g, ' ')}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* NOTE BANCAIRE PRÉMIUM */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Note bancaire générée</h2>
            <span className="badge-purple" style={{ fontSize: '11px' }}>Premium</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCopyNote} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 14px' }}>
              {copiedNote ? '✅ Copié' : '📋 Copier'}
            </button>
          </div>
        </div>
        <div style={{
          background: '#0f172a', color: '#e2e8f0', padding: '24px',
          borderRadius: '12px', fontSize: '12.5px', lineHeight: '1.8',
          fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
          whiteSpace: 'pre-wrap', overflowX: 'auto', maxHeight: '600px', overflowY: 'auto',
          border: '1px solid #1e293b'
        }}>
          {noteBancaire}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', background: 'var(--bg-secondary)', borderRadius: '12px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Synthèse générée par CortIA – {noteDate} – Réf. {dossier.reference || id}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleCopyResume} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 14px' }}>
            {copiedResume ? '✅ Copié' : '📤 Résumé rapide'}
          </button>
          <button onClick={handleCopyNote} className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>
            {copiedNote ? '✅ Copié !' : '📋 Copier la note complète'}
          </button>
          {!markedReady && score >= 45 && (
            <button onClick={handleMarkReady} style={{
              fontSize: '12px', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
              background: '#16a34a', color: 'white', border: 'none', fontWeight: 600
            }}>
              ✅ Marquer Prêt Banque
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
