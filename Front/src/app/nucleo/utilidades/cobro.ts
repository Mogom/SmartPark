/**
 * Cobro por hora o fracción, con tope por cada bloque de 24 h.
 * El backend debe aplicar la misma regla; aquí solo se usa para mostrar el valor en vivo.
 */
export const calcularPrecio = (horas: number, valorHora: number, topeDiario: number) => {
  if (!topeDiario) return { total: horas * valorHora, aplicoTope: false };
  const dias = Math.floor(horas / 24), resto = horas % 24;
  const costoResto = Math.min(resto * valorHora, topeDiario);
  return { total: dias * topeDiario + costoResto, aplicoTope: resto * valorHora > topeDiario || dias > 0 };
};
