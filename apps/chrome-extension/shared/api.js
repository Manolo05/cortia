// API Client pour l'extension CortIA

const APP_URL = 'https://cortia.vercel.app' // À changer en production

export class API {
  static async getToken() {
    const storage = await chrome.storage.local.get(['cortia_token'])
    return storage.cortia_token
  }

  static async request(path, options = {}) {
    const token = await this.getToken()
    const response = await fetch(`${APP_URL}/api/ext${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  static async login(email, password) {
    return this.request('/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  static async getDossiers() {
    return this.request('/dossier')
  }

  static async createDossier(data) {
    return this.request('/dossier', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async analyseDossier(dossierId) {
    return this.request('/analyse', {
      method: 'POST',
      body: JSON.stringify({ dossierId }),
    })
  }
}

export default API
