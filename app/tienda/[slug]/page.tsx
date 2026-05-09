'use client';

import { useParams } from 'next/navigation';
import TiendaPublica from '@/components/TiendaPublica';

export default function TiendaPage() {
  const params = useParams();
  const slug = params?.slug as string;
  if (!slug) return null;
  return <TiendaPublica slug={slug} />;
}
