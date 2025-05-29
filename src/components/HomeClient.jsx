import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function HomePage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Edición cliente
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    caseNumber: '',
    idNumber: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);

  // Para gestionar familiares vinculados al cliente
  const [clientsForRelatives, setClientsForRelatives] = useState([]);
  const [selectedRelativeId, setSelectedRelativeId] = useState('');
  const [relationship, setRelationship] = useState('');
  const [savingRelative, setSavingRelative] = useState(false);

  async function fetchClients(query = '') {
    setLoading(true);
    try {
      const url = query
        ? `${API_BASE}/clients/search?familyName=${encodeURIComponent(query)}`
        : `${API_BASE}/clients`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error cargando clientes');
      const data = await res.json();
      setClients(data.clients || []);
    } catch (error) {
      alert(error.message);
      setClients([]);
    }
    setLoading(false);
  }

  async function deleteClient(clientId) {
    if (!window.confirm('¿Seguro que quieres eliminar este cliente?')) return;

    try {
      const res = await fetch(`${API_BASE}/clients/${clientId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error eliminando cliente');
      alert('Cliente eliminado correctamente');
      fetchClients(searchTerm.trim());
      if (selectedClientId === clientId) setSelectedClientId(null);
    } catch (error) {
      alert(error.message);
    }
  }

  // Abrir modal y cargar datos para editar
  function editClient(clientId) {
    const client = clients.find(c => c._id === clientId);
    if (!client) return alert('Cliente no encontrado');

    setEditingClient(client);
    setFormData({
      fullName: client.fullName || '',
      caseNumber: client.caseNumber || '',
      idNumber: client.idNumber || '',
      phone: client.phone || '',
      address: client.address || '',
    });

    // Cargar lista para seleccionar familiares (todos menos el cliente actual)
    setClientsForRelatives(clients.filter(c => c._id !== clientId));

    // Reset familiares relacionados para nuevo agregado
    setSelectedRelativeId('');
    setRelationship('');
  }

  async function saveClient() {
    if (!editingClient) return;

    setSaving(true);
    try {
      // 1. Actualizar datos del cliente
      const res = await fetch(`${API_BASE}/clients/${editingClient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error actualizando cliente: ${text}`);
      }

      // 2. Reemplazar familiar si hay uno seleccionado
      if (selectedRelativeId && relationship.trim()) {
        const resRel = await fetch(
          `${API_BASE}/clients/${editingClient._id}/relatives`,
          {
            method: 'PUT', // Siempre PUT para reemplazar
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              relativeId: selectedRelativeId,
              relationship: relationship.trim(),
            }),
          }
        );
        if (!resRel.ok) {
          const text = await resRel.text();
          throw new Error(`Error actualizando familiar: ${text}`);
        }
      }

      alert('Cliente actualizado correctamente');
      setEditingClient(null);
      fetchClients(searchTerm.trim());
      setSelectedRelativeId('');
      setRelationship('');
    } catch (error) {
      alert(error.message);
    }
    setSaving(false);
  }



  // Agregar o editar familiar vinculado
  async function addOrEditRelative() {
    if (!selectedRelativeId || !relationship.trim()) {
      return alert('Selecciona un familiar y escribe el parentesco');
    }

    setSavingRelative(true);

    try {
      // 1. Eliminar todos los familiares previos (solo si hay alguno)
      if (editingClient.relatives?.length > 0) {
        for (const rel of editingClient.relatives) {
          await fetch(
            `${API_BASE}/clients/${editingClient._id}/relatives/${rel.relativeId || rel._id}`,
            { method: 'DELETE' }
          );
        }
      }

      // 2. Agregar el nuevo familiar con su parentesco
      const res = await fetch(
        `${API_BASE}/clients/${editingClient._id}/relatives`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relativeId: selectedRelativeId,
            relationship: relationship.trim(),
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error agregando familiar: ${text}`);
      }

      alert('Familiar guardado correctamente');

      // Refrescar cliente editado y limpiar formularios
      const updatedClient = await fetch(`${API_BASE}/clients/${editingClient._id}`).then(r => r.json());
      setEditingClient(updatedClient);
      setSelectedRelativeId('');
      setRelationship('');
      fetchClients(searchTerm.trim());

    } catch (error) {
      alert(error.message);
    }

    setSavingRelative(false);
  }


  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClients(searchTerm.trim());
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div>
      {/* Input de búsqueda */}
      <div className="mb-6 flex max-w-md mx-auto">
        <input
          type="text"
          placeholder="Buscar por nombre o familia..."
          className="flex-grow border rounded px-4 py-2"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto transition-opacity duration-200">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Nombre Completo</th>
              <th className="py-3 px-6 text-left">Número de Caso</th>
              <th className="py-3 px-6 text-left">Cédula</th>
              <th className="py-3 px-6 text-left">Teléfono</th>
              <th className="py-3 px-6 text-left">Dirección</th>
              <th className="py-3 px-6 text-left">Familiares</th>
              <th className="py-3 px-6 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400">
                  Cargando resultados...
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400">
                  No hay clientes para mostrar.
                </td>
              </tr>
            ) : (
              clients.map(client => (
                <tr
                  key={client._id}
                  className={`border-b hover:bg-gray-100 cursor-pointer ${selectedClientId === client._id ? 'bg-gray-200' : ''
                    }`}
                  onClick={() => setSelectedClientId(client._id)}
                >
                  <td className="py-3 px-6">{client.fullName}</td>
                  <td className="py-3 px-6">{client.caseNumber}</td>
                  <td className="py-3 px-6">{client.idNumber}</td>
                  <td className="py-3 px-6">{client.phone}</td>
                  <td className="py-3 px-6">{client.address}</td>
                  <td className="py-3 px-6">
                    {client.relatives?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {client.relatives.map((rel, i) => (
                          <li key={i}>
                            {rel.fullName} ({rel.relationship})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 italic">Sin familiares</span>
                    )}
                  </td>
                  <td className="py-3 px-6 space-x-2 flex">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        editClient(client._id);
                      }}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteClient(client._id);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para editar cliente */}
      {editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl mb-4">Editar Cliente</h3>
            <div className="space-y-3">
              {/* Campos básicos */}
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full border rounded px-3 py-2"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Número de caso"
                className="w-full border rounded px-3 py-2"
                value={formData.caseNumber}
                onChange={e => setFormData({ ...formData, caseNumber: e.target.value })}
              />
              <input
                type="text"
                placeholder="Cédula"
                className="w-full border rounded px-3 py-2"
                value={formData.idNumber}
                onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
              />
              <input
                type="text"
                placeholder="Teléfono"
                className="w-full border rounded px-3 py-2"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <input
                type="text"
                placeholder="Dirección"
                className="w-full border rounded px-3 py-2"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />

              {/* Sección para agregar/modificar familiar */}
              <div className="mt-5 border-t pt-4">
                <h4 className="text-lg mb-2 font-semibold">Familiar</h4>

                <label className="block mb-1 text-gray-600">Cliente relacionado</label>
                <select
                  value={selectedRelativeId}
                  onChange={e => setSelectedRelativeId(e.target.value)}
                  className="w-full border rounded px-4 py-2 mb-2"
                >
                  <option value="">-- Selecciona un cliente --</option>
                  {clientsForRelatives.map(c => (
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
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingClient(null)}
                disabled={saving || savingRelative}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={saveClient}
                disabled={saving || savingRelative}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
              >
                {saving ? 'Guardando...' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
