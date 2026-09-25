/** Epoch (ms) de las 00:00 del día de la fecha dada. */
export const inicioDelDia = (epoch: number) => {
  const d = new Date(epoch);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
