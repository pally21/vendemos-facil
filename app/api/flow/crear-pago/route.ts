import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const FLOW_API_URL = 'https://www.flow.cl/api';
const API_KEY = process.env.FLOW_API_KEY ?? '';
const SECRET_KEY = process.env.FLOW_SECRET_KEY ?? '';

function firmar(params: Record<string, string>) {
  const keys = Object.keys(params).sort();
  const toSign = keys.map(k => `${k}${params[k]}`).join('');
  return crypto.createHmac('sha256', SECRET_KEY).update(toSign).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { plan, tiendaId, email } = await req.json();

    if (!API_KEY || !SECRET_KEY) {
      return NextResponse.json({ error: 'Falta configuración de Flow en servidor' }, { status: 500 });
    }

    const monto = plan === 'pro' ? 11888 : 23788;
    const comercialId = `vm-${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.vendemosfacil.cl';

    const params: Record<string, string> = {
      apiKey: API_KEY,
      amount: String(monto),
      commerceOrder: comercialId,
      currency: 'CLP',
      email: email,
      subject: plan === 'pro' ? 'Plan Pro Vendemos Facil' : 'Plan Full Vendemos Facil',
      urlConfirmation: `${baseUrl}/api/flow/confirmar`,
      urlReturn: `${baseUrl}/pago-exitoso?plan=${plan}&tiendaId=${tiendaId}`,
    };

    params.s = firmar(params);

    console.log('Flow params:', JSON.stringify(params));

    const formData = new URLSearchParams(params);
    const response = await fetch(`${FLOW_API_URL}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log('Flow response:', JSON.stringify(data));

    if (data.url && data.token) {
      return NextResponse.json({ url: `${data.url}?token=${data.token}` });
    }

    return NextResponse.json({ error: 'Error al crear pago', detail: data }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno', detail: String(error) }, { status: 500 });
  }
}
