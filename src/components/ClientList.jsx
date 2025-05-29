import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function ClientList({ onSelectClient }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/clients`)
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setResults(data);
      });
  }, []);

  // Usamos useEffect para hacer la búsqueda en vivo cuando cambia search
  useEffect(() => {
    // Si el texto está vacío, mostramos todos
    if (!search.trim()) {
      setResults(clients);
      return;
    }

    // Para no saturar con peticiones, esperamos 300ms después de que el usuario dejó de escribir
    const delayDebounce = setTimeout(() => {
      fetch(`${API_BASE}/clients/search?familyName=${encodeURIComponent(search)}`)
        .then(res => {
          if (!res.ok) throw new Error('Error en búsqueda');
          return res.json();
        })
        .then(data => setResults(data))
        .catch(() => setResults([]));
    }, 300);

    // Limpiamos el timeout si el usuario sigue escribiendo antes de 300ms
    return () => clearTimeout(delayDebounce);

  }, [search, clients]);

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow p-6">
      <input
        type="text"
        placeholder="Buscar cliente o familia..."
        className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {results.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron resultados.</p>
      ) : (
        <ul className="space-y-4">
          {results.map(client => (
            <li
              key={client._id}
              className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectClient(client._id)}
            >
              <h3 className="font-semibold text-lg">{client.fullName}</h3>
              <p><strong>Caso:</strong> {client.caseNumber}</p>
              <p><strong>Cédula:</strong> {client.idNumber}</p>
              <p><strong>Correo:</strong> {client.email}</p>
              <p><strong>Teléfono:</strong> {client.phone}</p>
              <p><strong>Dirección:</strong> {client.address}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
