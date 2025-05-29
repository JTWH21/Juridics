import React, { useState } from 'react';
import { API_BASE } from '../api';

export default function RelativeForm({ clientId }) {
  const [relativeId, setRelativeId] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/clients/${clientId}/relatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativeId, relationship }),
      });
      if (!res.ok) throw new Error('Error al agregar familiar');
      alert('Familiar agregado');
      setRelativeId('');
      setRelationship('');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto mt-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Agregar Parentesco</h2>
      <div>
        <label className="block text-sm text-gray-600">ID del familiar</label>
        <input
          value={relativeId}
          onChange={e => setRelativeId(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">Parentesco</label>
        <input
          value={relationship}
          onChange={e => setRelationship(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Agregar</button>
    </form>
  );
}
