'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PagoExitosoContent() {
  const params = useSearchParams();
  const plan = params.get('plan');

  return (
    <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">¡Pago exitoso!</h1>
        <p className="text-gray-600 mb-2">
          Tu plan <strong className="text-green-600 capitalize">{plan}</strong> está activo.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Ya puedes subir más fotos a tu tienda. El plan se renueva automáticamente cada mes.
        </p>
        <a
          href="/"
          className="inline-block w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-lg transition"
        >
          Ir a mi tienda →
        </a>
      </div>
    </div>
  );
}

export default function PagoExitoso() {
  return (
    <Suspense>
      <PagoExitosoContent />
    </Suspense>
  );
}
