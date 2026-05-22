export const money = (value) => `₹${Number(value || 0).toFixed(2)}`;
export const when = (value) => value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled';
export const roleHome = (role) => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'MASTER_CONTROLLER') return '/master';
  if (role === 'CONTROLLER') return '/controller';
  return '/dashboard';
};
