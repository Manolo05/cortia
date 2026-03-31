// Content Script CortIA - Détecteur de pages bancaires
// Détecte les pages pertinentes pour l'analyse de prêt

const BANK_PATTERNS = [
  { domain: 'credit-agricole.fr', name: 'Crédit Agricole' },
  { domain: 'bnpparibas.fr', name: 'BNP Paribas' },
  { domain: 'lcl.fr', name: 'LCL' },
  { domain: 'societegenerale.fr', name: 'Société Générale' },
  { domain: 'caisse-epargne.fr', name: 'Caisse d\'Épargne' },
  { domain: 'bpce.fr', name: 'BPCE' },
  { domain: 'banquepopulaire.fr', name: 'Banque Populaire' },
  { domain: 'labanquepostale.fr', name: 'La Banque Postale' },
  { domain: 'creditmutuel.fr', name: 'Crédit Mutuel' },
  { domain: 'cic.fr', name: 'CIC' },
]

// Vérifier si on est sur un site bancaire
const currentDomain = window.location.hostname
const bankInfo = BANK_PATTERNS.find(b => currentDomain.includes(b.domain))

if (bankInfo) {
  // Notifier le service worker
  chrome.runtime.sendMessage({
    type: 'BANK_PAGE_DETECTED',
    bank: bankInfo.name,
    url: window.location.href,
  })
  
  console.log(`CortIA: Page bancaire détectée - ${bankInfo.name}`)
}

// Écouter les messages du service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_INFO') {
    sendResponse({
      url: window.location.href,
      title: document.title,
      bank: bankInfo?.name || null,
    })
  }
})
