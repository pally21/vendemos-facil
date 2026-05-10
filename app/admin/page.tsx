'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LogOut, Store, Users, Crown, Trash2, Check, X, Tag } from 'lucide-react';

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [tab, setTab] = useState('tiendas');
  const [msg, setMsg] = useState('');
  const [oferta, setOferta] = useState({ titulo: '', descuento: '', plan: 'pro' });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      setUser(session.user);

      const { data } = await supabase
        .from('admins')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (data) {
        setIsAdmin(true);
        await cargarDatos();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatos = async () => {
    const { data: t } = await supabase
      .from('tiendas')
      .select('*, vendedor_id')
      .order('created_at', { ascending: false });
    if (t) setTiendas(t);
  };

  const activarPlan = async (tiendaId: string, plan: string) => {
    const vence = new Date();
    vence.setMonth(vence.getMonth() + 1);
    await supabase.from('tiendas').update({
      plan,
      plan_vence_en: vence.toISOString(),
    }).eq('id', tiendaId);
    setMsg(`Plan ${plan} activado ✅`);
    setTimeout(() => setMsg(''), 3000);
    await cargarDatos();
  };

  const darAdmin = async (tiendaId: string, valor: boolean) => {
    await supabase.from('tiendas').update({ is_admin: valor }).eq('id', tiendaId);
    setMsg(valor ? 'Admin activado ✅' : 'Admin removido');
    setTimeout(() => setMsg(''), 3000);
    await cargarDatos();
  };

  const eliminarTienda = async (tiendaId: string) => {
    if (!confirm('¿Eliminar esta tienda y todos sus productos?')) return;
    await supabase.from('productos').delete().eq('tienda_id', tiendaId);
    await supabase.from('tiendas').delete().eq('id', tiendaId);
    setMsg('Tienda eliminada ✅');
    setTimeout(() => setMsg(''), 3000);
    await cargarDatos();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow text-center">
        <p className="text-gray-600 mb-4">Debes iniciar sesión</p>
        <a href="/" className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Ir al inicio</a>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow text-center">
        <p className="text-2xl mb-2">🚫</p>
        <p className="text-gray-600">No tienes acceso a esta página</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&family=Fraunces:wght@700;900&display=swap');`}</style>

      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Admin" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-black text-lg">Panel Administrador</p>
            <p className="text-gray-400 text-xs">Vendemos Fácil</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-bold transition">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-bold">{msg}</div>}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Total tiendas</p>
            <p className="text-4xl font-black text-gray-900">{tiendas.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Plan Pro</p>
            <p className="text-4xl font-black text-green-600">{tiendas.filter(t => t.plan === 'pro').length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Plan Full</p>
            <p className="text-4xl font-black text-orange-600">{tiendas.filter(t => t.plan === 'full').length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { id: 'tiendas', label: '🏪 Tiendas', icon: Store },
            { id: 'ofertas', label: '🏷️ Ofertas', icon: Tag },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${tab === t.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tiendas */}
        {tab === 'tiendas' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase">Tienda</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase">Plan</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase">Vence</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase">Admin</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tiendas.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{t.nombre}</p>
                      <p className="text-xs text-gray-400">{t.telefono}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        t.plan === 'full' ? 'bg-orange-100 text-orange-600' :
                        t.plan === 'pro' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {t.plan || 'gratis'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {t.plan_vence_en ? new Date(t.plan_vence_en).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => darAdmin(t.id, !t.is_admin)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${t.is_admin ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-400 hover:bg-yellow-100'}`}>
                        <Crown className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <select
                          onChange={e => e.target.value && activarPlan(t.id, e.target.value)}
                          defaultValue=""
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 cursor-pointer"
                        >
                          <option value="">Cambiar plan</option>
                          <option value="gratis">Gratis</option>
                          <option value="pro">Pro</option>
                          <option value="full">Full</option>
                        </select>
                        <button onClick={() => eliminarTienda(t.id)}
                          className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tiendas.length === 0 && (
              <div className="text-center py-12 text-gray-400">No hay tiendas registradas</div>
            )}
          </div>
        )}

        {/* Ofertas */}
        {tab === 'ofertas' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-lg">
            <h3 className="text-xl font-black text-gray-900 mb-6">🏷️ Crear oferta</h3>
            <p className="text-gray-500 text-sm mb-6">Las ofertas se mostrarán en la página de planes para todos los visitantes.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Título de la oferta</label>
                <input type="text" value={oferta.titulo}
                  onChange={e => setOferta(o => ({...o, titulo: e.target.value}))}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none"
                  placeholder="Ej: 50% de descuento el primer mes" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Plan al que aplica</label>
                <select value={oferta.plan} onChange={e => setOferta(o => ({...o, plan: e.target.value}))}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none bg-white">
                  <option value="pro">Pro</option>
                  <option value="full">Full</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
              <button
                onClick={() => setMsg('Oferta guardada ✅ (próximamente se mostrará en la página de planes)')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-black transition">
                Publicar oferta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
