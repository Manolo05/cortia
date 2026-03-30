/**
 * Module de génération de note bancaire
 * Génère une note bancaire professionnelle depuis les données du dossier
 */

import type { DonneesSynthese } from './types-synthese'
import type { SyntheseGenereeIA } from './types-synthese'
import { formatMontant, formatDate, formatDuree } from '../utils/format'

/**
 * Génère une note bancaire en Markdown depuis la synthèse IA
 */
export function genererNoteBancaire(
  donnees: DonneesSynthese,
  synthese: SyntheseGenereeIA
): string {
  const dateAujourdHui = formatDate(new Date())
  const emprunteursNoms = donnees.emprunteurs.map(e => e.nom_complet).join(' et ')
  const prixTotal = donnees.projet.prix_bien + donnees.projet.travaux

  let note = `# NOTE DE PRÉSENTATION BANCAIRE
## Dossier N° ${donnees.dossier.reference}

**Date :** ${dateAujourdHui}
**Courtier :** ${donnees.dossier.courtier}

---

## 1. PRÉSENTATION DES EMPRUNTEURS

`

  donnees.emprunteurs.forEach(e => {
    note += `### ${e.nom_complet} (${e.role})

- **Situation professionnelle :** ${e.situation_pro}
- **Revenus nets mensuels :** ${formatMontant(e.revenus_nets)}
- **Ancienneté :** ${e.anciennete} an(s)

`
  })

  note += `---

## 2. PRÉSENTATION DU PROJET

| Élément | Valeur |
|---------|--------|
| Type d'opération | ${donnees.projet.type} |
| Usage | ${donnees.projet.usage} |
| Localisation | ${donnees.projet.localisation} |
| Prix du bien | ${formatMontant(donnees.projet.prix_bien)} |
${donnees.projet.travaux > 0 ? `| Montant des travaux | ${formatMontant(donnees.projet.travaux)} |\n` : ''}| **Coût total opération** | **${formatMontant(prixTotal)}** |
| Apport personnel | ${formatMontant(donnees.projet.apport)} (${donnees.analyse.taux_apport.toFixed(0)}%) |
| **Montant du prêt demandé** | **${formatMontant(donnees.projet.montant_emprunt)}** |
| Durée souhaitée | ${formatDuree(donnees.projet.duree * 12)} |
| Taux envisagé | ${donnees.projet.taux}% |

---

## 3. ANALYSE FINANCIÈRE

| Indicateur | Valeur |
|-----------|--------|
| Revenus nets mensuels totaux | ${formatMontant(donnees.emprunteurs.reduce((s, e) => s + e.revenus_nets, 0))} |
| Mensualité estimée | ${formatMontant(donnees.analyse.mensualite)} |
| Taux d'endettement avec projet | ${donnees.analyse.taux_endettement_projet.toFixed(1)}% |
| Reste à vivre | ${formatMontant(donnees.analyse.reste_a_vivre)}/mois |
| **Score global CortIA** | **${donnees.analyse.score_global}/100** |

### Points forts

${donnees.analyse.points_forts.map(p => `- ✅ ${p}`).join('\n')}

### Points de vigilance

${donnees.analyse.points_vigilance.length > 0 
  ? donnees.analyse.points_vigilance.map(p => `- ⚠️ ${p}`).join('\n')
  : '- Aucun point de vigilance majeur identifié'}

---

## 4. SYNTHÈSE ET RECOMMANDATION

${synthese.conclusion}

---

**Recommandation finale :** ${
    {
      accord_recommande: '✅ ACCORD RECOMMANDÉ',
      accord_sous_conditions: '⚠️ ACCORD SOUS CONDITIONS',
      etude_approfondie: '🔍 ÉTUDE APPROFONDIE RECOMMANDÉE',
      refus_recommande: '❌ REFUS RECOMMANDÉ',
    }[synthese.recommandation_finale] || synthese.recommandation_finale
  }

---

*Document généré automatiquement par CortIA le ${dateAujourdHui}*
*Courtier : ${donnees.dossier.courtier}*
`

  return note
}
