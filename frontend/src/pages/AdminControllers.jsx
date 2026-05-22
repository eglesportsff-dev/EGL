import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import AdminDataTable from '../components/AdminDataTable';
import { getAdminControllers } from '../services/tournamentService';


export default function AdminControllers() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getAdminControllers(page).then(setData).catch((err) => setMessage(err.message));
  }, [page]);

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Admin · Controllers</p>
        <h1 className="mt-2 text-3xl font-black">All controllers</h1>
      </section>
      <Alert>{message}</Alert>
      <AdminDataTable title="Controllers List" data={data} page={page} onPage={setPage} empty="No controllers created yet." compactStaff />
    </div>
  );
}
