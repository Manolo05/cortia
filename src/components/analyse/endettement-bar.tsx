'use client'

interface EndettementBarProps {
  tauxActuel: number
  tauxApres: number
  revenusMensuels: number
  chargesActuelles: number
  nouvelleMensualite: number
  plafondReglementaire?: number
}

function getBarColor(taux: number): string {
  if (taux <= 33) return 'bg-green-500'
  if (taux <= 35) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getTextColor(taux: number): string {
  if (taux <= 33) return 'text-green-600'
  if (taux <= 35) return 'text-yellow-600'
  return 'text-red-600'
}

export function EndettementBar({
  tauxActuel,
  tauxApres,
  revenusMensuels,
  chargesActuelles,
  nouvelleMensualite,
  plafondReglementaire = 35,
}: EndettementBarProps) {
  const maxDisplay = Math.max(50, tauxApres + 10)
  const plafondPosition = (plafondReglementaire / maxDisplay) * 100
  const avantPosition = (tauxActuel / maxDisplay) * 100
  const apresPosition = (tauxApres / maxDisplay) * 100

  return (
    <div className="space-y-5">
      {/* Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>0%</span>
          <span className="font-medium">Taux d'endettement</span>
          <span>{maxDisplay}%</span>
        </div>

        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          {/* Gradient zones */}
          <div
            className="absolute inset-y-0 left-0 bg-green-100"
            style={{ width: `${(33 / maxDisplay) * 100}%` }}
          />
          <div
            className="absolute inset-y-0 bg-yellow-100"
            style={{
              left: `${(33 / maxDisplay) * 100}%`,
              width: `${(2 / maxDisplay) * 100}%`
            }}
          />
          <div
            className="absolute inset-y-0 bg-red-100"
            style={{
              left: `${(35 / maxDisplay) * 100}%`,
              right: 0
            }}
          />

          {/* Current rate bar */}
          {tauxActuel > 0 && (
            <div
              className={`absolute inset-y-0 left-0 ${getBarColor(tauxActuel)} opacity-40 rounded-l-full transition-all duration-700`}
              style={{ width: `${avantPosition}%` }}
            />
          )}

          {/* After rate bar */}
          <div
            className={`absolute inset-y-0 left-0 ${getBarColor(tauxApres)} rounded-l-full transition-all duration-700`}
            style={{ width: `${apresPosition}%`, opacity: 0.8 }}
          />

          {/* Plafond line */}
          <div
            className="absolute inset-y-0 w-0.5 bg-orange-500"
            style={{ left: `${plafondPosition}%` }}
          >
            <div className="absolute -top-5 -translate-x-1/2 text-xs font-medium text-orange-600 whitespace-nowrap">
              Plafond HCSF {plafondReglementaire}%
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          {tauxActuel > 0 && (
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${getBarColor(tauxActuel)} opacity-50`} />
              <span className="text-gray-600">Avant : <strong className={getTextColor(tauxActuel)}>{tauxActuel.toFixed(1)}%</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${getBarColor(tauxApres)}`} />
            <span className="text-gray-600">Après : <strong className={getTextColor(tauxApres)}>{tauxApres.toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>

      {/* Detail table */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Détail du calcul</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Revenus mensuels nets</span>
            <span className="font-semibold text-gray-800">
              {revenusMensuels.toLocaleString('fr-FR')} €
            </span>
          </div>
          {chargesActuelles > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Charges actuelles</span>
              <span className="font-medium text-orange-600">
                − {chargesActuelles.toLocaleString('fr-FR')} €
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Nouvelle mensualité</span>
            <span className="font-medium text-red-600">
              − {nouvelleMensualite.toLocaleString('fr-FR')} €
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-gray-700">Reste à vivre estimé</span>
            <span className={revenusMensuels - chargesActuelles - nouvelleMensualite > 0 ? 'text-green-600' : 'text-red-600'}>
              {(revenusMensuels - chargesActuelles - nouvelleMensualite).toLocaleString('fr-FR')} €
            </span>
          </div>
        </div>
      </div>

      {/* Status message */}
      {tauxApres > plafondReglementaire && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span className="text-base">⚠️</span>
          <p>
            Le taux d'endettement dépasse le plafond HCSF de {plafondReglementaire}%. 
            Un dérogation bancaire sera nécessaire.
          </p>
        </div>
      )}
      {tauxApres <= plafondReglementaire && tauxApres > 33 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          <span className="text-base">ℹ️</span>
          <p>
            Le taux d'endettement est proche du plafond réglementaire.
          </p>
        </div>
      )}
    </div>
  )
}
