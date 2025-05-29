import React, { useState } from 'react';
import HomePage from './components/HomeClient';
import CreateClient from './components/CreateClient';

export default function App() {
  const [page, setPage] = useState('home');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-700">Sistema Juridicción</h1>
        <nav>
          <button
            onClick={() => setPage('home')}
            className={`mr-4 px-4 py-2 rounded ${
              page === 'home' ? 'bg-blue-600 text-white' : 'bg-gray-300'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setPage('create')}
            className={`px-4 py-2 rounded ${
              page === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-300'
            }`}
          >
            Crear Cliente
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        {page === 'home' ? <HomePage /> : <CreateClient />}
      </main>
    </div>
  );
}
