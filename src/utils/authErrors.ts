// Utilidad para traducir y formatear errores de Supabase Auth en español comprensible
export const getAuthErrorMessage = (error: any): string => {
  if (!error) return 'Ha ocurrido un error inesperado';

  const message = (error.message || '').toLowerCase();
  const code = (error.code || '').toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('invalid_grant')) {
    return 'El correo electrónico o la contraseña son incorrectos.';
  }

  if (message.includes('user already registered') || message.includes('user_already_exists')) {
    return 'Ya existe una cuenta registrada con este correo electrónico.';
  }

  if (message.includes('password should be at least 6 characters') || message.includes('weak_password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }

  if (message.includes('email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
  }

  if (message.includes('rate limit') || message.includes('too many requests') || message.includes('over_email_send_rate_limit')) {
    return 'Demasiados intentos en poco tiempo. Por favor espera unos minutos antes de volver a intentar.';
  }

  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Error de conexión. Verifica tu conexión a internet o la configuración del servidor.';
  }

  if (message.includes('invalid email') || message.includes('unable to validate email')) {
    return 'Por favor ingresa un correo electrónico válido.';
  }

  // Fallback al mensaje original o general
  return error.message || 'No fue posible completar la operación. Inténtalo de nuevo.';
};