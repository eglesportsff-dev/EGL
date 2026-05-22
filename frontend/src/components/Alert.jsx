export default function Alert({ type = 'info', children }) {
  if (!children) return null;
  const color = type === 'error' ? 'border-red-500/40 text-red-200' : 'border-ember/40 text-orange-100';
  return <div className={`rounded-md border bg-arena p-3 text-sm ${color}`}>{children}</div>;
}
