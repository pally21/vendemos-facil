'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Store, ShoppingBag, Send, X, Eye, Lock, ChevronRight, Truck, Star, Users, Zap, Crown, Camera, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── TU NÚMERO WHATSAPP PARA CONTACTO (cambia esto) ─────────────────────────
const WHATSAPP_CONTACTO = '56912345678';

// ─── MODAL PLANES ────────────────────────────────────────────────────────────
function ModalPlanes({ onCerrar }) {
  const msgWhatsApp = encodeURIComponent(
    '¡Hola! Quiero suscribirme al plan Pro de Vende Fácil Chile para subir más productos 🛒'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-[fadeUp_.3s_ease]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] p-8 text-white text-center relative">
          <button onClick={onCerrar} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="w-7 h-7 text-yellow-900" />
          </div>
          <h2 className="text-2xl font-black font-['Fraunces']">¡Alcanzaste el límite gratis!</h2>
          <p className="text-green-100 mt-2 text-sm">Elige un plan para seguir agregando productos</p>
        </div>

        {/* Planes */}
        <div className="p-8 space-y-4">
          {/* Plan Gratis */}
          <div className="border-2 border-gray-200 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-black text-gray-800">Plan Gratis</p>
              <p className="text-sm text-gray-500 mt-0.5">Hasta 5 productos · Siempre gratis</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-gray-400">$0</p>
              <p className="text-xs text-gray-400">actual</p>
            </div>
          </div>

          {/* Plan Pro */}
          <div className="border-2 border-[#16a34a] rounded-2xl p-5 flex items-center justify-between bg-green-50 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">RECOMENDADO</div>
            <div>
              <p className="font-black text-gray-800 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" /> Plan Pro
              </p>
              <p className="text-sm text-gray-600 mt-0.5">Hasta 20 productos · Soporte prioritario</p>
              <ul className="text-xs text-gray-500 mt-2 space-y-0.5">
                <li>✅ Más productos visibles</li>
                <li>✅ Tu tienda siempre activa</li>
                <li>✅ Soporte por WhatsApp</li>
              </ul>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-2xl font-black text-[#16a34a]">$9.990</p>
              <p className="text-xs text-gray-500">/mes</p>
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_CONTACTO}?text=${msgWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#22c55e] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition shadow-lg shadow-green-200 text-lg"
          >
            <Send className="w-5 h-5" /> Contactar para suscribirme
          </a>

          <button onClick={onCerrar} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
            Ahora no, quedarme con 5 productos
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TIENDA PÚBLICA (vista del comprador) ───────────────────────────────────
function TiendaPublica({ slug }) {
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [formCompra, setFormCompra] = useState({ nombre: '', direccion: '', diaDespacho: 'sabado' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data: t } = await supabase.from('tiendas').select('*').eq('slug', slug).single();
        if (t) {
          setTienda(t);
          const { data: p } = await supabase.from('productos').select('*').eq('tienda_id', t.id);
          if (p) setProductos(p);
        }
      } catch (e) {
        setError('Tienda no encontrada');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [slug]);

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id);
      if (existe) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      const nuevaCantidad = item.cantidad + delta;
      if (nuevaCantidad <= 0) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, cantidad: nuevaCantidad } : i);
    });
  };

  const subtotal = carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);
  const delivery = subtotal > 0 && subtotal < 10000 ? 1000 : 0;
  const total = subtotal + delivery;

  const enviarPedido = () => {
    setError('');
    if (!formCompra.nombre.trim() || !formCompra.direccion.trim()) {
      setError('Por favor completa tu nombre y dirección');
      return;
    }
    if (carrito.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    let msg = `*🛒 Nuevo Pedido — ${tienda.nombre}*\n\n`;
    msg += `👤 *Cliente:* ${formCompra.nombre}\n`;
    msg += `📍 *Dirección:* ${formCompra.direccion}\n`;
    msg += `📅 *Día de Despacho:* ${formCompra.diaDespacho === 'sabado' ? 'Sábado' : 'Miércoles'}\n\n`;
    msg += `*Productos:*\n`;
    carrito.forEach(i => {
      msg += `• ${i.imagen || '📦'} ${i.nombre} x${i.cantidad} → $${(i.precio * i.cantidad).toLocaleString('es-CL')}\n`;
    });
    msg += `\n💰 *Subtotal:* $${subtotal.toLocaleString('es-CL')}`;
    if (delivery > 0) msg += `\n🚚 *Delivery:* $${delivery.toLocaleString('es-CL')}`;
    else msg += `\n🚚 *Delivery:* ¡GRATIS!`;
    msg += `\n✅ *TOTAL: $${total.toLocaleString('es-CL')}*`;

    const tel = tienda.telefono?.replace(/\D/g, '');
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
    setPedidoEnviado(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#16a34a] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[#16a34a] font-bold font-['DM_Sans']">Cargando tienda...</p>
      </div>
    </div>
  );

  if (error || !tienda) return (
    <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center">
      <div className="text-center space-y-4 bg-white p-10 rounded-2xl shadow-lg">
        <div className="text-6xl">😕</div>
        <h2 className="text-2xl font-black text-gray-800 font-['DM_Sans']">Tienda no encontrada</h2>
        <p className="text-gray-500">El link puede estar incorrecto o la tienda ya no existe.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0faf4] font-['DM_Sans']">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Fraunces:wght@700;900&display=swap');`}</style>

      {/* Header tienda */}
      <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white py-10 px-4 text-center">
        <p className="text-green-200 text-sm font-medium mb-1 uppercase tracking-widest">Tienda Online</p>
        <h1 className="text-4xl font-black font-['Fraunces']">{tienda.nombre}</h1>
        {tienda.descripcion && <p className="text-green-100 mt-2 max-w-md mx-auto">{tienda.descripcion}</p>}
        {tienda.telefono && <p className="text-green-200 text-sm mt-3">📱 {tienda.telefono}</p>}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        {/* Catálogo */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-gray-800 mb-6 font-['Fraunces']">Catálogo</h2>
          {productos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-gray-400 font-medium">Esta tienda aún no tiene productos.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {productos.map(p => {
                const enCarrito = carrito.find(i => i.id === p.id);
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden hover:shadow-md transition-all">
                    <div className="h-48 overflow-hidden bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
                      {p.imagen
                        ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                        : <Camera className="w-10 h-10 text-gray-300" />}
                    </div>
                    <div className="p-5">
                      <h3 className="font-black text-gray-800 text-lg">{p.nombre}</h3>
                      {p.descripcion && <p className="text-sm text-gray-500 mt-1">{p.descripcion}</p>}
                      <p className="text-xs text-gray-400 mt-1">📦 {p.tipo_venta}</p>
                      <p className="text-2xl font-black text-[#16a34a] mt-3">${p.precio.toLocaleString('es-CL')}</p>

                      {enCarrito ? (
                        <div className="flex items-center gap-3 mt-4">
                          <button onClick={() => cambiarCantidad(p.id, -1)} className="w-9 h-9 bg-gray-100 rounded-full font-bold text-gray-700 hover:bg-red-100 hover:text-red-600 transition flex items-center justify-center text-lg">−</button>
                          <span className="font-black text-lg text-gray-800">{enCarrito.cantidad}</span>
                          <button onClick={() => cambiarCantidad(p.id, 1)} className="w-9 h-9 bg-[#16a34a] rounded-full font-bold text-white hover:bg-[#15803d] transition flex items-center justify-center text-lg">+</button>
                        </div>
                      ) : (
                        <button onClick={() => agregarAlCarrito(p)} className="w-full mt-4 bg-[#16a34a] text-white py-2.5 rounded-xl font-bold hover:bg-[#15803d] transition flex items-center justify-center gap-2">
                          <ShoppingBag className="w-4 h-4" /> Agregar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Carrito */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <h3 className="text-xl font-black text-gray-800 mb-4 font-['Fraunces']">
              🛒 Tu Pedido {carrito.length > 0 && <span className="text-[#16a34a]">({carrito.length})</span>}
            </h3>

            {carrito.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Aún no agregaste productos</p>
            ) : (
              <>
                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                  {carrito.map(i => (
                    <div key={i.id} className="flex items-center gap-3 border-b border-gray-50 pb-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                        {i.imagen
                          ? <img src={i.imagen} alt={i.nombre} className="w-full h-full object-cover" />
                          : <ShoppingBag className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 truncate">{i.nombre}</p>
                        <p className="text-xs text-gray-500">x{i.cantidad} × ${i.precio.toLocaleString('es-CL')}</p>
                      </div>
                      <p className="font-black text-sm text-[#16a34a] shrink-0">${(i.precio * i.cantidad).toLocaleString('es-CL')}</p>
                    </div>
                  ))}
                </div>

                {/* Resumen precios */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600"><Truck className="w-3 h-3" /> Delivery</span>
                    {delivery === 0
                      ? <span className="text-[#16a34a] font-bold">¡GRATIS!</span>
                      : <span className="text-orange-600 font-bold">+$1.000</span>
                    }
                  </div>
                  {delivery > 0 && (
                    <p className="text-xs text-orange-500 mt-1">💡 Agrega ${(10000 - subtotal).toLocaleString('es-CL')} más para envío gratis</p>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-lg">
                    <span>Total</span>
                    <span className="text-[#16a34a]">${total.toLocaleString('es-CL')}</span>
                  </div>
                </div>

                {/* Datos del comprador */}
                <div className="space-y-3 mb-5">
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formCompra.nombre}
                    onChange={e => setFormCompra({ ...formCompra, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none text-sm"
                  />
                  <textarea
                    placeholder="Tu dirección de despacho"
                    value={formCompra.direccion}
                    onChange={e => setFormCompra({ ...formCompra, direccion: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none text-sm"
                    rows={2}
                  />
                  <select
                    value={formCompra.diaDespacho}
                    onChange={e => setFormCompra({ ...formCompra, diaDespacho: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none text-sm bg-white"
                  >
                    <option value="sabado">📅 Despacho Sábado</option>
                    <option value="miercoles">📅 Despacho Miércoles</option>
                  </select>
                </div>

                {error && <p className="text-red-500 text-xs mb-3 bg-red-50 rounded-lg p-2">{error}</p>}
                {pedidoEnviado && <p className="text-green-600 text-xs mb-3 bg-green-50 rounded-lg p-2">✅ ¡Pedido enviado! Revisa tu WhatsApp.</p>}

                <button
                  onClick={enviarPedido}
                  className="w-full bg-[#25D366] hover:bg-[#22c55e] text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 transition shadow-lg shadow-green-200"
                >
                  <Send className="w-4 h-4" /> Enviar por WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        Powered by <span className="font-bold text-[#16a34a]">Vende Fácil Chile</span>
      </div>
    </div>
  );
}


// ─── PÁGINA TIENDAS PÚBLICAS ─────────────────────────────────────────────────
function PaginaTiendas({ onVolver, onRegistro }) {
  const [tiendasPublicas, setTiendasPublicas] = useState([]);
  const [loadingT, setLoadingT] = useState(true);

  useEffect(() => {
    supabase.from('tiendas').select('*').then(({ data }) => {
      if (data) setTiendasPublicas(data);
      setLoadingT(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f0faf4] font-['DM_Sans']">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&family=Fraunces:wght@700;900&display=swap');`}</style>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#16a34a] rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-[#16a34a] font-['Fraunces']">Vende Fácil Chile</span>
          </div>
          <button onClick={onVolver} className="text-sm text-gray-500 hover:text-gray-700">← Volver</button>
        </nav>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-black mb-2 font-['Fraunces']">Tiendas disponibles</h2>
        <p className="text-gray-500 mb-10">Explora y compra de vendedores locales</p>
        {loadingT ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-[#16a34a] border-t-transparent rounded-full animate-spin"></div></div>
        ) : tiendasPublicas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-5xl mb-4">🏪</p>
            <p className="text-gray-500 font-medium">Aún no hay tiendas. ¡Sé el primero en crear una!</p>
            <button onClick={onRegistro} className="mt-6 px-6 py-2.5 bg-[#16a34a] text-white rounded-xl font-bold hover:bg-[#15803d] transition">Crear mi tienda</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiendasPublicas.map(t => (
              <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 hover:shadow-md transition hover:-translate-y-1">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-4">🏪</div>
                <h3 className="font-black text-gray-800 text-xl">{t.nombre}</h3>
                {t.descripcion && <p className="text-gray-500 text-sm mt-1">{t.descripcion}</p>}
                {t.telefono && <p className="text-xs text-gray-400 mt-3">📱 {t.telefono}</p>}
                <a href={`/tienda/${t.slug}`} target="_blank" rel="noopener noreferrer" className="w-full mt-4 bg-[#16a34a] text-white py-2.5 rounded-xl font-bold hover:bg-[#15803d] transition flex items-center justify-center gap-2 text-sm">
                  <Eye className="w-4 h-4" /> Ver catálogo
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ───────────────────────────────────────────────────────────
export default function VendeFacilChile() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [miTienda, setMiTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formTienda, setFormTienda] = useState({ nombre: '', descripcion: '', telefono: '' });
  const [formProducto, setFormProducto] = useState({ nombre: '', precio: '', descripcion: '', imagen: '', tipo_venta: 'individual' });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [mostrarModalPlanes, setMostrarModalPlanes] = useState(false);
  const LIMITE_GRATIS = 5;

  // ── Detectar si es una URL de tienda pública ──
  // Asumiendo que el router pasa el slug via prop o query.
  // En Next.js puedes detectarlo así:
  const [slugTienda, setSlugTienda] = useState(null);

  useEffect(() => {
    // Detecta /tienda/[slug] en la URL
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/tienda\/(.+)/);
      if (match) {
        setSlugTienda(match[1]);
        return;
      }
    }
    checkUser();
  }, []);

  // Si es tienda pública, renderizar directamente
  if (slugTienda) return <TiendaPublica slug={slugTienda} />;

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('dashboard');
        await cargarTiendaUsuario(session.user.id);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const cargarTiendaUsuario = async (userId) => {
    try {
      const { data } = await supabase.from('tiendas').select('*').eq('vendedor_id', userId).single();
      if (data) {
        setMiTienda(data);
        await cargarProductos(data.id);
      }
    } catch { }
  };

  const cargarProductos = async (tiendaId) => {
    try {
      const { data } = await supabase.from('productos').select('*').eq('tienda_id', tiendaId);
      if (data) setProductos(data);
    } catch { }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginForm.email, password: loginForm.password });
      if (error) { setError(error.message); return; }
      setUser(data.user);
      setCurrentPage('dashboard');
      setLoginForm({ email: '', password: '' });
      await cargarTiendaUsuario(data.user.id);
    } catch { setError('Error al iniciar sesión'); }
    finally { setLoading(false); }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase.auth.signUp({ email: loginForm.email, password: loginForm.password });
      if (error) { setError(error.message); return; }
      setUser(data.user);
      setCurrentPage('dashboard');
      setLoginForm({ email: '', password: '' });
    } catch { setError('Error al registrarse'); }
    finally { setLoading(false); }
  };

  const handleRecuperarPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) { setError(error.message); return; }
      setSuccessMsg('¡Listo! Revisa tu email para restablecer tu contraseña.');
    } catch { setError('Error al enviar el correo'); }
    finally { setLoading(false); }
  };

  const handleCrearTienda = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    if (!formTienda.nombre) { setError('El nombre es requerido'); setLoading(false); return; }
    try {
      const slug = formTienda.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { data, error } = await supabase.from('tiendas').insert([{
        nombre: formTienda.nombre, descripcion: formTienda.descripcion,
        telefono: formTienda.telefono, vendedor_id: user.id, slug,
      }]).select().single();
      if (error) { setError(error.message); return; }
      setMiTienda(data);
      setFormTienda({ nombre: '', descripcion: '', telefono: '' });
    } catch { setError('Error al crear tienda'); }
    finally { setLoading(false); }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('La foto no puede superar 5MB'); return; }
    setImagenFile(file);
    setImagenPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleAgregarProducto = async (e) => {
    e.preventDefault();
    setError('');
    if (productos.length >= LIMITE_GRATIS) {
      setMostrarModalPlanes(true);
      return;
    }
    if (!formProducto.nombre || !formProducto.precio) { setError('Nombre y precio requeridos'); return; }
    setLoading(true);
    try {
      let imagenUrl = '';
      if (imagenFile) {
        setSubiendoFoto(true);
        const ext = imagenFile.name.split('.').pop();
        const fileName = `${miTienda.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(fileName, imagenFile, { upsert: true });
        setSubiendoFoto(false);
        if (uploadError) { setError('Error al subir la foto: ' + uploadError.message); setLoading(false); return; }
        const { data: urlData } = supabase.storage.from('productos').getPublicUrl(fileName);
        imagenUrl = urlData.publicUrl;
      }
      const { data, error } = await supabase.from('productos').insert([{
        nombre: formProducto.nombre,
        precio: parseFloat(formProducto.precio),
        descripcion: formProducto.descripcion,
        imagen: imagenUrl,
        tipo_venta: formProducto.tipo_venta,
        tienda_id: miTienda.id,
      }]).select().single();
      if (error) { setError(error.message); return; }
      setProductos(prev => [...prev, data]);
      setFormProducto({ nombre: '', precio: '', descripcion: '', imagen: '', tipo_venta: 'individual' });
      setImagenFile(null);
      setImagenPreview(null);
      setSuccessMsg('¡Producto agregado! ✅');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { setError('Error al agregar producto'); }
    finally { setLoading(false); setSubiendoFoto(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setMiTienda(null); setProductos([]);
    setCurrentPage('home');
  };

  const verMiTienda = () => {
    if (miTienda?.slug) {
      window.open(`/tienda/${miTienda.slug}`, '_blank');
    }
  };

  const copiarLink = () => {
    const link = `${window.location.origin}/tienda/${miTienda?.slug}`;
    navigator.clipboard.writeText(link);
    setSuccessMsg('¡Link copiado! 📋');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ════════════════════════════════════════════════
  // HOME
  // ════════════════════════════════════════════════
  if (currentPage === 'home' && !user) {
    return (
      <div className="min-h-screen bg-[#f0faf4] font-['DM_Sans']">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Fraunces:wght@700;900&display=swap');
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
          .anim-1{animation:fadeUp .6s ease both}
          .anim-2{animation:fadeUp .6s .15s ease both}
          .anim-3{animation:fadeUp .6s .3s ease both}
          .anim-4{animation:fadeUp .6s .45s ease both}
          .float{animation:float 3s ease-in-out infinite}
          .card-hover{transition:all .25s ease}
          .card-hover:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(22,163,74,.15)}
        `}</style>

        {/* NAV */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#16a34a] rounded-xl flex items-center justify-center shadow-md">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-[#16a34a] font-['Fraunces']">Vende Fácil Chile</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCurrentPage('login'); setError(''); }} className="px-5 py-2 text-[#16a34a] border-2 border-[#16a34a] rounded-xl font-bold hover:bg-green-50 transition text-sm">Ingresar</button>
              <button onClick={() => { setCurrentPage('registro'); setError(''); }} className="px-5 py-2 bg-[#16a34a] text-white rounded-xl font-bold hover:bg-[#15803d] transition text-sm shadow-md">Crear cuenta</button>
            </div>
          </nav>
        </header>

        {/* HERO */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="anim-1 inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-bold">
              <Zap className="w-4 h-4" /> Gratis para vendedores chilenos
            </div>
            <h1 className="anim-2 text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] font-['Fraunces']">
              Tu tienda online en <span className="text-[#16a34a]">5 minutos</span>
            </h1>
            <p className="anim-3 text-xl text-gray-600 leading-relaxed">
              Vende ropa, frutas, artesanía, accesorios... Sube tus productos y recibe pedidos directo por WhatsApp. Sin comisiones.
            </p>
            <div className="anim-4 flex flex-col sm:flex-row gap-4">
              <button onClick={() => { setCurrentPage('registro'); setError(''); }} className="group px-8 py-4 bg-[#16a34a] text-white rounded-2xl font-black text-lg hover:bg-[#15803d] transition shadow-xl shadow-green-200 flex items-center gap-2 justify-center">
                Comenzar gratis <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setCurrentPage('tiendas')} className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl font-bold text-lg hover:border-green-400 hover:text-[#16a34a] transition flex items-center gap-2 justify-center">
                <Eye className="w-5 h-5" /> Ver tiendas
              </button>
            </div>
            <p className="anim-4 text-sm text-gray-400">✅ Sin tarjeta de crédito &nbsp;·&nbsp; ✅ Sin comisiones &nbsp;·&nbsp; ✅ 100% gratis</p>
          </div>

          {/* Visual decorativo */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-80 h-80">
              {/* Círculo de fondo */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-orange-100 rounded-full"></div>
              {/* Cards flotantes */}
              <div className="float absolute top-6 left-4 bg-white rounded-2xl p-4 shadow-xl border border-green-100">
                <p className="text-3xl">📸</p>
                <p className="font-black text-sm mt-1">Tomates cherry</p>
                <p className="text-[#16a34a] font-black">$2.500/kg</p>
              </div>
              <div className="float absolute bottom-8 right-2 bg-white rounded-2xl p-4 shadow-xl border border-orange-100" style={{ animationDelay: '1s' }}>
                <p className="text-3xl">👗</p>
                <p className="font-black text-sm mt-1">Blusa floral</p>
                <p className="text-[#16a34a] font-black">$12.990</p>
              </div>
              <div className="float absolute top-1/2 right-0 -translate-y-1/2 bg-white rounded-2xl p-3 shadow-xl border border-teal-100" style={{ animationDelay: '.5s' }}>
                <p className="text-2xl">🧁</p>
                <p className="font-black text-xs mt-1">Cupcakes x6</p>
                <p className="text-[#16a34a] font-black text-sm">$8.000</p>
              </div>
              {/* Badge pedido */}
              <div className="absolute bottom-4 left-2 bg-[#25D366] text-white rounded-2xl px-4 py-2 shadow-lg text-xs font-bold flex items-center gap-2">
                <Send className="w-3 h-3" /> ¡Pedido recibido por WhatsApp!
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-[#16a34a] text-white py-14">
          <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-black font-['Fraunces']">100%</p>
              <p className="text-green-200 mt-2 font-medium">Gratuito para vendedores</p>
            </div>
            <div>
              <p className="text-5xl font-black font-['Fraunces']">0%</p>
              <p className="text-green-200 mt-2 font-medium">Comisión por venta</p>
            </div>
            <div>
              <p className="text-5xl font-black font-['Fraunces']">5 min</p>
              <p className="text-green-200 mt-2 font-medium">Para tener tu tienda lista</p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-4 font-['Fraunces']">¿Cómo funciona?</h2>
          <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">Tres pasos y ya tienes tu catálogo listo para compartir</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: '01', icon: <Store className="w-8 h-8" />, title: 'Crea tu tienda', desc: 'Registra una cuenta, ponle nombre a tu tienda y agrega el número de WhatsApp donde recibirás los pedidos.', color: 'green' },
              { n: '02', icon: <ShoppingBag className="w-8 h-8" />, title: 'Sube tus productos', desc: 'Sube fotos reales de tus productos, ponles precio y descripción. Puede ser ropa, comida, artesanía, lo que sea.', color: 'orange' },
              { n: '03', icon: <Send className="w-8 h-8" />, title: 'Comparte y vende', desc: 'Copia el link de tu tienda y compártelo en Instagram, WhatsApp o donde quieras. Los clientes te escriben directo.', color: 'teal' },
            ].map(f => (
              <div key={f.n} className={`card-hover p-8 rounded-2xl bg-white border-2 ${f.color === 'green' ? 'border-green-100' : f.color === 'orange' ? 'border-orange-100' : 'border-teal-100'} shadow-sm`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${f.color === 'green' ? 'bg-green-100 text-[#16a34a]' : f.color === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
                  {f.icon}
                </div>
                <p className={`text-sm font-black mb-2 ${f.color === 'green' ? 'text-green-400' : f.color === 'orange' ? 'text-orange-300' : 'text-teal-300'}`}>{f.n}</p>
                <h3 className="text-xl font-black text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DELIVERY INFO */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="text-6xl">🚚</div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 font-['Fraunces'] mb-2">Delivery inteligente</h3>
              <p className="text-gray-600 max-w-lg">Los pedidos bajo <strong>$10.000</strong> incluyen automáticamente <strong>$1.000 de costo de despacho</strong>. Los pedidos iguales o mayores a $10.000 tienen <strong className="text-[#16a34a]">envío gratis</strong>. Todo se calcula automáticamente para tus clientes.</p>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-gray-900 text-white py-20">
          <div className="max-w-3xl mx-auto text-center px-6 space-y-6">
            <h2 className="text-4xl font-black font-['Fraunces']">¿Listo para vender?</h2>
            <p className="text-gray-400 text-lg">Únete a los vendedores que ya tienen su tienda online. Es gratis, siempre.</p>
            <button onClick={() => { setCurrentPage('registro'); setError(''); }} className="inline-flex items-center gap-2 px-10 py-4 bg-[#16a34a] text-white rounded-2xl font-black text-xl hover:bg-[#15803d] transition shadow-2xl shadow-green-900">
              Crear mi tienda gratis <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        <footer className="text-center py-8 text-sm text-gray-400 bg-gray-900 border-t border-gray-800">
          © {new Date().getFullYear()} Vende Fácil Chile — Hecho con ❤️ en Chile
        </footer>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════════════
  if (currentPage === 'login' && !user) {
    return (
      <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center p-4 font-['DM_Sans']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&family=Fraunces:wght@700;900&display=swap');`}</style>
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#16a34a] rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1 text-center font-['Fraunces']">Ingresar</h2>
          <p className="text-gray-500 text-sm text-center mb-8">Accede a tu tienda</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Contraseña</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#16a34a] text-white py-3.5 rounded-xl font-black hover:bg-[#15803d] transition disabled:opacity-50 shadow-lg shadow-green-200">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center">
            <button onClick={() => { setCurrentPage('recuperar'); setError(''); setSuccessMsg(''); }} className="text-sm text-gray-500 hover:text-[#16a34a] flex items-center justify-center gap-1 transition">
              <Lock className="w-3.5 h-3.5" /> Olvidé mi contraseña
            </button>
            <button onClick={() => { setCurrentPage('registro'); setError(''); }} className="text-sm text-[#16a34a] font-bold hover:underline">
              ¿No tienes cuenta? Regístrate gratis
            </button>
            <button onClick={() => setCurrentPage('home')} className="text-sm text-gray-400 hover:text-gray-600">← Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // REGISTRO
  // ════════════════════════════════════════════════
  if (currentPage === 'registro' && !user) {
    return (
      <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center p-4 font-['DM_Sans']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&family=Fraunces:wght@700;900&display=swap');`}</style>
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1 text-center font-['Fraunces']">Crear cuenta</h2>
          <p className="text-gray-500 text-sm text-center mb-8">Empieza a vender hoy, gratis</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

          <form onSubmit={handleRegistro} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Contraseña</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition" placeholder="Mínimo 6 caracteres" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-black hover:bg-orange-600 transition disabled:opacity-50 shadow-lg shadow-orange-200">
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center">
            <button onClick={() => { setCurrentPage('login'); setError(''); }} className="text-sm text-[#16a34a] font-bold hover:underline">
              ¿Ya tienes cuenta? Ingresa aquí
            </button>
            <button onClick={() => setCurrentPage('home')} className="text-sm text-gray-400 hover:text-gray-600">← Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // RECUPERAR CONTRASEÑA
  // ════════════════════════════════════════════════
  if (currentPage === 'recuperar') {
    return (
      <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center p-4 font-['DM_Sans']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&family=Fraunces:wght@700;900&display=swap');`}</style>
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1 text-center font-['Fraunces']">Recuperar contraseña</h2>
          <p className="text-gray-500 text-sm text-center mb-8">Te enviaremos un link para restablecer tu contraseña</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
          {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{successMsg}</div>}

          {!successMsg && (
            <form onSubmit={handleRecuperarPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tu email</label>
                <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition" placeholder="tu@email.com" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-black hover:bg-blue-600 transition disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>
            </form>
          )}

          <button onClick={() => { setCurrentPage('login'); setError(''); setSuccessMsg(''); }} className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600">← Volver al login</button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // VER TIENDAS (público)
  // ════════════════════════════════════════════════
  if (currentPage === 'tiendas') {
    return <PaginaTiendas onVolver={() => setCurrentPage('home')} onRegistro={() => setCurrentPage('registro')} />;
  }

  // ════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════
  if (user && currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 font-['DM_Sans']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&family=Fraunces:wght@700;900&display=swap');`}</style>
        {mostrarModalPlanes && <ModalPlanes onCerrar={() => setMostrarModalPlanes(false)} />}

        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#16a34a] rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-[#16a34a] font-['Fraunces']">Vende Fácil Chile</span>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition font-bold text-sm">
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>
          </nav>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {!miTienda ? (
            /* ── Crear tienda ── */
            <div className="bg-white rounded-3xl shadow-lg p-10 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-[#16a34a]" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 font-['Fraunces']">Crea tu tienda</h2>
                <p className="text-gray-500 mt-2">Completa los datos para empezar a vender</p>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

              <form onSubmit={handleCrearTienda} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre de tu tienda *</label>
                  <input type="text" value={formTienda.nombre} onChange={e => setFormTienda({ ...formTienda, nombre: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition" placeholder="Ej: La Cosecha del Abuelo" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción</label>
                  <textarea value={formTienda.descripcion} onChange={e => setFormTienda({ ...formTienda, descripcion: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition" placeholder="¿Qué vendes?" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Teléfono WhatsApp *</label>
                  <input type="tel" value={formTienda.telefono} onChange={e => setFormTienda({ ...formTienda, telefono: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition" placeholder="+56912345678" />
                  <p className="text-xs text-gray-400 mt-1">Los pedidos llegarán a este número</p>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#16a34a] text-white py-4 rounded-xl font-black hover:bg-[#15803d] transition disabled:opacity-50 shadow-lg shadow-green-200">
                  {loading ? 'Creando...' : '🚀 Crear mi tienda'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Banner tienda */}
              <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-10"></div>
                <div className="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-10"></div>
                <div className="relative z-10">
                  <p className="text-green-200 text-sm font-medium uppercase tracking-widest mb-1">Tu tienda</p>
                  <h2 className="text-3xl font-black font-['Fraunces']">{miTienda.nombre}</h2>
                  {miTienda.descripcion && <p className="text-green-100 mt-1">{miTienda.descripcion}</p>}

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <button onClick={verMiTienda} className="flex items-center gap-2 bg-white text-[#16a34a] px-5 py-2.5 rounded-xl font-black hover:bg-green-50 transition text-sm shadow-md">
                      <Eye className="w-4 h-4" /> Ver mi tienda online
                    </button>
                    <button onClick={copiarLink} className="flex items-center gap-2 bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-white/30 transition text-sm">
                      📋 Copiar link
                    </button>
                  </div>

                  <p className="text-green-200 text-xs mt-3 font-mono">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/tienda/{miTienda.slug}
                  </p>
                </div>
              </div>

              {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{successMsg}</div>}

              {/* Barra de uso de productos */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700">Productos usados</span>
                  <span className="text-sm font-black text-gray-800">{productos.length} / {productos.length >= LIMITE_GRATIS ? '20' : LIMITE_GRATIS}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all ${productos.length >= LIMITE_GRATIS ? 'bg-orange-500' : 'bg-[#16a34a]'}`}
                    style={{ width: `${Math.min((productos.length / (productos.length >= LIMITE_GRATIS ? 20 : LIMITE_GRATIS)) * 100, 100)}%` }}
                  />
                </div>
                {productos.length >= LIMITE_GRATIS ? (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-orange-600 font-medium">⚠️ Límite del plan gratis alcanzado</p>
                    <button onClick={() => setMostrarModalPlanes(true)} className="text-xs font-black text-[#16a34a] hover:underline flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Ver Plan Pro →
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">Plan gratis: hasta {LIMITE_GRATIS} productos. <button onClick={() => setMostrarModalPlanes(true)} className="text-[#16a34a] font-bold hover:underline">Ver planes</button></p>
                )}
              </div>

              {/* Agregar producto */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-6 font-['Fraunces'] flex items-center gap-2">
                  <Plus className="w-6 h-6 text-[#16a34a]" /> Agregar producto
                </h3>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">{error}</div>}

                <form onSubmit={handleAgregarProducto} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre *</label>
                      <input type="text" value={formProducto.nombre} onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition" placeholder="Tomates cherry" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Precio ($) *</label>
                      <input type="number" value={formProducto.precio} onChange={e => setFormProducto({ ...formProducto, precio: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition" placeholder="2500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción</label>
                    <textarea value={formProducto.descripcion} onChange={e => setFormProducto({ ...formProducto, descripcion: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition" placeholder="Orgánicos, cosecha fresca..." rows={2} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Foto del producto</label>
                      <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#16a34a] hover:bg-green-50 transition overflow-hidden" style={{minHeight:'120px'}}>
                        {imagenPreview ? (
                          <div className="relative w-full">
                            <img src={imagenPreview} alt="preview" className="w-full h-36 object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                              <p className="text-white text-xs font-bold">Cambiar foto</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 gap-2">
                            <ImagePlus className="w-8 h-8 text-gray-400" />
                            <p className="text-sm text-gray-500 font-medium">Clic para subir foto</p>
                            <p className="text-xs text-gray-400">JPG, PNG · máx. 5MB</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipo de venta</label>
                      <select value={formProducto.tipo_venta} onChange={e => setFormProducto({ ...formProducto, tipo_venta: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition bg-white">
                        <option value="individual">Individual</option>
                        <option value="kg">Por Kg</option>
                        <option value="docena">Por Docena</option>
                        <option value="paquete">Por Paquete</option>
                        <option value="bolsa">Por Bolsa</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#16a34a] text-white py-3 rounded-xl font-black hover:bg-[#15803d] transition disabled:opacity-50 shadow-lg shadow-green-100">
                    {subiendoFoto ? 'Subiendo foto...' : loading ? 'Guardando...' : '+ Agregar producto'}
                  </button>
                </form>
              </div>

              {/* Mis productos */}
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-6 font-['Fraunces']">
                  Mis productos <span className="text-[#16a34a]">({productos.length})</span>
                </h3>
                {productos.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-5xl mb-4">📦</p>
                    <p className="text-gray-400 font-medium">Aún no tienes productos. ¡Agrega el primero!</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {productos.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                        <div className="h-40 overflow-hidden bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
                          {p.imagen
                            ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                            : <Camera className="w-10 h-10 text-gray-300" />}
                        </div>
                        <div className="p-5">
                          <h4 className="font-black text-gray-800">{p.nombre}</h4>
                          {p.descripcion && <p className="text-sm text-gray-500 mt-1">{p.descripcion}</p>}
                          <p className="text-xs text-gray-400 mt-1">📦 {p.tipo_venta}</p>
                          <p className="text-xl font-black text-[#16a34a] mt-3">${p.precio.toLocaleString('es-CL')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
