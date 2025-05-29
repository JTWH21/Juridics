import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const relationTypes = [
  'Padre',
  'Madre',
  'Hijo',
  'Hermano',
  'Tío',
  'Tía',
  'Esposo',
  'Esposa',
  'Primo',
  'Prima',
  // Agrega los que necesites
];

const NewClient = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [allClients, setAllClients] = useState([]);
  const [relations, setRelations] = useState([]);

  useEffect(() => {
    apiService.getClients().then(setAllClients);
  }, []);

  const addRelation = () => {
    setRelations([...relations, { relation: '', clientId: '' }]);
  };

  const updateRelation = (index, field, value) => {
    const newRelations = [...relations];
    newRelations[index][field] = value;
    setRelations(newRelations);
  };

  const removeRelation = (index) => {
    const newRelations = [...relations];
    newRelations.splice(index, 1);
    setRelations(newRelations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar mínimo el nombre
    if (!name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    // Crear objeto con relaciones convertidas a formato esperado
    const relationsFormatted = relations
      .filter(r => r.relation && r.clientId)
      .map(r => ({ relation: r.relation, clientId: r.clientId }));

    const newClient = {
      name,
      age: age ? Number(age) : null,
      phone,
      address,
      relations: relationsFormatted,
    };

    try {
      await apiService.createClient(newClient);
      alert('Cliente creado con éxito');
      navigate('/clientes'); // Volver al listado
    } catch (error) {
      alert('Error al crear cliente');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Nuevo Cliente</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nombre:</label><br />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Edad:</label><br />
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            min="0"
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Teléfono:</label><br />
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Dirección:</label><br />
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <h3>Parentescos</h3>
          {relations.map((rel, idx) => (
            <div key={idx} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <select
                value={rel.relation}
                onChange={e => updateRelation(idx, 'relation', e.target.value)}
                required
                style={{ marginRight: '10px', padding: '5px' }}
              >
                <option value="">Selecciona parentesco</option>
                {relationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={rel.clientId}
                onChange={e => updateRelation(idx, 'clientId', e.target.value)}
                required
                style={{ marginRight: '10px', padding: '5px' }}
              >
                <option value="">Selecciona cliente</option>
                {allClients.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <button type="button" onClick={() => removeRelation(idx)} style={{ color: 'red' }}>
                Eliminar
              </button>
            </div>
          ))}

          <button type="button" onClick={addRelation} style={{ marginTop: '10px', padding: '8px 12px' }}>
            + Agregar Parentesco
          </button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>Guardar Cliente</button>
        </div>
      </form>
    </div>
  );
};

export default NewClient;
