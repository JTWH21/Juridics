import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function CreateClient() {
  const [form, setForm] = useState({
    fullName: '',
    caseNumber: '',
    idNumber: '',
    email: '',
    phone: '',
    address: '',
  });

  const [clients, setClients] = useState([]);
  const [selectedRelativeId, setSelectedRelativeId] = useState('');
  const [relationship, setRelationship] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/clients`)
      .then(res => res.json())
      .then(data => setClients(data.clients || []))
      .catch(() => setClients([]));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Crear cliente primero
      const res = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error creando cliente');
      const data = await res.json();

      // Si hay familiar relacionado, lo vinculamos
      if (selectedRelativeId && relationship.trim()) {
        const resRel = await fetch(
          `${API_BASE}/clients/${data._id}/relatives`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              relativeId: selectedRelativeId,
              relationship: relationship.trim(),
            }),
          }
        );
        if (!resRel.ok) throw new Error('Error agregando familiar');
      }

      alert('Cliente creado correctamente');
      setForm({
        fullName: '',
        caseNumber: '',
        idNumber: '',
        email: '',
        phone: '',
        address: '',
      });
      setSelectedRelativeId('');
      setRelationship('');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white p-6 rounded shadow space-y-5"
    >
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Crear Cliente</h2>

      {[
        { label: 'Nombre completo', name: 'fullName' },
        { label: 'Número de caso', name: 'caseNumber' },
        { label: 'Cédula', name: 'idNumber' },
        { label: 'Correo', name: 'email' },
        { label: 'Teléfono', name: 'phone' },
        { label: 'Dirección', name: 'address' },
      ].map(({ label, name }) => (
        <div key={name}>
          <label className="block mb-1 text-gray-600">{label}</label>
          <input
            name={name}
            value={form[name]}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}

      <div>
        <label className="block mb-1 text-gray-600">Familiar relacionado (opcional)</label>
        <select
          value={selectedRelativeId}
          onChange={e => setSelectedRelativeId(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-2"
        >
          <option value="">-- Selecciona un cliente --</option>
          {clients.map(c => (
            <option key={c._id} value={c._id}>
              {c.fullName}
            </option>
          ))}
        </select>

        {selectedRelativeId && (
          <>
            <label className="block mb-1 text-gray-600">Parentesco</label>
            <input
              type="text"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              placeholder="Ejemplo: hijo, esposa, tío"
              className="w-full border rounded px-4 py-2"
              required
            />
          </>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Crear Cliente
      </button>
    </form>
  );
}
