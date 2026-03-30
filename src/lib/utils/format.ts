/**
 * Utilitaires de formatage pour CortIA
 */

/**
 * Formate un montant en euros
 */
export function formatMontant(montant: number, decimales = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(montant)
}

/**
 * Formate un pourcentage
 */
export function formatPourcentage(valeur: number, decimales = 1): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valeur / 100)
}

/**
 * Formate une date en français
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(d)
}

/**
 * Formate une date avec l'heure
 */
export function formatDateHeure(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Formate une durée en mois en années/mois
 */
export function formatDuree(mois: number): string {
  const annees = Math.floor(mois / 12)
  const moisRestants = mois % 12
  
  if (annees === 0) return `${mois} mois`
  if (moisRestants === 0) return `${annees} ans`
  return `${annees} ans et ${moisRestants} mois`
}

/**
 * Formate une taille de fichier
 */
export function formatTailleFichier(octets: number): string {
  if (octets < 1024) return `${octets} o`
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
}

/**
 * Formate un numéro de téléphone français
 */
export function formatTelephone(tel: string): string {
  const cleaned = tel.replace(/D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(d{2})(d{2})(d{2})(d{2})(d{2})/, '$1 $2 $3 $4 $5')
  }
  return tel
}

/**
 * Capitalise la première lettre d'une chaîne
 */
export function capitaliser(texte: string): string {
  if (!texte) return ''
  return texte.charAt(0).toUpperCase() + texte.slice(1).toLowerCase()
}

/**
 * Formate un nom complet
 */
export function formatNomComplet(prenom: string, nom: string): string {
  return `${capitaliser(prenom)} ${nom.toUpperCase()}`
}

/**
 * Génère une référence de dossier
 */
export function genererReference(): string {
  const annee = new Date().getFullYear().toString().slice(-2)
  const mois = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `CRT-${annee}${mois}-${random}`
}

/**
 * Tronque un texte
 */
export function tronquer(texte: string, longueur: number): string {
  if (!texte || texte.length <= longueur) return texte
  return texte.substring(0, longueur) + '...'
}

/**
 * Calcule l'âge à partir d'une date de naissance
 */
export function calculerAge(dateNaissance: string): number {
  const naissance = new Date(dateNaissance)
  const aujourd_hui = new Date()
  let age = aujourd_hui.getFullYear() - naissance.getFullYear()
  const mois = aujourd_hui.getMonth() - naissance.getMonth()
  if (mois < 0 || (mois === 0 && aujourd_hui.getDate() < naissance.getDate())) {
    age--
  }
  return age
}

/**
 * Retourne la couleur de statut d'un dossier
 */
export function couleurStatut(statut: string): string {
  const couleurs: Record<string, string> = {
    nouveau: 'bg-gray-100 text-gray-700',
    en_cours: 'bg-blue-100 text-blue-700',
    analyse: 'bg-purple-100 text-purple-700',
    soumis: 'bg-yellow-100 text-yellow-700',
    accepte: 'bg-green-100 text-green-700',
    refuse: 'bg-red-100 text-red-700',
    archive: 'bg-gray-100 text-gray-500',
  }
  return couleurs[statut] || 'bg-gray-100 text-gray-700'
}

/**
 * Retourne le libellé d'un statut de dossier
 */
export function libelleStatut(statut: string): string {
  const libelles: Record<string, string> = {
    nouveau: 'Nouveau',
    en_cours: 'En cours',
    analyse: 'En analyse',
    soumis: 'Soumis banque',
    accepte: 'Accepté',
    refuse: 'Refusé',
    archive: 'Archivé',
  }
  return libelles[statut] || statut
}
