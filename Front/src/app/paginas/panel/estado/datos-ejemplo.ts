/**
 * Datos de ejemplo para trabajar sin backend (environment.usarDatosEjemplo = true).
 * Se pierden al recargar la página. No se usan cuando la app está conectada a la API.
 */
import { MetodoPago, RegistroSalida, ResumenMes, Tarifas, TipoVehiculo, Usuario, Vehiculo } from '../../../nucleo/modelos';
import { MS_POR_HORA, MS_POR_MINUTO } from '../../../nucleo/utilidades';

export const SEDE_EJEMPLO = 'Conjunto Altos del Parque';

export const TARIFAS_EJEMPLO: Tarifas = {
  CARRO: { valorHora: 3500, topeDiario: 25000, cupos: 40 },
  MOTO: { valorHora: 1500, topeDiario: 10000, cupos: 20 },
};

export const BASE_CAJA_EJEMPLO = 100000;

export const USUARIOS_EJEMPLO: Usuario[] = [
  { id: 1, nombre: 'Carlos Mejía', contacto: '3004521877', rol: 'PORTERO' },
  { id: 2, nombre: 'Diana Rojas', contacto: 'diana.rojas@gmail.com', rol: 'PORTERO' },
  { id: 3, nombre: 'Luis Herrera', contacto: '3157749020', rol: 'PORTERO' },
  { id: 4, nombre: 'Martha Gómez', contacto: 'martha.gomez@altosdelparque.co', rol: 'ADMINISTRADOR' },
];

/** Solo para el modo de ejemplo. Con backend, las contraseñas se validan en el servidor. */
export const CONTRASENAS_EJEMPLO: Record<string, string> = {
  'Carlos Mejía': '1234',
  'Diana Rojas': '5678',
  'Luis Herrera': '0000',
  'Martha Gómez': '9999',
};

export const PORTEROS_EN_TURNO_EJEMPLO = ['Carlos Mejía', 'Diana Rojas'];

/** El turno de ejemplo empezó hace 9 horas. */
export const inicioTurnoEjemplo = (ahora: number) => ahora - 9 * MS_POR_HORA;

type FilaDentro = [placa: string, tipo: TipoVehiculo, visitante: string, casa: string, telefono: string, minutosDentro: number, registradoPor: string];

const DENTRO: FilaDentro[] = [
  ['KDM482', 'CARRO', 'Sofía Herrera', 'Casa 14', '3004521877', 47, 'Carlos Mejía'],
  ['MXR19F', 'MOTO', 'Juan Pablo Ríos', 'Casa 31', '3157749020', 133, 'Diana Rojas'],
  ['BTQ775', 'CARRO', 'Mariana López', 'Casa 8', '3209981432', 185, 'Carlos Mejía'],
  ['WEP90C', 'MOTO', 'Esteban Cano', 'Casa 22', '3012245566', 62, 'Diana Rojas'],
  ['JNE640', 'CARRO', 'Valentina Mora', 'Casa 5', '3168823311', 18, 'Carlos Mejía'],
];

type FilaSalida = [
  placa: string, tipo: TipoVehiculo, visitante: string, casa: string, telefono: string,
  minutosDesdeEntrada: number, minutosDesdeSalida: number, metodoPago: MetodoPago, valorRecibido: number,
  registradoPor: string, finalizadoPor: string,
];

const SALIDAS: FilaSalida[] = [
  ['UVW230', 'CARRO', 'Ricardo Salas', 'Casa 3', '3105567788', 520, 410, 'EFECTIVO', 10000, 'Carlos Mejía', 'Carlos Mejía'],
  ['RTY56E', 'MOTO', 'Paula Castaño', 'Casa 19', '3003321100', 480, 455, 'TRANSFERENCIA', 0, 'Carlos Mejía', 'Diana Rojas'],
  ['AAB123', 'CARRO', 'Felipe Duarte', 'Casa 27', '3124456677', 400, 215, 'TARJETA', 0, 'Diana Rojas', 'Diana Rojas'],
  ['LMN842', 'CARRO', 'Natalia Gil', 'Casa 11', '3019987766', 300, 262, 'EFECTIVO', 5000, 'Carlos Mejía', 'Carlos Mejía'],
  ['QWE71D', 'MOTO', 'Andrés Beltrán', 'Casa 2', '3176654433', 260, 95, 'EFECTIVO', 5000, 'Diana Rojas', 'Carlos Mejía'],
  ['PKO455', 'CARRO', 'Laura Quintero', 'Casa 16', '3143322110', 150, 72, 'EFECTIVO', 20000, 'Diana Rojas', 'Diana Rojas'],
  ['GHT318', 'CARRO', 'Mateo Vargas', 'Casa 9', '3051122334', 110, 40, 'TRANSFERENCIA', 0, 'Carlos Mejía', 'Diana Rojas'],
];

export function crearDentroEjemplo(ahora: number, tarifas: Tarifas, primerId: number): Vehiculo[] {
  return DENTRO.map(([placa, tipo, nombreVisitante, casa, telefono, minutos, registradoPor], i) => ({
    id: primerId + i, placa, tipo, nombreVisitante, casa, telefono, registradoPor,
    horaEntrada: ahora - minutos * MS_POR_MINUTO,
    valorHora: tarifas[tipo].valorHora, topeDiario: tarifas[tipo].topeDiario,
  }));
}

export function crearSalidasEjemplo(ahora: number, tarifas: Tarifas, primerId: number): RegistroSalida[] {
  return SALIDAS.map(([placa, tipo, nombreVisitante, casa, telefono, desdeEntrada, desdeSalida, metodoPago, recibido, registradoPor, finalizadoPor], i) => {
    const horaEntrada = ahora - desdeEntrada * MS_POR_MINUTO;
    const horaSalida = ahora - desdeSalida * MS_POR_MINUTO;
    const horasCobradas = Math.max(1, Math.ceil((horaSalida - horaEntrada) / MS_POR_HORA));
    const { valorHora, topeDiario } = tarifas[tipo];
    const total = horasCobradas * valorHora;
    const efectivo = metodoPago === 'EFECTIVO';
    return {
      id: primerId + i, placa, tipo, nombreVisitante, casa, telefono, registradoPor, finalizadoPor,
      horaEntrada, horaSalida, horasCobradas, valorHora, topeDiario, total, aplicoTope: false, metodoPago,
      valorRecibido: efectivo ? recibido : 0, vueltas: efectivo ? recibido - total : 0,
    };
  });
}

/** [visitas, recaudo] de meses anteriores. */
const RECAUDO_MESES_ANTERIORES: [number, number][] = [
  [612, 1842500], [578, 1731000], [655, 1968000], [630, 1895500], [701, 2104000], [668, 2010500],
  [742, 2233000], [719, 2167500], [690, 2080000], [705, 2121000], [760, 2290000],
];

/** Recaudo de enero hasta el mes actual; el mes en curso suma lo registrado en esta sesión. */
export function crearRecaudoMensualEjemplo(ahora: number, visitasSesion: number, recaudoSesion: number): ResumenMes[] {
  const hoy = new Date(ahora), mesActual = hoy.getMonth(), dia = hoy.getDate();
  const meses: ResumenMes[] = [];
  for (let mes = 0; mes <= mesActual; mes++) {
    const [visitas, total] = RECAUDO_MESES_ANTERIORES[mes % RECAUDO_MESES_ANTERIORES.length];
    meses.push(mes === mesActual
      ? { mes, visitas: Math.round(dia * 23.4) + visitasSesion, total: Math.round(dia * 70200) + recaudoSesion }
      : { mes, visitas, total });
  }
  return meses;
}
