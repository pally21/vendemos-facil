'use client';
export default function Terminos() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Términos y Condiciones</h1>
        <p className="text-gray-500 text-sm mb-10">Última actualización: Mayo 2026</p>
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section><h2 className="text-xl font-black text-gray-900 mb-3">1. Descripción del servicio</h2><p>Vendemos Fácil es una plataforma digital que permite a vendedores independientes crear catálogos online y recibir pedidos a través de WhatsApp. No somos parte de las transacciones comerciales entre vendedores y compradores.</p></section>
          <section><h2 className="text-xl font-black text-gray-900 mb-3">2. Responsabilidad</h2><p>No nos hacemos responsables por la calidad de los productos, cumplimiento de entregas, daños o perjuicios derivados de transacciones entre usuarios.</p></section>
          <section><h2 className="text-xl font-black text-gray-900 mb-3">3. Recomendaciones de seguridad</h2><ul className="mt-3 space-y-2 list-disc list-inside text-gray-600"><li>Coordinar entregas en lugares públicos y seguros (metro, comisaría, mall)</li><li>Verificar la identidad del vendedor antes de realizar pagos</li><li>Guardar el registro de conversaciones por WhatsApp</li></ul></section>
          <section><h2 className="text-xl font-black text-gray-900 mb-3">4. Planes y pagos</h2><p>Los planes Pro y Full se cobran mensualmente e incluyen IVA. El plan Gratuito permite publicar hasta 5 fotos sin costo.</p></section>
          <section><h2 className="text-xl font-black text-gray-900 mb-3">5. Cancelación</h2><p>Los usuarios pueden cancelar su cuenta en cualquier momento. No se realizan reembolsos por períodos parciales.</p></section>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-100"><a href="/" className="text-green-600 font-bold hover:underline">← Volver al inicio</a></div>
      </div>
    </div>
  );
}
