import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const FLOW_API_URL = 'https://www.flow.cl/api';
const API_KEY = process.env.FLOW_API_KEY!;
const SECRET_KEY = process.env.FLOW_SECRET_KEY!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function firmar(params: Record<string, string>) {
  const keys = Object.keys(params).sort();
  const toSign = keys.map(k => `${k}${params[k]}`).join('');
  return crypto.createHmac('sha256', SECRET_KEY).update(toSign).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = Object.fromEntries(new URLSearchParams(body));
    const token = params.token;

    // Consultar estado del pago a Flow
    const queryParams: Record<string, string> = {
      apiKey: API_KEY,
      token,
    };
    queryParams.s = firmar(queryParams);

    const response = await fetch(
      `${FLOW_API_URL}/payment/getStatus?${new URLSearchParams(queryParams)}`,
      { method: 'GET' }
    );

    const pago = await response.json();

    // status 2 = pago exitoso en Flow
    if (pago.status === 2) {
      const [tiendaId, plan] = pago.commerceOrder.split('-');

      const vence = new Date();
      vence.setMonth(vence.getMonth() + 1);

      await supabase
        .from('tiendas')
        .update({
          plan: plan,
          plan_vence_en: vence.toISOString(),
        })
        .eq('id', tiendaId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
