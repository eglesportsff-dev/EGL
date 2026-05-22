import { money } from '../utils/format';

export default function AdminDataTable({ title, data, page, onPage, empty, compactStaff = false }) {
  const rows = data?.items || [];
  return (
    <section className="panel overflow-x-auto">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">{title}</h2>
        <div className="flex items-center gap-2 text-sm text-secondary">
          <button className="btn-ghost px-3 py-1.5" disabled={page <= 0} onClick={() => onPage(page - 1)}>Prev</button>
          <span>Page {page + 1} / {Math.max(data?.totalPages || 1, 1)}</span>
          <button className="btn-ghost px-3 py-1.5" disabled={page + 1 >= (data?.totalPages || 1)} onClick={() => onPage(page + 1)}>Next</button>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-xl bg-bg/70 p-5 text-sm text-secondary">{empty}</div>
      ) : (
        <table className={`w-full text-left text-sm ${compactStaff ? 'min-w-[520px]' : 'min-w-[1100px]'}`}>
          <thead className="text-secondary">
            {compactStaff ? (
              <tr><th className="py-2">Name</th><th>Email</th></tr>
            ) : (
              <tr>
                <th className="py-2">Name</th><th>App UID</th><th>Gaming UID</th><th>Email</th><th>UPI</th><th>Role</th><th>Wallet</th><th>Winning Points</th><th>Verified</th>
              </tr>
            )}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/10">
                {compactStaff ? (
                  <>
                    <td className="py-3 font-semibold">{row.username}</td>
                    <td>{row.email}</td>
                  </>
                ) : (
                  <>
                    <td className="py-3 font-semibold">{row.username}</td>
                    <td>{row.uid || '-'}</td>
                    <td>{row.gameUid || '-'}</td>
                    <td>{row.email}</td>
                    <td>{row.upiId || '-'}</td>
                    <td>{row.role}</td>
                    <td>{money(row.walletBalance)}</td>
                    <td>{money(row.winningPoints)}</td>
                    <td>{row.emailVerified ? 'Yes' : 'No'}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
