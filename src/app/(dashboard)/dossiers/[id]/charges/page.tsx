'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Charge {
  id: string;
  libelle: string;
  mensualite: number;
  type: string;
  soldable: boolean;
}

const TYPES_CHARGES = [
  { value: 'credit_auto', label: 'Crédit auto' },
  { value: 'credit_conso', label: 'Crédit conso' },
  { value: 'loa', label: 'LOA / Leasing' },
  { value: 'pension', label: 'Pension alimentaire' },
  { value: 'loyer', label: 'Loyer actuel' },
  { value: 'autre', label: 'Autre' },
];

function getTypeLabel(type: string) {
  return TYPES_CHARGES.find(t => t.value === type)?.label || type;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

export default function ChargesPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ libelle: '', mensualite: '', type: 'credit_conso', soldable: false });
  const [cabinetId, setCabinetId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profil } = await supabase.from('profils_utilisateurs').select('cabinet_id').eq('id', user.id).single();
          if (profil) setCabinetId(profil.cabinet_id);
        }
        const { data } = await supabase.from('charges').select('*').eq('dossier_id', params.id).order('created_at');
        setCharges(data || []);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase, params.id]);

  const resetForm = () => {
    setForm({ libelle: '', mensualite: '', type: 'credit_conso', soldable: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (charge: Charge) => {
    setForm({ libelle: charge.libelle, mensualite: String(charge.mensualite), type: charge.type, soldable: charge.soldable });
    setEditingId(charge.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.libelle || !form.mensualite || !cabinetId) return;
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('charges').update({
          libelle: form.libelle, mensualite: parseFloat(form.mensualite),
          type: form.type, soldable: form.soldable, updated_at: new Date().toISOString()
        }).eq('id', editingId);
        if (!error) {
          setCharges(charges.map(c => c.id === editingId ? { ...c, ...form, mensualite: parseFloat(form.mensualite) } : c));
        }
      } else {
        const { data, error } = await supabase.from('charges').insert({
          dossier_id: params.id, cabinet_id: cabinetId,
          libelle: form.libelle, mensualite: parseFloat(form.mensualite),
          type: form.type, soldable: form.soldable
        }).select().single();
        if (!error && data) setCharges([...charges, data]);
      }
      resetForm();
    } catch (e) {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette charge ?')) return;
    const { error } = await supabase.from('charges').delete().eq('id', id);
    if (!error) setCharges(charges.filter(c => c.id !== id));
  };

  const totalCharges = charges.reduce((s, c) => s + c.mensualite, 0);
  const chargesSoldables = charges.filter(c => c.soldable).reduce((s, c) => s + c.mensualite, 0);
  const chargesNonSoldables = charges.filter(c => !c.soldable).reduce((s, c) => s + c.mensualite, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">⊟ Charges mensuelles</h1>
          <p className="page-subtitle">Crédits, loyer, pensions et autres charges déclarées</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          + Ajouter une charge
        </button>
      </div>

      {/* Summary KPIs */}
      {charges.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total charges', value: formatCurrency(totalCharges) + '/mois', color: 'var(--risk-high)' },
            { label: 'Charges soldables', value: formatCurrency(chargesSoldables) + '/mois', color: 'var(--risk-medium)' },
            { label: 'Charges non soldables', value: formatCurrency(chargesNonSoldables) + '/mois', color: 'var(--text-secondary)' },
          ].map((kpi, i) => (
            <div key={i} className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">{kpi.label}</span>
              </div>
              <div className="kpi-value" style={{ color: kpi.color, fontSize: '1.25rem' }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--brand-blue)' }}>
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>
            {editingId ? 'Modifier la charge' : 'Nouvelle charge'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Libellé *</label>
              <input
                type="text"
                className="form-input"
                placeholder="ex: Crédit Renault, LCL, etc."
                value={form.libelle}
                onChange={e => setForm({ ...form, libelle: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mensualité (€) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="350"
                value={form.mensualite}
                onChange={e => setForm({ ...form, mensualite: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {TYPES_CHARGES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={form.soldable}
                onChange={e => setForm({ ...form, soldable: e.target.checked })}
                style={{ width: '1rem', height: '1rem' }}
              />
              <span>Charge soldable (peut être remboursée avant l'achat)</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleSave} disabled={saving || !form.libelle || !form.mensualite} className="btn-primary">
              {saving ? 'Enregistrement...' : editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button onClick={resetForm} style={{
              padding: '0.625rem 1.25rem', background: 'none', border: '1px solid var(--border-primary)',
              borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)'
            }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /><p>Chargement...</p></div>
      ) : charges.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p style={{ fontSize: '1.5rem' }}>⊟</p>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Aucune charge déclarée</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Ajoutez les crédits en cours, loyers et autres charges mensuelles de l'emprunteur.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary">Ajouter une charge</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Type</th>
                <th>Mensualité</th>
                <th>Soldable</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {charges.map(charge => (
                <tr key={charge.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{charge.libelle}</td>
                  <td><span className="badge badge-neutral">{getTypeLabel(charge.type)}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--risk-high)' }}>{formatCurrency(charge.mensualite)}/mois</td>
                  <td>
                    {charge.soldable ? (
                      <span className="badge badge-success">Soldable</span>
                    ) : (
                      <span className="badge badge-neutral">Non soldable</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(charge)} style={{
                        padding: '0.25rem 0.625rem', fontSize: '0.75rem', background: 'none',
                        border: '1px solid var(--border-primary)', borderRadius: '0.25rem',
                        cursor: 'pointer', color: 'var(--brand-blue)'
                      }}>Modifier</button>
                      <button onClick={() => handleDelete(charge.id)} style={{
                        padding: '0.25rem 0.625rem', fontSize: '0.75rem', background: 'none',
                        border: '1px solid var(--risk-high)', borderRadius: '0.25rem',
                        cursor: 'pointer', color: 'var(--risk-high)'
                      }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {charges.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--surface-secondary)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          💡 Ces charges sont utilisées dans le calcul du taux d'endettement. Les charges soldables peuvent être simulées comme remboursées.
        </div>
      )}
    </div>
  );
}
