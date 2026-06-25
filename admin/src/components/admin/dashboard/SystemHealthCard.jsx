import { useEffect, useState } from 'react';
import { getSystemHealth } from '../../../api/adminApi';

export default function SystemHealthCard() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const { data } = await getSystemHealth();
        setHealth(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadHealth();
  }, []);

  if (!health) return <div>Loading...</div>;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold mb-3">
        System Health
      </h3>

      <p>Database: {health.database}</p>
      <p>Redis: {health.redis}</p>
      <p>Status: {health.status}</p>
    </div>
  );
}