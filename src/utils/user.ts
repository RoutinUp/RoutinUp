/**
 * Utilidades para manejar nombres de usuario, avatares y saludos dinámicos desde Supabase
 */

export function getUserDisplayName(user: any, profile?: any): string | null {
  if (profile?.displayName && profile.displayName.trim() !== '') {
    return profile.displayName.trim();
  }
  if (user?.user_metadata?.full_name && user.user_metadata.full_name.trim() !== '') {
    return user.user_metadata.full_name.trim();
  }
  if (user?.user_metadata?.name && user.user_metadata.name.trim() !== '') {
    return user.user_metadata.name.trim();
  }
  if (user?.email && typeof user.email === 'string') {
    const emailPrefix = user.email.split('@')[0];
    if (emailPrefix && emailPrefix.trim() !== '') {
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
  }
  return null;
}

export function getUserGreeting(user: any, profile?: any): string {
  const name = getUserDisplayName(user, profile);
  if (!name) {
    return 'Hola de nuevo 👋';
  }
  return `Hola, ${name} 👋`;
}

export function getUserAvatarUrl(user: any, profile?: any): string | null {
  return (
    profile?.avatarUrl ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null
  );
}

export function getUserInitials(user: any, profile?: any): string {
  const name = getUserDisplayName(user, profile);
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
