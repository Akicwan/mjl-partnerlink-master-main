import { useState, useMemo } from 'react';

export default function AgreementSidebar({ agreements, onSelect }) {
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const term = search.toLowerCase();
    const groups = {};
    agreements
      .filter(a => (a.university || '').toLowerCase().includes(term))
      .forEach(a => {
        (groups[a.university] ||= []).push(a);
      });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [agreements, search]);

  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search university…"
        className="mb-4 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2163]"
      />

      {grouped.length === 0 && (
        <p className="text-sm text-gray-500">No agreements found.</p>
      )}

      {grouped.map(([uni, list]) => (
        <div key={uni} className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-1">{uni}</h4>
          <ul className="space-y-1 ml-2">
            {list.map(a => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onSelect(a)}
                  className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 transition"
                >
                  {a.agreement_type || 'Agreement'}
                  {a.start_date && ` (${a.start_date.slice(0, 4)})`}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
