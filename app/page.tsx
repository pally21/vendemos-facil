'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Store, ShoppingBag, Send, X, Eye, Lock, ChevronRight, Truck, Star, Users, Zap, Crown, Camera, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── TU NÚMERO WHATSAPP PARA CONTACTO (cambia esto) ─────────────────────────
const WHATSAPP_CONTACTO = '56912345678';

// ─── Etiquetas claras para tipo de venta ────────────────────────────────────
const ETIQUETAS_VENTA = {
  individual: '📦 Por unidad',
  kg:         '⚖️ Precio por kilo',
  docena:     '🥚 Precio por docena (12 unidades)',
  paquete:    '📦 Precio por paquete',
  bolsa:      '🛍️ Precio por bolsa',
};

// ─── MODAL EDITAR PRODUCTO ───────────────────────────────────────────────────
function ModalEditarProducto({ producto, onCerrar, onGuardar, loading, error }) {
  const [form, setForm] = useState({
    id: producto.id,
    nombre: producto.nombre || '',
    precio: producto.precio || '',
    descripcion: producto.descripcion || '',
    imagen: producto.imagen || '',
    tipo_venta: producto.tipo_venta || 'individual',
    imagenFile: null,
    imagenPreview: producto.imagen || '',
  });

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, imagenFile: file, imagenPreview: URL.createObjectURL(file) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full my-4">
        <div className="bg-gradient-to-r from-[#16a34a] to-[#ea580c] p-6 text-white rounded-t-3xl flex justify-between items-center">
          <h2 className="text-xl font-black font-['Fraunces']">Editar producto</h2>
          <button onClick={onCerrar} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

          {/* Foto */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Foto</label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#16a34a] transition overflow-hidden" style={{minHeight:'120px'}}>
              {form.imagenPreview
                ? <img src={form.imagenPreview} alt="preview" className="w-full h-36 object-cover" />
                : <div className="flex flex-col items-center py-6 gap-2"><ImagePlus className="w-8 h-8 text-gray-400" /><p className="text-sm text-gray-500">Cambiar foto</p></div>
              }
              <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Precio ($)</label>
            <input
              type="number"
              value={form.precio}
              onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none"
              rows={3}
              placeholder="Describe el producto..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipo de venta</label>
            <select
              value={form.tipo_venta}
              onChange={e => setForm(f => ({ ...f, tipo_venta: e.target.value }))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none bg-white"
            >
              <option value="individual">Individual</option>
              <option value="kg">Por Kg</option>
              <option value="docena">Por Docena</option>
              <option value="paquete">Por Paquete</option>
              <option value="bolsa">Por Bolsa</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onCerrar} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button
              onClick={() => onGuardar(form)}
              disabled={loading}
              className="flex-1 py-3 bg-[#16a34a] hover:bg-[#ea580c] text-white rounded-xl font-black transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL PLANES ────────────────────────────────────────────────────────────
function ModalPlanes({ onCerrar, productoCount, miTienda, userEmail }: any) {
  const [pagando, setPagando] = useState<string | null>(null);
  const [errorPago, setErrorPago] = useState('');

  const handlePagar = async (plan: string) => {
    if (!miTienda?.id || !userEmail) { setErrorPago('Error: no se pudo identificar tu tienda'); return; }
    setPagando(plan);
    setErrorPago('');
    try {
      const res = await fetch('/api/flow/crear-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, tiendaId: miTienda.id, email: userEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorPago('Error al conectar con Flow. Intenta de nuevo.');
      }
    } catch {
      setErrorPago('Error al procesar el pago.');
    } finally {
      setPagando(null);
    }
  };

  const planes = [
    {
      nombre: 'Gratis',
      precio: '$0',
      periodo: 'siempre',
      limite: '1 a 5 fotos',
      features: ['5 fotos de productos', 'Catálogo online', 'Pedidos por WhatsApp'],
      color: 'gray',
      pagar: false,
    },
    {
      nombre: 'Pro',
      precio: '$9.990 + IVA',
      periodo: '/mes',
      limite: 'Hasta 20 fotos',
      features: ['De 6 a 20 fotos', 'Catálogo online', 'Pedidos por WhatsApp', 'Soporte prioritario'],
      recomendado: true,
      color: 'green',
      pagar: true,
    },
    {
      nombre: 'Full',
      precio: '$19.990 + IVA',
      periodo: '/mes',
      limite: 'Fotos ilimitadas',
      features: ['Fotos ilimitadas', 'Catálogo online', 'Pedidos por WhatsApp', 'Soporte prioritario', 'Acceso completo'],
      color: 'orange',
      pagar: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-4">
        <div className="bg-gradient-to-r from-[#16a34a] to-[#ea580c] p-8 text-white text-center relative">
          <button onClick={onCerrar} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="w-7 h-7 text-yellow-900" />
          </div>
          <h2 className="text-2xl font-black font-['Fraunces']">¡Alcanzaste el límite!</h2>
          <p className="text-green-100 mt-2">Tienes {productoCount} fotos del plan gratis. Elige un plan para seguir creciendo.</p>
        </div>

        <div className="p-6 grid sm:grid-cols-3 gap-4">
          {planes.map(plan => (
            <div key={plan.nombre} className={`rounded-2xl border-2 p-5 flex flex-col relative ${
              plan.recomendado ? 'border-[#16a34a] bg-green-50' :
              plan.color === 'orange' ? 'border-orange-400 bg-orange-50' :
              'border-gray-200 bg-gray-50'
            }`}>
              {plan.recomendado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                  ⭐ RECOMENDADO
                </div>
              )}
              <p className={`font-black text-lg ${plan.color === 'green' ? 'text-[#16a34a]' : plan.color === 'orange' ? 'text-orange-600' : 'text-gray-500'}`}>
                {plan.nombre}
              </p>
              <div className="mt-2 mb-1">
                <span className={`text-xl font-black ${plan.color === 'green' ? 'text-[#16a34a]' : plan.color === 'orange' ? 'text-orange-600' : 'text-gray-400'}`}>
                  {plan.precio}
                </span>
                <span className="text-xs text-gray-500 ml-1">{plan.periodo}</span>
              </div>
              <p className="text-sm font-black text-gray-700 mb-3">📦 {plan.limite}</p>
              <ul className="space-y-1.5 flex-1 mb-5">
                {plan.features.map(f => (
                  <li key={f} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-[#16a34a] mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              {plan.pagar ? (
                <button
                  onClick={() => handlePagar(plan.nombre.toLowerCase())}
                  disabled={pagando === plan.nombre.toLowerCase()}
                  className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50 ${
                    plan.color === 'green'
                      ? 'bg-[#16a34a] hover:bg-[#ea580c] text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {pagando === plan.nombre.toLowerCase() ? 'Redirigiendo...' : '💳 Pagar con Flow'}
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-xl font-black text-sm text-center bg-gray-200 text-gray-500">
                  Plan actual
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          {errorPago && <p className="text-red-500 text-xs text-center mb-3">{errorPago}</p>}
          <button onClick={onCerrar} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
            Ahora no, seguir con 5 fotos
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
  const [formCompra, setFormCompra] = useState({ nombre: '', telefono: '', direccion: '', diaDespacho: 'sabado', otroDia: '', pago: 'efectivo' });
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
  const recargoDia = formCompra.diaDespacho === 'otro' ? 1000 : 0;
  const total = subtotal + delivery + recargoDia;

  const enviarPedido = () => {
    setError('');
    if (!formCompra.nombre.trim() || !formCompra.direccion.trim()) {
      setError('Por favor completa tu nombre y dirección');
      return;
    }
    if (formCompra.diaDespacho === 'otro' && !formCompra.otroDia.trim()) {
      setError('Por favor indica qué día quieres el despacho');
      return;
    }
    if (carrito.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    const diaTexto = formCompra.diaDespacho === 'sabado' ? 'Sábado'
      : formCompra.diaDespacho === 'miercoles' ? 'Miércoles'
      : `Otro día: ${formCompra.otroDia}`;
    let msg = `*🛒 Nuevo Pedido — ${tienda.nombre}*\n\n`;
    msg += `👤 *Cliente:* ${formCompra.nombre}\n`;
    if (formCompra.telefono) msg += `📱 *Teléfono:* ${formCompra.telefono}\n`;
    msg += `📍 *Dirección:* ${formCompra.direccion}\n`;
    msg += `📅 *Día de Despacho:* ${diaTexto}\n`;
    msg += `💳 *Forma de pago:* ${formCompra.pago === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia'}\n\n`;
    msg += `*Productos:*\n`;
    carrito.forEach(i => {
      msg += `• ${i.nombre} x${i.cantidad} → $${(i.precio * i.cantidad).toLocaleString('es-CL')}\n`;
    });
    msg += `\n💰 *Subtotal:* $${subtotal.toLocaleString('es-CL')}`;
    if (delivery > 0) msg += `\n🚚 *Delivery:* $${delivery.toLocaleString('es-CL')}`;
    else msg += `\n🚚 *Delivery:* ¡GRATIS!`;
    if (recargoDia > 0) msg += `\n📅 *Recargo día especial:* $${recargoDia.toLocaleString('es-CL')}`;
    msg += `\n\n✅ *TOTAL: $${total.toLocaleString('es-CL')}*`;

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
      <div className="bg-gradient-to-r from-[#16a34a] to-[#ea580c] text-white py-10 px-4 text-center">
        {tienda.logo_url && (
          <div className="flex justify-center mb-4">
            <img src={tienda.logo_url} alt={tienda.nombre} className="h-20 w-auto object-contain rounded-2xl shadow-lg bg-white/10 p-1" />
          </div>
        )}
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
                    {/* Foto */}
                    <div className="h-52 overflow-hidden bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
                      {p.imagen
                        ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" style={{objectPosition: p.imagen_posicion || 'center'}} />
                        : <Camera className="w-10 h-10 text-gray-300" />}
                    </div>

                    <div className="p-5">
                      {/* Nombre */}
                      <h3 className="font-black text-gray-900 text-xl leading-tight">{p.nombre}</h3>

                      {/* Descripción */}
                      {p.descripcion && <p className="text-base text-gray-500 mt-1 leading-snug">{p.descripcion}</p>}

                      {/* Tipo de venta — bien visible */}
                      <div className="mt-3 inline-flex items-center bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                        <span className="text-sm font-bold text-green-700">{ETIQUETAS_VENTA[p.tipo_venta] || p.tipo_venta}</span>
                      </div>

                      {/* Precio grande */}
                      <p className="text-3xl font-black text-[#16a34a] mt-3">${p.precio.toLocaleString('es-CL')}</p>

                      {/* Botones cantidad / agregar */}
                      {enCarrito ? (
                        <div className="mt-4">
                          <p className="text-xs text-gray-400 font-medium mb-2 text-center">Cantidad seleccionada</p>
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => cambiarCantidad(p.id, -1)}
                              className="flex-1 h-14 bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-600 rounded-2xl font-black text-3xl transition select-none flex items-center justify-center"
                              style={{touchAction:'manipulation'}}
                            >
                              −
                            </button>
                            <div className="flex flex-col items-center min-w-[48px]">
                              <span className="font-black text-3xl text-gray-900 leading-none">{enCarrito.cantidad}</span>
                              <span className="text-xs text-gray-400 mt-0.5">
                                {p.tipo_venta === 'kg' ? 'kilos' : p.tipo_venta === 'docena' ? 'docenas' : 'unidades'}
                              </span>
                            </div>
                            <button
                              onClick={() => cambiarCantidad(p.id, 1)}
                              className="flex-1 h-14 bg-[#16a34a] hover:bg-[#ea580c] active:bg-[#166534] text-white rounded-2xl font-black text-3xl transition select-none flex items-center justify-center"
                              style={{touchAction:'manipulation'}}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-center text-sm font-bold text-gray-500 mt-2">
                            Subtotal: <span className="text-[#16a34a]">${(p.precio * enCarrito.cantidad).toLocaleString('es-CL')}</span>
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => agregarAlCarrito(p)}
                          className="w-full mt-4 bg-[#16a34a] hover:bg-[#ea580c] active:bg-[#166534] text-white py-4 rounded-2xl font-black text-lg transition flex items-center justify-center gap-2 select-none"
                          style={{touchAction:'manipulation'}}
                        >
                          <ShoppingBag className="w-5 h-5" /> Agregar al pedido
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
                <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal productos</span>
                    <span className="font-bold">${subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600"><Truck className="w-3 h-3" /> Delivery</span>
                    {delivery === 0
                      ? <span className="text-[#16a34a] font-bold">¡GRATIS!</span>
                      : <span className="text-orange-500 font-bold">+$1.000</span>
                    }
                  </div>
                  {delivery > 0 && subtotal < 10000 && (
                    <p className="text-xs text-orange-400">💡 Agrega ${(10000 - subtotal).toLocaleString('es-CL')} más para envío gratis</p>
                  )}
                  {recargoDia > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">🗓️ Día especial</span>
                      <span className="text-orange-500 font-bold">+$1.000</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-xl">
                    <span>Total</span>
                    <span className="text-[#16a34a]">${total.toLocaleString('es-CL')}</span>
                  </div>
                </div>

                {/* Datos del comprador */}
                <div className="space-y-3 mb-5">

                  {/* Nombre */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1 uppercase tracking-wide">👤 Tu nombre</label>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={formCompra.nombre}
                      onChange={e => setFormCompra({ ...formCompra, nombre: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none text-base"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1 uppercase tracking-wide">📱 Tu teléfono (opcional)</label>
                    <input
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={formCompra.telefono}
                      onChange={e => setFormCompra({ ...formCompra, telefono: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none text-base"
                    />
                  </div>

                  {/* Dirección */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1 uppercase tracking-wide">📍 Dirección de despacho</label>
                    <textarea
                      placeholder="Calle, número, comuna..."
                      value={formCompra.direccion}
                      onChange={e => setFormCompra({ ...formCompra, direccion: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none text-base"
                      rows={2}
                    />
                  </div>

                  {/* Día de despacho */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-wide">📅 Día de despacho</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'sabado',    emoji: '📅', label: 'Sábado',     sub: 'Sin recargo' },
                        { val: 'miercoles', emoji: '📅', label: 'Miércoles',  sub: 'Sin recargo' },
                        { val: 'otro',      emoji: '🗓️', label: 'Otro día',   sub: '+$1.000' },
                      ].map(op => (
                        <button
                          key={op.val}
                          type="button"
                          onClick={() => setFormCompra({ ...formCompra, diaDespacho: op.val, otroDia: '' })}
                          className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl border-2 transition text-center ${
                            formCompra.diaDespacho === op.val
                              ? 'border-[#16a34a] bg-green-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl">{op.emoji}</span>
                          <span className={`font-black text-sm mt-1 ${formCompra.diaDespacho === op.val ? 'text-[#16a34a]' : 'text-gray-700'}`}>{op.label}</span>
                          <span className={`text-xs mt-0.5 font-medium ${op.val === 'otro' ? 'text-orange-500' : 'text-gray-400'}`}>{op.sub}</span>
                        </button>
                      ))}
                    </div>
                    {formCompra.diaDespacho === 'otro' && (
                      <input
                        type="text"
                        placeholder="¿Qué día? Ej: Lunes 12 de enero"
                        value={formCompra.otroDia}
                        onChange={e => setFormCompra({ ...formCompra, otroDia: e.target.value })}
                        className="w-full mt-2 px-4 py-3 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none text-base"
                      />
                    )}
                  </div>

                  {/* Forma de pago */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-wide">💳 Forma de pago</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 'efectivo',      emoji: '💵', label: 'Efectivo' },
                        { val: 'transferencia', emoji: '🏦', label: 'Transferencia' },
                      ].map(op => (
                        <button
                          key={op.val}
                          type="button"
                          onClick={() => setFormCompra({ ...formCompra, pago: op.val })}
                          className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-black text-base transition ${
                            formCompra.pago === op.val
                              ? 'border-[#16a34a] bg-green-50 text-[#16a34a]'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl">{op.emoji}</span> {op.label}
                        </button>
                      ))}
                    </div>
                  </div>

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

      {/* Aviso legal */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-amber-800 font-black text-sm mb-2">⚠️ Aviso importante para compradores</p>
          <p className="text-amber-700 text-xs leading-relaxed">
            Vendemos Fácil es una plataforma de apoyo para vendedores independientes. No somos responsables por daños, perjuicios o inconvenientes derivados de las transacciones realizadas entre compradores y vendedores. Te recomendamos:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-amber-700">
            <li>✓ Verificar siempre las condiciones de entrega antes de confirmar tu pedido</li>
            <li>✓ Coordinar entregas en lugares seguros y públicos (metro, comisaría, mall, etc.)</li>
            <li>✓ Confirmar los métodos de pago directamente con el vendedor</li>
            <li>✓ Guardar los registros de tu conversación por WhatsApp</li>
          </ul>
        </div>
      </div>

      <div className="text-center py-6 text-xs text-gray-400">
        Powered by <span className="font-bold text-[#16a34a]">Vendemos Fácil</span>
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
      <header className="sticky top-0 z-50 bg-white backdrop-blur-md border-b-2 border-orange-100 shadow-sm">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#16a34a] rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-[#16a34a] font-['Fraunces']">Vendemos Fácil</span>
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

// ─── EDITAR TIENDA ───────────────────────────────────────────────────────────
function EditarTienda({ miTienda, setMiTienda, setSuccessMsg }: any) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: miTienda.nombre || '',
    descripcion: miTienda.descripcion || '',
    telefono: miTienda.telefono || '',
    delivery_costo: miTienda.delivery_costo || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuardar = async () => {
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase
        .from('tiendas')
        .update({
          nombre: form.nombre,
          descripcion: form.descripcion,
          telefono: form.telefono,
          delivery_costo: parseInt(form.delivery_costo) || 0,
        })
        .eq('id', miTienda.id)
        .select()
        .single();
      if (error) { setError(error.message); return; }
      setMiTienda(data);
      setEditando(false);
      setSuccessMsg('Tienda actualizada ✅');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { setError('Error al actualizar'); }
    finally { setLoading(false); }
  };

  if (!editando) return (
    <button
      onClick={() => setEditando(true)}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#16a34a] font-bold transition"
    >
      ✏️ Editar datos de mi tienda
    </button>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">✏️ Editar datos de tu tienda</h3>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm mb-4">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la tienda</label>
          <input type="text" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
          <textarea value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono WhatsApp</label>
          <input type="tel" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none" placeholder="+56912345678" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">🚚 Costo de delivery ($)</label>
          <input type="number" value={form.delivery_costo} onChange={e => setForm(f => ({...f, delivery_costo: e.target.value}))}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none" placeholder="0 = gratis" />
          <p className="text-xs text-gray-400 mt-1">El comprador verá este costo al hacer su pedido</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditando(false)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition text-sm">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={loading} className="flex-1 py-2.5 bg-[#16a34a] hover:bg-[#ea580c] text-white rounded-xl font-black transition disabled:opacity-50 text-sm">
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
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

  const [formTienda, setFormTienda] = useState({ nombre: '', descripcion: '', telefono: '', delivery_costo: '' });
  const [formProducto, setFormProducto] = useState({ nombre: '', precio: '', descripcion: '', imagen: '', tipo_venta: 'individual', imagen_posicion: 'center' });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [mostrarModalPlanes, setMostrarModalPlanes] = useState(false);
  const [editandoProducto, setEditandoProducto] = useState(null);
  const LIMITE_GRATIS = 5;
  const LIMITE_PRO = 20;

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
      const baseSlug = formTienda.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const slug = `${baseSlug}-${Date.now()}`;
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
    const limiteActual = miTienda?.is_admin ? Infinity
      : miTienda?.plan === 'full' ? Infinity
      : miTienda?.plan === 'pro' ? LIMITE_PRO
      : LIMITE_GRATIS;

    if (productos.length >= limiteActual) {
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
        imagen_posicion: formProducto.imagen_posicion || 'center',
        tienda_id: miTienda.id,
      }]).select().single();
      if (error) { setError(error.message); return; }
      setProductos(prev => [...prev, data]);
      setFormProducto({ nombre: '', precio: '', descripcion: '', imagen: '', tipo_venta: 'individual', imagen_posicion: 'center' });
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

  const handleEditarProducto = async (formData) => {
    setLoading(true); setError('');
    try {
      let imagenUrl = formData.imagen;
      if (formData.imagenFile) {
        const ext = formData.imagenFile.name.split('.').pop();
        const fileName = `${miTienda.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('productos').upload(fileName, formData.imagenFile, { upsert: true });
        if (uploadError) { setError('Error al subir foto'); setLoading(false); return; }
        const { data: urlData } = supabase.storage.from('productos').getPublicUrl(fileName);
        imagenUrl = urlData.publicUrl;
      }
      const { data, error } = await supabase.from('productos').update({
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        descripcion: formData.descripcion,
        imagen: imagenUrl,
        tipo_venta: formData.tipo_venta,
      }).eq('id', formData.id).select().single();
      if (error) { setError(error.message); return; }
      setProductos(prev => prev.map(p => p.id === data.id ? data : p));
      setEditandoProducto(null);
      setSuccessMsg('Producto actualizado ✅');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { setError('Error al editar producto'); }
    finally { setLoading(false); }
  };

  const handleEliminarTienda = async () => {
    if (!confirm('⚠️ ¿Seguro que quieres eliminar tu tienda y TODOS sus productos? Esta acción no se puede deshacer.')) return;
    try {
      // Eliminar imágenes del storage
      for (const p of productos) {
        if (p.imagen) {
          const path = p.imagen.split('/productos/')[1];
          if (path) await supabase.storage.from('productos').remove([path]);
        }
      }
      // Eliminar productos
      await supabase.from('productos').delete().eq('tienda_id', miTienda.id);
      // Eliminar tienda
      const { error } = await supabase.from('tiendas').delete().eq('id', miTienda.id);
      if (error) { setError(error.message); return; }
      setMiTienda(null);
      setProductos([]);
      setSuccessMsg('Tienda eliminada correctamente');
    } catch { setError('Error al eliminar la tienda'); }
  };

  const handleEliminarProducto = async (productoId, imagenUrl) => {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      // Eliminar imagen del storage si existe
      if (imagenUrl) {
        const path = imagenUrl.split('/productos/')[1];
        if (path) await supabase.storage.from('productos').remove([path]);
      }
      const { error } = await supabase.from('productos').delete().eq('id', productoId);
      if (error) { setError(error.message); return; }
      setProductos(prev => prev.filter(p => p.id !== productoId));
      setSuccessMsg('Producto eliminado ✅');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { setError('Error al eliminar producto'); }
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
        <header className="sticky top-0 z-50 bg-white backdrop-blur-md border-b-2 border-orange-100 shadow-sm">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Vendemos Fácil" className="h-12 w-12 object-contain" onError={e => { e.currentTarget.src='/logo.jpeg'; }} />
              <span className="text-xl font-black text-[#16a34a] font-['Fraunces']">Vendemos Fácil</span>
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
            <p className="anim-4 text-sm text-gray-400">✅ Sin conocimientos técnicos &nbsp;·&nbsp; ✅ Pedidos por WhatsApp &nbsp;·&nbsp; ✅ Listo en minutos</p>
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
              <p className="text-green-200 mt-2 font-medium">Tu tienda con tu imagen</p>
            </div>
            <div>
              <p className="text-5xl font-black font-['Fraunces']">0</p>
              <p className="text-green-200 mt-2 font-medium">Conocimientos técnicos necesarios</p>
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



        {/* PLANES Y PRECIOS */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-black text-center text-gray-900 mb-3 font-['Fraunces']">Planes y precios</h2>
            <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">Empieza gratis y crece cuando lo necesites</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  nombre: 'Gratis', precio: '$0', periodo: 'para siempre',
                  features: ['1 a 5 fotos de productos', 'Catálogo online con link', 'Pedidos por WhatsApp', 'Ideal para empezar'],
                  color: 'gray', cta: 'Empezar gratis',
                },
                {
                  nombre: 'Pro', precio: '$9.990', periodo: '/mes + IVA',
                  features: ['De 6 a 20 fotos de productos', 'Catálogo online con link', 'Pedidos por WhatsApp', 'Soporte prioritario'],
                  color: 'green', cta: 'Contratar Pro', recomendado: true,
                },
                {
                  nombre: 'Full', precio: '$19.990', periodo: '/mes + IVA',
                  features: ['Fotos ilimitadas', 'Catálogo online con link', 'Pedidos por WhatsApp', 'Soporte prioritario', 'Acceso completo'],
                  color: 'orange', cta: 'Contratar Full',
                },
              ].map(plan => (
                <div key={plan.nombre} className={`bg-white rounded-3xl shadow-sm border-2 p-8 flex flex-col relative ${
                  plan.recomendado ? 'border-[#16a34a]' : plan.color === 'orange' ? 'border-orange-300' : 'border-gray-200'
                }`}>
                  {plan.recomendado && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow">
                      ⭐ MÁS POPULAR
                    </div>
                  )}
                  <p className={`text-lg font-black ${plan.color === 'green' ? 'text-[#16a34a]' : plan.color === 'orange' ? 'text-orange-600' : 'text-gray-500'}`}>{plan.nombre}</p>
                  <div className="mt-3 mb-1 flex items-end gap-1">
                    <span className={`text-4xl font-black font-['Fraunces'] ${plan.color === 'green' ? 'text-[#16a34a]' : plan.color === 'orange' ? 'text-orange-600' : 'text-gray-800'}`}>{plan.precio}</span>
                    <span className="text-gray-400 text-sm mb-1">{plan.periodo}</span>
                  </div>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#16a34a] font-black mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setCurrentPage('registro')}
                    className={`mt-8 w-full py-3.5 rounded-2xl font-black transition ${
                      plan.recomendado ? 'bg-[#16a34a] hover:bg-[#ea580c] text-white shadow-lg shadow-green-200' :
                      plan.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100' :
                      'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-gray-900 text-white py-20">
          <div className="max-w-3xl mx-auto text-center px-6 space-y-6">
            <h2 className="text-4xl font-black font-['Fraunces']">¿Listo para vender?</h2>
            <p className="text-gray-400 text-lg">Crea tu catálogo online, comparte el link y recibe pedidos por WhatsApp.</p>
            <button onClick={() => { setCurrentPage('registro'); setError(''); }} className="inline-flex items-center gap-2 px-10 py-4 bg-[#16a34a] text-white rounded-2xl font-black text-xl hover:bg-[#15803d] transition shadow-2xl shadow-green-900">
              Crear mi tienda gratis <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        <footer className="py-10 bg-gray-900 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} Vendemos Fácil — Hecho con ❤️ en Chile</p>
            <div className="flex gap-6 text-sm">
              <a href="/terminos" className="text-gray-400 hover:text-white transition">Términos y condiciones</a>
              <a href="/privacidad" className="text-gray-400 hover:text-white transition">Privacidad</a>
            </div>
          </div>
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
        {mostrarModalPlanes && <ModalPlanes onCerrar={() => setMostrarModalPlanes(false)} productoCount={productos.length} miTienda={miTienda} userEmail={user?.email} />}
        {editandoProducto && (
          <ModalEditarProducto
            producto={editandoProducto}
            onCerrar={() => setEditandoProducto(null)}
            onGuardar={(form) => handleEditarProducto(form)}
            loading={loading}
            error={error}
          />
        )}

        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Vendemos Fácil" className="h-10 w-10 object-contain" onError={e => { e.target.style.display='none'; }} />
              <span className="text-lg font-black text-[#16a34a] font-['Fraunces']">Vendemos Fácil</span>
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
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">🚚 Costo de delivery ($)</label>
                  <input type="number" value={formTienda.delivery_costo} onChange={e => setFormTienda({ ...formTienda, delivery_costo: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#16a34a] focus:outline-none transition" placeholder="Ej: 2000 (0 = gratis)" />
                  <p className="text-xs text-gray-400 mt-1">El comprador verá este costo al hacer su pedido. Pon 0 si es gratis.</p>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#16a34a] text-white py-4 rounded-xl font-black hover:bg-[#15803d] transition disabled:opacity-50 shadow-lg shadow-green-200">
                  {loading ? 'Creando...' : '🚀 Crear mi tienda'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Banner tienda */}
              <div className="bg-gradient-to-r from-[#16a34a] to-[#ea580c] text-white p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-10"></div>
                <div className="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-10"></div>
                <div className="relative z-10">
                  {/* Logo de la tienda */}
                  {miTienda.is_admin && (
                    <div className="mb-4 flex items-center gap-4">
                      {miTienda.logo_url && (
                        <img src={miTienda.logo_url} alt="Logo" className="h-16 w-auto object-contain rounded-xl bg-white/10 p-1 shadow" />
                      )}
                      <label className="cursor-pointer flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-xl font-bold text-sm transition">
                        <ImagePlus className="w-4 h-4" />
                        {miTienda.logo_url ? 'Cambiar logo' : 'Subir logo'}
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const ext = file.name.split('.').pop();
                          const fileName = `logos/${miTienda.id}.${ext}`;
                          await supabase.storage.from('productos').upload(fileName, file, { upsert: true });
                          const { data } = supabase.storage.from('productos').getPublicUrl(fileName);
                          await supabase.from('tiendas').update({ logo_url: data.publicUrl }).eq('id', miTienda.id);
                          setMiTienda(prev => ({ ...prev, logo_url: data.publicUrl }));
                          setSuccessMsg('Logo actualizado ✅');
                          setTimeout(() => setSuccessMsg(''), 3000);
                        }} />
                      </label>
                    </div>
                  )}
                  <p className="text-green-200 text-sm font-medium uppercase tracking-widest mb-1">Tu tienda</p>
                  <h2 className="text-3xl font-black font-['Fraunces']">{miTienda.nombre}</h2>
                  {miTienda.descripcion && <p className="text-green-100 mt-1">{miTienda.descripcion}</p>}

                  <div className="mt-5 flex flex-col sm:flex-row gap-3 flex-wrap">
                    <button onClick={verMiTienda} className="flex items-center gap-2 bg-white text-[#16a34a] px-5 py-2.5 rounded-xl font-black hover:bg-green-50 transition text-sm shadow-md">
                      <Eye className="w-4 h-4" /> Ver mi tienda online
                    </button>
                    <button onClick={copiarLink} className="flex items-center gap-2 bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-white/30 transition text-sm">
                      📋 Copiar link
                    </button>
                    <button onClick={handleEliminarTienda} className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600 border border-red-400/30 text-white px-5 py-2.5 rounded-xl font-bold transition text-sm">
                      <X className="w-4 h-4" /> Eliminar tienda
                    </button>
                  </div>

                  <p className="text-green-200 text-xs mt-3 font-mono">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/tienda/{miTienda.slug}
                  </p>
                </div>
              </div>

              {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{successMsg}</div>}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

              {/* Editar datos tienda */}
              <EditarTienda miTienda={miTienda} setMiTienda={setMiTienda} setSuccessMsg={setSuccessMsg} />

              {/* Barra de uso de productos */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-gray-700">Productos usados</span>
                  {miTienda?.is_admin
                    ? <span className="text-xs font-black text-yellow-600 flex items-center gap-1"><Crown className="w-3 h-3" /> Admin · Sin límite</span>
                    : <button onClick={() => setMostrarModalPlanes(true)} className="text-xs font-black text-[#16a34a] hover:underline flex items-center gap-1"><Crown className="w-3 h-3" /> Ver planes</button>
                  }
                </div>
                {/* Tres planes visual */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Gratis', limite: 5, color: 'bg-gray-200', active: 'bg-gray-500' },
                    { label: 'Pro', limite: 30, color: 'bg-green-100', active: 'bg-[#16a34a]' },
                    { label: 'Full', limite: null, color: 'bg-orange-100', active: 'bg-orange-500' },
                  ].map((plan, i) => (
                    <div key={plan.label} className={`rounded-xl p-2.5 text-center border ${i === 0 ? 'border-gray-200' : i === 1 ? 'border-green-200' : 'border-orange-200'}`}>
                      <p className="text-xs font-black text-gray-600">{plan.label}</p>
                      <p className="text-xs text-gray-400">{plan.limite ? `${plan.limite} productos` : '∞ ilimitado'}</p>
                    </div>
                  ))}
                </div>
                {miTienda?.is_admin ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-700">Cuenta administradora · {productos.length} productos subidos · Sin límite</span>
                  </div>
                ) : (
                  <>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all ${productos.length >= LIMITE_GRATIS ? 'bg-orange-500' : 'bg-[#16a34a]'}`}
                        style={{ width: `${Math.min((productos.length / LIMITE_GRATIS) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-gray-400">{productos.length} de {LIMITE_GRATIS} productos (plan gratis)</span>
                      {productos.length >= LIMITE_GRATIS && (
                        <span className="text-xs text-orange-500 font-bold">⚠️ Límite alcanzado</span>
                      )}
                    </div>
                  </>
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-gray-900 font-['Fraunces']">
                    Mis productos <span className="text-[#16a34a]">({productos.filter(p => !p.rescata).length})</span>
                  </h3>
                </div>
                {productos.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-5xl mb-4">📦</p>
                    <p className="text-gray-400 font-medium">Aún no tienes productos. ¡Agrega el primero!</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {productos.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                        {/* Foto con botón eliminar encima */}
                        <div className="h-40 overflow-hidden bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center relative" style={{aspectRatio:"4/3"}}>
                          {p.imagen
                            ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-contain p-2" />
                            : <Camera className="w-10 h-10 text-gray-300" />}
                          <button
                            onClick={() => handleEliminarProducto(p.id, p.imagen)}
                            className="absolute top-2 right-2 w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar producto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-5">
                          <h4 className="font-black text-gray-800">{p.nombre}</h4>
                          {p.descripcion && <p className="text-sm text-gray-500 mt-1">{p.descripcion}</p>}
                          <p className="text-xs text-gray-400 mt-1">📦 {p.tipo_venta}</p>
                          <p className="text-xl font-black text-[#16a34a] mt-3">${p.precio.toLocaleString('es-CL')}</p>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => setEditandoProducto(p)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 border-2 border-green-200 text-[#16a34a] rounded-xl font-bold hover:bg-green-50 transition text-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleEliminarProducto(p.id, p.imagen)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 border-2 border-red-200 text-red-500 rounded-xl font-bold hover:bg-red-50 transition text-sm"
                            >
                              <X className="w-4 h-4" /> Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Sección Rescata ── */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🛒</span>
                  <div>
                    <h3 className="text-2xl font-black text-orange-600 font-['Fraunces']">Rescata</h3>
                    <p className="text-sm text-orange-500">Productos muy maduros o imperfectos a precio rebajado</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 mb-6 border border-orange-100">
                  <p className="text-sm text-gray-500 mb-3">Para agregar un producto Rescata, crea o edita un producto y activa el checkbox <strong>"Producto Rescata"</strong>.</p>
                  <button
                    onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
                  >
                    + Agregar producto Rescata
                  </button>
                </div>
                {productos.filter(p => p.rescata).length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-orange-200">
                    <p className="text-4xl mb-2">🍋</p>
                    <p className="text-gray-400 font-medium text-sm">No tienes productos Rescata aún</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productos.filter(p => p.rescata).map(p => (
                      <div key={p.id} className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-sm">
                        <div className="h-32 overflow-hidden bg-orange-50" style={{position:'relative'}}>
                          {p.imagen
                            ? <img src={p.imagen} alt={p.nombre} className="absolute inset-0 w-full h-full object-cover" style={{display:'block'}} />
                            : <div className="flex items-center justify-center h-full text-3xl">🛒</div>}
                          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-black px-2 py-1 rounded-full">RESCATA</div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-black text-gray-800">{p.nombre}</h4>
                          {p.descripcion && <p className="text-xs text-gray-500 mt-1">{p.descripcion}</p>}
                          <p className="text-xl font-black text-orange-600 mt-2">${p.precio.toLocaleString('es-CL')}</p>
                          {p.stock != null && <p className="text-xs text-gray-400 mt-1">Stock: {p.stock}</p>}
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