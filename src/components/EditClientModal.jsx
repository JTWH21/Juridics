import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function EditClientModal({ clientToEdit, onClose, onSaved }) {
  const [formData, setFormData] = useState({
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
  const [saving, setSaving] = useState(false);

  // Cargar lista de clientes para seleccionar familiar
  useEffect(() => {
    fetch(`${API_BASE}/clients`)
      .then(res => res.json())
      .then(data => setClients(data.clients || []))
      .catch(() => setClients([]));
  }, []);

  // Cuando cambie el cliente a editar, cargar datos y familiar
  useEffect(() => {
    if (!clientToEdit) return;

    setFormData({
      fullName: clientToEdit.fullName || '',
      caseNumber: clientToEdit.caseNumber || '',
      idNumber: clientToEdit.idNumber || '',
      email: clientToEdit.email || '',
      phone: clientToEdit.phone || '',
      address: clientToEdit.address || '',
    });

    if (clientToEdit.relatives && clientToEdit.relatives.length > 0) {
      const rel = clientToEdit.relatives[0]; // Asumimos 1 familiar por simplicidad
      setSelectedRelativeId(rel._id);
      setRelationship(rel.relationship);
    } else {
      setSelectedRelativeId('');
      setRelationship('');
    }
  }, [clientToEdit]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveClient = async () => {
    if (!clientToEdit) return;
    setSaving(true);

    try {
      // 1. Actualizar cliente
      const res = await fetch(`${API_BASE}/clients/${clientToEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error actualizando cliente: ${text}`);
      }

      // 2. Borrar familiar anterior si existe
      if (clientToEdit.relatives && clientToEdit.relatives.length > 0) {
        const oldRelativeId = clientToEdit.relatives[0]._id;
        const resDel = await fetch(
          `${API_BASE}/clients/${clientToEdit._id}/relatives/${oldRelativeId}`,
          { method: 'DELETE' }
        );
        if (!resDel.ok) {
          const text = await resDel.text();
          throw new Error(`Error borrando familiar anterior: ${text}`);
        }
      }

      // 3. Crear nueva relación si hay familiar y parentesco
      if (selectedRelativeId && relationship.trim()) {
        const resRel = await fetch(
          `${API_BASE}/clients/${clientToEdit._id}/relatives`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              relativeId: selectedRelativeId,
              relationship: relationship.trim(),
            }),
          }
        );
        if (!resRel.ok) {
          const text = await resRel.text();
          throw new Error(`Error agregando familiar: ${text}`);
        }
      }

      alert('Cliente y familiar guardados correctamente');
      onSaved();
      onClose();
    } catch (error) {
      alert(error.message);
    }

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Editar Cliente</h2>

        {[
          { label: 'Nombre completo', name: 'fullName' },
          { label: 'Número de caso', name: 'caseNumber' },
          { label: 'Cédula', name: 'idNumber' },
          { label: 'Correo', name: 'email' },
          { label: 'Teléfono', name: 'phone' },
          { label: 'Dirección', name: 'address' },
        ].map(({ label, name }) => (
          <div key={name} className="mb-3">
            <label className="block mb-1 text-gray-600">{label}</label>
            <input
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div className="mb-4">
          <label className="block mb-1 text-gray-600">Familiar relacionado</label>
          <select
            value={selectedRelativeId}
            onChange={e => setSelectedRelativeId(e.target.value)}
            className="w-full border rounded px-4 py-2 mb-2"
          >
            <option value="">-- Selecciona un cliente --</option>
            {clients
              .filter(c => c._id !== clientToEdit._id) // Excluir cliente actual para no relacionarse a sí mismo
              .map(c => (
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

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={saveClient}
            disabled={saving}
            className="px-4 py-2 rounded bg-cyan-600 text-white hover:bg-cyan-700"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
