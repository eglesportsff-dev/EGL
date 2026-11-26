export default function Alert({ type = 'info', children }) {
  if (!children) return null;
  const color = type === 'error'
    ? 'border-red-500/40 text-red-200 bg-red-950/20'
    : type === 'success'
    ? 'border-emerald-500/40 text-emerald-200 bg-emerald-950/20'
    : 'border-ember/40 text-orange-100 bg-arena';
  return <div className={`rounded-md border p-3 text-sm ${color}`}>{children}</div>;
}
