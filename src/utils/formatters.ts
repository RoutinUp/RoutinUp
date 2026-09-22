export const formatDuration = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDurationHuman = (totalSeconds: number): string => {
  const mins = Math.round(totalSeconds / 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
};

export const formatWeight = (val: number, unit = 'kg'): string => {
  const clean = Number.isInteger(val) ? val.toString() : val.toFixed(1);
  return `${clean} ${unit}`;
};

export const formatDateSpanish = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};