/** Funciones puras de formato para mostrar datos en pantalla (es-CO). */

export const dosDigitos = (n: number) => String(n).padStart(2, '0');

export const soloDigitos = (valor: string | number) => String(valor).replace(/\D/g, '');

export const sumar = <T>(lista: T[], valor: (x: T) => number) => lista.reduce((acc, x) => acc + valor(x), 0);

export const formatoHora = (epoch: number) => {
  const d = new Date(epoch);
  return dosDigitos(d.getHours()) + ':' + dosDigitos(d.getMinutes());
};

export const formatoMoneda = (valor: number) => '$ ' + Math.round(valor).toLocaleString('es-CO');

/** ABC123 → ABC 123 */
export const formatoPlaca = (placa: string) =>
  placa.length === 6 && /^[A-Z]{3}/.test(placa) ? placa.slice(0, 3) + ' ' + placa.slice(3) : placa;

/** 3001234567 → 300 123 4567 */
export const formatoTelefono = (tel: string) =>
  tel.length > 6 ? tel.slice(0, 3) + ' ' + tel.slice(3, 6) + ' ' + tel.slice(6)
    : tel.length > 3 ? tel.slice(0, 3) + ' ' + tel.slice(3) : tel;

/** 5_400_000 ms → "1 h 30 min" */
export const formatoDuracion = (ms: number) => {
  const min = Math.floor(ms / 60000), h = Math.floor(min / 60);
  return h ? h + ' h ' + dosDigitos(min % 60) + ' min' : min + ' min';
};

/** 5_400_000 ms → "01:30:00" */
export const formatoCronometro = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return dosDigitos(Math.floor(s / 3600)) + ':' + dosDigitos(Math.floor(s / 60) % 60) + ':' + dosDigitos(s % 60);
};

/** Número con separador de miles, o vacío si no hay valor. */
export const formatoNumero = (valor: string | number | null | undefined) =>
  valor === '' || valor === null || valor === undefined ? '' : Number(valor).toLocaleString('es-CO');

/** "Carlos Mejía Ruiz" → "Carlos M." */
export const nombreCorto = (nombre: string) => {
  const partes = nombre.split(' ');
  return partes[0] + (partes[1] ? ' ' + partes[1][0] + '.' : '');
};

/** "Carlos Mejía" → "CM" */
export const iniciales = (nombre: string) => nombre.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();

/** Oculta parte de un correo o teléfono: "ca•••@gmail.com", "300 ••• 4567". */
export const ocultarContacto = (contacto: string) => {
  if (contacto.includes('@')) return contacto.slice(0, 2) + '•••' + contacto.slice(contacto.indexOf('@'));
  const d = soloDigitos(contacto);
  return d.slice(0, 3) + ' ••• ' + d.slice(-4);
};

/** Epoch → "14:05:09" */
export const formatoHoraConSegundos = (epoch: number) => {
  const d = new Date(epoch);
  return dosDigitos(d.getHours()) + ':' + dosDigitos(d.getMinutes()) + ':' + dosDigitos(d.getSeconds());
};
