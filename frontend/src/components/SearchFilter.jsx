import React from 'react';

export default function SearchFilter({ searchTerm, setSearchTerm, classificationFilter, setClassificationFilter }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder="Buscar por nombre o dirección..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '0.6rem', width: '320px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
      />
      <select 
        value={classificationFilter} 
        onChange={(e) => setClassificationFilter(e.target.value)}
        style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
      >
        <option value="All">Todas las Clasificaciones</option>
        <option value="5">5 Estrellas ⭐⭐⭐⭐⭐</option>
        <option value="4">4 Estrellas ⭐⭐⭐⭐</option>
        <option value="3">3 Estrellas ⭐⭐⭐</option>
      </select>
    </div>
  );
}
