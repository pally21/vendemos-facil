'use client';
export default function Privacidad() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-gray-500 text-sm mb-10">Última actualización: Mayo 2026 · Conforme a la Ley 19.628 de Chile</p>
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section><h2 className="text-xl font-black text-gray-900 mb-3">1. Datos que recopilamos</h2><ul className="mt-3 space-y-2 list-disc list-inside text-gray-600"><li>Correo electrónico para registro</li><li>Nombre de la tienda, descripción y teléfono</li><li>Fotos de productos</li></ul></section>
          <section><h2 className="text-xl font-black text-gray-900 mb-3">2. Uso de los datos</h2><p>Utilizamos los datos para operar la plataforma, mostrar catálogos y facilitar la comunicación entre vendedores y compradores.</p></section>
          <section><h2 className="text-xl font-black text-gray-900 mb-3">3. Seguridad</h2><p>Los datos se almacenan en servidores seguros. No vendemos ni compartimos datos personales con terceros.</p></section>
          <section><h2 className="text-xl font-black text-gray-900 mb-3">4. Datos de compradores</h2><p>Los datos de pedidos son enviados directamente al vendedor vía WhatsApp. Vendemos Fácil no almacena estos datos.</p></section>
          <section><h2 className="text-xl font-black text-gray-900 mb-3">5. Tus derechos</h2><p>Conforme a la Ley 19.628, puedes acceder, rectificar o eliminar tus datos en cualquier momento contactándonos.</p></section>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-100"><a href="/" className="text-green-600 font-bold hover:underline">← Volver al inicio</a></div>
      </div>
    </div>
  );
}
