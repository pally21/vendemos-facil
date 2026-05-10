import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const FLOW_API_URL = 'https://www.flow.cl/api';
const API_KEY = process.env.FLOW_API_KEY!;
const SECRET_KEY = process.env.FLOW_SECRET_KEY!;

function firmar(params: Record<string, string>) {
  const keys = Object.keys(params).sort();
  const toSign = keys.map(k => `${k}${params[k]}`).join('');
  return crypto.createHmac('sha256', SECRET_KEY).update(toSign).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { plan, tiendaId, email } = await req.json();

    const monto = plan === 'pro' ? 11888 : 23788; // con IVA
    const comercialId = `${tiendaId}-${plan}-${Date.now()}`;

    const params: Record<string, string> = {
      apiKey: API_KEY,
      amount: String(monto),
      commerceOrder: comercialId,
      currency: 'CLP',
      email,
      subject: plan === 'pro' ? 'Plan Pro - Vendemos Fácil' : 'Plan Full - Vendemos Fácil',
      urlConfirmation: `${process.env.NEXT_PUBLIC_URL}/api/flow/confirmar`,
      urlReturn: `${process.env.NEXT_PUBLIC_URL}/pago-exitoso?plan=${plan}&tiendaId=${tiendaId}`,
    };

    params.s = firmar(params);

    const formData = new URLSearchParams(params);
    const response = await fetch(`${FLOW_API_URL}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.url && data.token) {
      return NextResponse.json({ url: `${data.url}?token=${data.token}` });
    }

    return NextResponse.json({ error: 'Error al crear pago', detail: data }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
