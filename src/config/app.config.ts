export interface AppBrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  version: string;
  defaultWeightUnit: 'kg' | 'lb';
  weightIncrements: number[];
  defaultRestSeconds: number;
  repositoryUrl: string;
  supportEmail: string;
  theme: {
    accentColor: string;
    accentDark: string;
    bgDark: string;
    cardDark: string;
    cardLighter: string;
    textLight: string;
  };
}

export const APP_CONFIG: AppBrandConfig = {
  name: 'RoutinUP',
  shortName: 'RoutinUP',
  tagline: 'Entrena con foco, supera tus límites',
  description: 'Aplicación mobile-first para crear, gestionar y ejecutar rutinas de gimnasio con seguimiento inteligente.',
  version: '1.0.0',
  defaultWeightUnit: 'kg',
  weightIncrements: [1, 1.25, 2.5, 5],
  defaultRestSeconds: 90,
  repositoryUrl: 'https://github.com/RoutinUp/RoutinUp',
  supportEmail: 'soporte@routinup.app',
  theme: {
    accentColor: '#10B981', // Verde esmeralda deportivo
    accentDark: '#059669',
    bgDark: '#0B0F17',
    cardDark: '#151D2A',
    cardLighter: '#1E293B',
    textLight: '#F3F4F6',
  }
};