'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Send, X, Truck, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ETIQUETAS_VENTA = {
  individual: '📦 Por unidad',
  kg:         '⚖️ Precio por kilo',
  docena:     '🥚 Precio por docena (12 unidades)',
  paquete:    '📦 Precio por paquete',
  bolsa:      '🛍️ Precio por bolsa',
};

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
  const costoDelivery = tienda?.delivery_costo || 0;
  const delivery = subtotal > 0 && costoDelivery > 0 ? costoDelivery : 0;
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
    else if (costoDelivery === 0) msg += `\n🚚 *Delivery:* ¡GRATIS!`;
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
                        ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
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
                              className="flex-1 h-14 bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white rounded-2xl font-black text-3xl transition select-none flex items-center justify-center"
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
                          className="w-full mt-4 bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white py-4 rounded-2xl font-black text-lg transition flex items-center justify-center gap-2 select-none"
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
                      : <span className="text-orange-500 font-bold">+${delivery.toLocaleString('es-CL')}</span>
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
            Vendemos Fácil es una plataforma de apoyo para vendedores independientes. No somos responsables por daños, perjuicios o inconvenientes derivados de las transacciones. Te recomendamos:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-amber-700">
            <li>✓ Verificar las condiciones de entrega antes de confirmar tu pedido</li>
            <li>✓ Coordinar entregas en lugares seguros y públicos (metro, comisaría, mall, etc.)</li>
            <li>✓ Confirmar los métodos de pago directamente con el vendedor</li>
            <li>✓ Guardar el registro de tu conversación por WhatsApp</li>
          </ul>
        </div>
      </div>
      <div className="text-center py-6 text-xs text-gray-400">
        Powered by <span className="font-bold text-[#16a34a]">Vendemos Fácil</span>
      </div>
    </div>
  );
}

export default TiendaPublica;