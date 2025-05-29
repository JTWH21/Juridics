import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex gap-2 mt-8">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Buscar
      </button>
    </form>
  );
}
