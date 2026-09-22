/**
 * Utilidades para la resolución de URLs públicas de la aplicación.
 * Garantiza compatibilidad tanto en desarrollo local (localhost) como en producción
 * en GitHub Pages (subdirectorios como /RoutineUp/) y dominios personalizados,
 * integrándose de forma limpia con HashRouter y Supabase Auth.
 */

/**
 * Obtiene la URL base pública de la aplicación incluyendo origin y subdirectorio (si existe).
 * Siempre finaliza con una barra diagonal '/'.
 * 
 * Ejemplos:
 * - Localhost: 'http://localhost:5173/'
 * - GitHub Pages: 'https://usuario.github.io/RoutineUp/'
 * - Dominio raíz: 'https://miapp.com/'
 */
export function getAppBaseUrl(): string {
  if (typeof window === 'undefined') return '';

  const { origin, pathname } = window.location;

  // Remover nombres de archivo finales si existieran (ej: /index.html)
  let basePath = pathname;
  if (basePath.endsWith('index.html')) {
    basePath = basePath.slice(0, -'index.html'.length);
  }

  // Asegurar que siempre termine en '/'
  if (!basePath.endsWith('/')) {
    basePath = `${basePath}/`;
  }

  return `${origin}${basePath}`;
}

/**
 * Genera una URL de redirección absoluta compatible con HashRouter para Supabase Auth.
 * 
 * @param hashPath Ruta interna de la app (ej: 'reset-password', '/reset-password', '' o '/')
 * @returns URL absoluta lista para Supabase (ej: 'https://usuario.github.io/RoutineUp/#/reset-password')
 */
export function getAppRedirectUrl(hashPath: string = ''): string {
  const base = getAppBaseUrl();
  const cleanPath = hashPath.replace(/^[/#]+/, '');
  return cleanPath ? `${base}#/${cleanPath}` : `${base}#/`;
}
