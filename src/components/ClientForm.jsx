import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function ClientForm({ onClientCreated }) {
  const [form, setForm] = useState({
    fullName: '',
    caseNumber: '',
    idNumber: '',
    email: '',
    phone: '',
    address: '',
    relativeId: '',
    relationship: '',
  });
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // Traer todos los clientes para mostrar en el select
    fetch(`${API_BASE}/clients`)
      .then(res => res.json())
      .then(data => setClients(data));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    // 1) Crear cliente nuevo
    const clientData = {
      fullName: form.fullName,
      caseNumber: form.caseNumber,
      idNumber: form.idNumber,
      email: form.email,
      phone: form.phone,
      address: form.address,
    };

    try {
      const resClient = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (!resClient.ok) throw new Error('Error creando cliente');
      const newClient = await resClient.json();

      // 2) Si hay parentesco, asignar relación
      if (form.relativeId && form.relationship) {
        const resRel = await fetch(`${API_BASE}/clients/${newClient._id}/relatives`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relativeId: form.relativeId,
            relationship: form.relationship,
          }),
        });

        if (!resRel.ok) throw new Error('Error creando relación familiar');
      }

      alert('Cliente creado con éxito');
      onClientCreated(newClient._id);

      // Reset form
      setForm({
        fullName: '',
        caseNumber: '',
        idNumber: '',
        email: '',
        phone: '',
        address: '',
        relativeId: '',
        relationship: '',
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Registrar Nuevo Cliente</h2>

      {/* Campos básicos */}
      {[
        { name: 'fullName', label: 'Nombre completo' },
        { name: 'caseNumber', label: 'Número de caso' },
        { name: 'idNumber', label: 'Cédula' },
        { name: 'email', label: 'Correo electrónico' },
        { name: 'phone', label: 'Teléfono' },
        { name: 'address', label: 'Dirección' },
      ].map(({ name, label }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-600">{label}</label>
          <input
            name={name}
            value={form[name]}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      ))}

      {/* Selector parentesco */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Parentesco con</label>
        <select
          name="relativeId"
          value={form.relativeId}
          onChange={handleChange}
          className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Ninguno</option>
          {clients.map(c => (
            <option key={c._id} value={c._id}>
              {c.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Relación */}
      {form.relativeId && (
        <div>
          <label className="block text-sm font-medium text-gray-600">Tipo de Parentesco</label>
          <input
            name="relationship"
            value={form.relationship}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej. hija, hijo, tío, sobrina..."
            required
          />
        </div>
      )}

      <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Crear Cliente
      </button>
    </form>
  );
}
