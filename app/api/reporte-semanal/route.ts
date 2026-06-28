import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LOGO_URL = 'https://tiixqfdgnjzckodvqdju.supabase.co/storage/v1/object/public/assetd/Logo_negro.png';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hoy = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const primerDiaMes = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-01`;
  const primerDiaSiguiente = `${hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear()}-${pad(hoy.getMonth() === 11 ? 1 : hoy.getMonth() + 2)}-01`;

  const { data: ventas } = await supabase
    .from('ventas')
    .select('fecha, canal, precio_venta, descuento, descuento_monto, cliente_nombre')
    .gte('fecha', primerDiaMes)
    .lt('fecha', primerDiaSiguiente)
    .order('fecha', { ascending: false });

  const { data: gastosFijos } = await supabase
    .from('gastos_fijos')
    .select('concepto, monto_mensual');

  const { data: gastosVariablesMes } = await supabase
    .from('gastos_variables_mes')
    .select('concepto, monto, es_adicional, nombre_personalizado')
    .eq('mes', primerDiaMes);

  const { data: ingresosManuales } = await supabase
    .from('ingresos_manuales_mes')
    .select('concepto, monto')
    .eq('mes', primerDiaMes);

  // — Ingresos —
  const ajustesCanal = ['tienda', 'directa_coleccion', 'directa_custom', 'activacion', 'otros'];
  const canalesValidos = ['tienda', 'directa_coleccion', 'directa_custom', 'activacion', 'otro'];

  const totalVentasCanal = (ventas ?? []).reduce((sum, v) => {
    if (!canalesValidos.includes(v.canal)) return sum;
    return sum + (v.descuento ? v.precio_venta - (v.descuento_monto || 0) : v.precio_venta);
  }, 0);

  const totalAjustesCanal = (ingresosManuales ?? [])
    .filter(i => ajustesCanal.includes(i.concepto))
    .reduce((sum, i) => sum + i.monto, 0);

  const totalAdicionales = (ingresosManuales ?? [])
    .filter(i => !ajustesCanal.includes(i.concepto))
    .reduce((sum, i) => sum + i.monto, 0);

  const totalIngresos = totalVentasCanal + totalAjustesCanal + totalAdicionales;

  // — Gastos —
  const ADIC_FIJOS = ['fijo_adic_1', 'fijo_adic_2', 'fijo_adic_3', 'fijo_adic_4'];
  const ADIC_VARS = ['var_adic_1', 'var_adic_2', 'var_adic_3', 'var_adic_4'];
  const VARIABLES_BASE = ['Materiales e insumos', 'Mano de obra (José)', 'Activaciones de marca', 'Empaque', 'Comisiones tarjeta/tienda', 'Envíos y traslados', 'Zapato regalo/compensación'];

  const gastosFijosBase = gastosFijos ?? [];
  const gastosVar = gastosVariablesMes ?? [];

  const fijosReal = gastosFijosBase.reduce((sum, g) => {
    const override = gastosVar.find(v => v.concepto === g.concepto);
    return sum + (override ? override.monto : g.monto_mensual);
  }, 0);

  const adicFijos = gastosVar
    .filter(v => ADIC_FIJOS.includes(v.concepto))
    .reduce((sum, v) => sum + v.monto, 0);

  const variablesReal = gastosVar
    .filter(v => VARIABLES_BASE.includes(v.concepto))
    .reduce((sum, v) => sum + v.monto, 0);

  const adicVars = gastosVar
    .filter(v => ADIC_VARS.includes(v.concepto))
    .reduce((sum, v) => sum + v.monto, 0);

  const totalGastos = fijosReal + adicFijos + variablesReal + adicVars;
  const resultado = totalIngresos - totalGastos;

  // — HTML —
  const filasVentas = (ventas ?? []).map(v => `
    <tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${v.fecha}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${v.canal}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${v.cliente_nombre ?? '—'}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">$${(v.descuento ? v.precio_venta - (v.descuento_monto || 0) : v.precio_venta).toLocaleString('es-MX')}</td>
    </tr>
  `).join('');

  const soloAdicionales = (ingresosManuales ?? []).filter(i => !ajustesCanal.includes(i.concepto) && i.monto > 0);
  const filasIngresosExtras = soloAdicionales.length > 0 ? `
    <h2 style="font-size:16px;border-bottom:2px solid #F5F0E8;padding-bottom:8px;margin-top:28px">Otros ingresos del mes</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="background:#F5F0E8">
          <th style="padding:8px 12px;text-align:left">Concepto</th>
          <th style="padding:8px 12px;text-align:right">Monto</th>
        </tr>
      </thead>
      <tbody>
        ${soloAdicionales.map(i => `
          <tr>
            <td style="padding:6px 12px;border-bottom:1px solid #eee">${i.concepto}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">$${i.monto.toLocaleString('es-MX')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '';

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1A1A1A">
      <div style="text-align:center;padding:32px 0 16px">
        <img src="${LOGO_URL}" alt="Favaretto" style="height:80px;object-fit:contain;display:block;margin:0 auto 8px" />
        <p style="color:#888;font-size:13px;margin:4px 0 0">Reporte semanal — ${hoy.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin:24px 0;text-align:center">
        <div style="background:#F5F0E8;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:12px;color:#888">Ingresos totales</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:#4A7C59">$${totalIngresos.toLocaleString('es-MX')}</p>
          ${totalAjustesCanal > 0 || totalAdicionales > 0 ? `<p style="margin:2px 0 0;font-size:11px;color:#aaa">Ventas $${totalVentasCanal.toLocaleString('es-MX')} + Ajustes $${totalAjustesCanal.toLocaleString('es-MX')} + Extras $${totalAdicionales.toLocaleString('es-MX')}</p>` : ''}
        </div>
        <div style="background:#F5F0E8;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:12px;color:#888">Gastos del mes</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:#B5443A">$${totalGastos.toLocaleString('es-MX')}</p>
        </div>
        <div style="background:#F5F0E8;border-radius:12px;padding:16px">
          <p style="margin:0;font-size:12px;color:#888">Resultado</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:${resultado >= 0 ? '#4A7C59' : '#B5443A'}">$${resultado.toLocaleString('es-MX')}</p>
        </div>
      </div>

      <h2 style="font-size:16px;border-bottom:2px solid #F5F0E8;padding-bottom:8px">Ventas del mes (${ventas?.length ?? 0} pares)</h2>
      ${(ventas?.length ?? 0) > 0 ? `
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#F5F0E8">
              <th style="padding:8px 12px;text-align:left">Fecha</th>
              <th style="padding:8px 12px;text-align:left">Canal</th>
              <th style="padding:8px 12px;text-align:left">Cliente</th>
              <th style="padding:8px 12px;text-align:right">Precio</th>
            </tr>
          </thead>
          <tbody>${filasVentas}</tbody>
        </table>
      ` : '<p style="color:#888;font-size:13px">No hay ventas registradas este mes.</p>'}

      ${filasIngresosExtras}

      <div style="margin-top:32px;padding:16px;background:#F5F0E8;border-radius:12px;text-align:center">
        <p style="margin:0;font-size:12px;color:#888">Generado automáticamente por <strong>Orden y Alegría</strong></p>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: 'Favaretto COO <onboarding@resend.dev>',
    to: ['fermtzdecastro@gmail.com'],
    subject: `Reporte semanal Favaretto — ${hoy.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`,
    html,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Reporte enviado' });
}