// El reloj del servidor MySQL no es confiable (se verificó que esta
// corrido varias horas respecto al UTC real). Por eso el "ahora" y el
// rango de "hoy" se calculan siempre en esta app (Node), nunca con
// NOW()/UTC_TIMESTAMP()/CURDATE() del lado de la BDD.

const OFFSET_URUGUAY_MS = 3 * 60 * 60 * 1000; // UTC-3, Uruguay no tiene horario de verano

export function ahoraUtc(): Date {
  return new Date();
}

export function rangoHoyUruguay(): { inicio: Date; fin: Date } {
  const ahoraUtcMs = Date.now();
  const ahoraUruguay = new Date(ahoraUtcMs - OFFSET_URUGUAY_MS);

  const inicioUruguayComoUtc = new Date(
    Date.UTC(
      ahoraUruguay.getUTCFullYear(),
      ahoraUruguay.getUTCMonth(),
      ahoraUruguay.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );

  const inicio = new Date(inicioUruguayComoUtc.getTime() + OFFSET_URUGUAY_MS);
  const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  return { inicio, fin };
}
