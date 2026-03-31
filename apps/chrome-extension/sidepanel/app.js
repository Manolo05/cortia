// CortIA Side Panel App

// State
let currentUser = null
let currentToken = null

// DOM elements
const loginView = document.getElementById('login-view')
const mainView = document.getElementById('main-view')
const loginForm = document.getElementById('login-form')
const loginError = document.getElementById('login-error')
const userNameEl = document.getElementById('user-name')
const dossiersList = document.getElementById('dossiers-list')
const bankBadge = document.getElementById('bank-badge')
const logoutBtn = document.getElementById('logout-btn')
const createDossierBtn = document.getElementById('create-dossier')

const APP_URL = 'https://cortia.vercel.app'

// Init
async function init() {
  const storage = await chrome.storage.local.get(['cortia_token', 'cortia_user'])
  if (storage.cortia_token && storage.cortia_user) {
    currentToken = storage.cortia_token
    currentUser = storage.cortia_user
    showMainView()
  } else {
    showLoginView()
  }

  // Détecter si on est sur un site bancaire
  detectBank()
}

function showLoginView() {
  loginView.classList.remove('hidden')
  mainView.classList.add('hidden')
}

function showMainView() {
  loginView.classList.add('hidden')
  mainView.classList.remove('hidden')
  if (currentUser) {
    userNameEl.textContent = currentUser.nom_complet?.split(' ')[0] || currentUser.email
  }
  loadDossiers()
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  loginError.classList.add('hidden')
  
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  
  try {
    const response = await fetch(`${APP_URL}/api/ext/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    
    if (!response.ok) throw new Error(data.error || 'Erreur de connexion')
    
    currentToken = data.token
    currentUser = data.user
    
    await chrome.storage.local.set({
      cortia_token: data.token,
      cortia_user: data.user,
    })
    
    showMainView()
  } catch (error) {
    loginError.textContent = error.message
    loginError.classList.remove('hidden')
  }
})

// Logout
logoutBtn.addEventListener('click', async () => {
  await chrome.storage.local.remove(['cortia_token', 'cortia_user'])
  currentToken = null
  currentUser = null
  showLoginView()
})

// Load dossiers
async function loadDossiers() {
  try {
    const response = await fetch(`${APP_URL}/api/ext/dossier`, {
      headers: { 'Authorization': `Bearer ${currentToken}` },
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        await chrome.storage.local.remove(['cortia_token', 'cortia_user'])
        showLoginView()
        return
      }
      throw new Error('Erreur chargement')
    }
    
    const dossiers = await response.json()
    
    if (dossiers.length === 0) {
      dossiersList.innerHTML = '<p class="empty">Aucun dossier</p>'
      return
    }
    
    dossiersList.innerHTML = dossiers.slice(0, 5).map(d => `
      <a href="${APP_URL}/dossiers/${d.id}" target="_blank" class="dossier-item">
        <span class="dossier-ref">${d.reference}</span>
        <span class="dossier-name">${d.emprunteurs?.[0] ? d.emprunteurs[0].prenom + ' ' + d.emprunteurs[0].nom : 'Emprunteur non renseigné'}</span>
        <span class="dossier-status status-${d.statut}">${d.statut}</span>
      </a>
    `).join('')
  } catch (error) {
    dossiersList.innerHTML = `<p class="error">${error.message}</p>`
  }
}

// Detect bank
async function detectBank() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const bankDomains = ['credit-agricole.fr', 'bnpparibas.fr', 'lcl.fr', 'societegenerale.fr', 'caisse-epargne.fr', 'banquepopulaire.fr', 'labanquepostale.fr', 'creditmutuel.fr', 'cic.fr']
    const domain = new URL(tab.url).hostname
    const bank = bankDomains.find(b => domain.includes(b))
    
    if (bank) {
      bankBadge.textContent = `🏦 Site bancaire détecté`
      bankBadge.classList.remove('hidden')
    }
  } catch {
    // Ignore
  }
}

// Create dossier
createDossierBtn.addEventListener('click', async () => {
  try {
    const response = await fetch(`${APP_URL}/api/ext/dossier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
      body: JSON.stringify({}),
    })
    
    const dossier = await response.json()
    if (!response.ok) throw new Error(dossier.error)
    
    window.open(`${APP_URL}/dossiers/${dossier.id}`, '_blank')
    await loadDossiers()
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
})

// Start
init()
