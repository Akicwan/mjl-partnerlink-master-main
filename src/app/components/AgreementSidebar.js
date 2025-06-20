import { useState, useMemo } from 'react';

export default function AgreementSidebar({ agreements, onSelect }) {
  const [search, setSearch] = useState('');
  const [expandedUni, setExpandedUni] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Group agreements by university
  const grouped = useMemo(() => {
    const term = search.toLowerCase();
    const groups = {};
    
    agreements.forEach(a => {
      if (a.university.toLowerCase().includes(term) || 
          a.agreement_type.toLowerCase().includes(term)) {
        (groups[a.university] ||= []).push(a);
      }
    });
    
    return groups;
  }, [agreements, search]);

  return (
    <div className={`h-screen sticky top-0 border-r bg-white transition-all duration-200 flex flex-col
      ${collapsed ? 'w-16' : 'w-64'}`}>

      {/* Collapse button with color accent */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute -right-3 top-4 p-1 z-10 rounded-full shadow-sm transition-colors
          ${collapsed ? 
            'bg-[#1F2163] text-white hover:bg-[#161A42]' : 
            'bg-white border hover:bg-gray-100'}`}
      >
        {collapsed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18L15 12L9 6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 18L9 12L15 6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Header with subtle gradient */}
      <div className={`p-3 border-b ${collapsed ? 'bg-gradient-to-b from-[#1F2163] to-[#161A42]' : 'bg-white'}`}>
        {!collapsed ? (
          <>
            <h2 className="font-bold text-lg mb-2 text-gray-800">Agreements</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-[#1F2163]/50"
            />
          </>
        ) : (
          <div className="flex justify-center pt-1">
            <span className="text-white font-bold text-lg">A</span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-1">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-gray-500 p-4 text-center">
            {search ? "No results found" : "No agreements"}
          </p>
        ) : (
          <ul className="space-y-1">
            {Object.entries(grouped).map(([uni, agreements]) => (
              <li key={uni}>
                {collapsed ? (
                  <button
                    onClick={() => onSelect(agreements[0])}
                    className={`w-full p-3 rounded-full mx-auto my-1 flex justify-center items-center
                      hover:bg-[#1F2163]/10 transition-colors relative group`}
                    title={`${uni} (${agreements.length})`}
                  >
                    <span className="font-medium text-[#1F2163]">
                      {uni.charAt(0)}
                    </span>
                    <span className="absolute -top-1 -right-1 bg-[#1F2163] text-white text-xs 
                      rounded-full h-5 w-5 flex items-center justify-center">
                      {agreements.length}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setExpandedUni(expandedUni === uni ? null : uni)}
                      className={`w-full p-2 rounded flex justify-between items-center
                        ${expandedUni === uni ? 
                          'bg-[#1F2163]/10 text-[#1F2163] font-semibold' : 
                          'hover:bg-gray-100'}`}
                    >
                      <span className="truncate">{uni}</span>
                      <span className={`text-xs px-2 py-1 rounded-full 
                        ${expandedUni === uni ? 
                          'bg-[#1F2163] text-white' : 
                          'bg-gray-200 text-gray-700'}`}>
                        {agreements.length}
                      </span>
                    </button>

                    {expandedUni === uni && (
                      <ul className="ml-4 pl-3 border-l-2 border-[#1F2163]/20">
                        {agreements.map(a => (
                          <li key={a.id}>
                            <button
                              onClick={() => onSelect(a)}
                              className="w-full p-2 rounded text-left text-sm flex flex-col hover:bg-[#1F2163]/5"
                            >
                              <span className="font-medium text-gray-800">
                                {a.agreement_type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {a.start_date?.slice(0,4)}
                                {a.end_date && `-${a.end_date.slice(0,4)}`}
                                {a.juc_member && (
                                  <span className="ml-2 text-[#1F2163]">• JUC</span>
                                )}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status footer */}
      <div className={`p-2 text-xs text-center border-t 
        ${collapsed ? 'bg-[#1F2163]/5 text-[#1F2163]' : 'text-gray-500'}`}>
        {collapsed ? (
          <span className="font-medium">{Object.keys(grouped).length}</span>
        ) : (
          `${Object.keys(grouped).length} universities • ${agreements.length} agreements`
        )}
      </div>
    </div>
  );
}