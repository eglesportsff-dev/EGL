import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import AdminDataTable from '../components/AdminDataTable';
import { getAdminPlayers, deletePlayer } from '../services/tournamentService';


export default function AdminPlayers() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPlayers = () => {
    getAdminPlayers(page)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadPlayers();
  }, [page]);

  const handleDelete = async (player) => {
    if (window.confirm(`Are you sure you want to permanently delete player ${player.username}?`)) {
      setMessage('');
      setError('');
      try {
        const response = await deletePlayer(player.id);
        setMessage(response.message || `Player ${player.username} deleted successfully.`);
        loadPlayers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Admin · Players</p>
        <h1 className="mt-2 text-3xl font-black">All players</h1>
      </section>
      <Alert>{message}</Alert>
      <Alert type="error">{error}</Alert>
      <AdminDataTable
        title="Players List"
        data={data}
        page={page}
        onPage={setPage}
        empty="No players registered yet."
        onDelete={handleDelete}
      />
    </div>
  );
}
