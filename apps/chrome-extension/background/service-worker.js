// Service Worker CortIA Extension
import { API } from '../shared/api.js'

// Ouvrir le side panel au clic sur l'icône
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id })
})

// Écouter les messages des content scripts et du side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse)
  return true // Important pour les réponses asynchrones
})

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case 'GET_AUTH':
        const auth = await chrome.storage.local.get(['cortia_token', 'cortia_user'])
        sendResponse({ success: true, data: auth })
        break

      case 'SET_AUTH':
        await chrome.storage.local.set({
          cortia_token: message.token,
          cortia_user: message.user,
        })
        sendResponse({ success: true })
        break

      case 'CLEAR_AUTH':
        await chrome.storage.local.remove(['cortia_token', 'cortia_user'])
        sendResponse({ success: true })
        break

      case 'CREATE_DOSSIER':
        const createResult = await API.createDossier(message.data)
        sendResponse(createResult)
        break

      case 'GET_DOSSIERS':
        const dossiers = await API.getDossiers()
        sendResponse(dossiers)
        break

      case 'ANALYSE_DOSSIER':
        const analyseResult = await API.analyseDossier(message.dossierId)
        sendResponse(analyseResult)
        break

      default:
        sendResponse({ success: false, error: 'Unknown message type' })
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message })
  }
}

// Installation de l'extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('CortIA Extension installed')
})
