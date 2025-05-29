import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function FamilyView({ clientId }) {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setFamily(null);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/clients/${clientId}/family`)
      .then(res => res.json())
      .then(data => setFamily(data))
      .catch(() => setFamily(null))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (!clientId) return null;

  if (loading) return <p className="text-center mt-4">Cargando familia...</p>;

  if (!family || !family.familyMembers || family.familyMembers.length === 0)
    return <p className="text-center mt-4 text-gray-500">No se encontraron familiares.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Familiares de {family.fullName}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {family.familyMembers.map(({ _id, fullName, relationship }) => (
          <div key={_id} className="p-3 bg-gray-100 rounded-md">
            <strong>{fullName}</strong> <span className="text-sm text-gray-600">– {relationship}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
