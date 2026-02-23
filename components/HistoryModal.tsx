import React, { useState } from 'react';
import { HistoryEntry, Phase } from '../types';
import { Timeline } from './Timeline';

interface HistoryModalProps {
  history: HistoryEntry[];
  onClose: () => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onClear, onDelete }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isClearAllConfirm, setIsClearAllConfirm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0a0a0a] border border-[#222] w-full max-w-md h-[70vh] flex flex-col rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#222] bg-[#0a0a0a]">
          <h2 className="text-xl font-bold text-white tracking-tight">Session History</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#222]"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
           {history.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <span className="text-sm font-mono">No sessions recorded.</span>
             </div>
           )}
           {history.map(entry => {
              const hasTimeline = entry.segments && entry.segments.length > 0;
              const isExpanded = expandedId === entry.id;

              return (
                <div key={entry.id} className="bg-[#111] rounded-lg border border-[#222] overflow-hidden transition-all duration-300">
                  <div className="group flex justify-between items-center p-4 hover:bg-[#161616] relative">
                      <div>
                          <div className="font-bold text-white text-sm mb-1">{entry.name}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                            {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute:'2-digit' })}
                          </div>
                      </div>
                      <div className="flex items-center gap-2 pl-4">
                          <div className="text-right mr-2">
                            <span className="font-mono text-[#00ff88] text-lg font-bold block leading-none">{entry.duration}</span>
                            <span className="text-[9px] text-gray-600 uppercase tracking-widest block text-right">min</span>
                          </div>
                          
                          {/* Timeline Toggle Button */}
                          {hasTimeline && (
                             <button 
                               onClick={() => toggleExpand(entry.id)}
                               className={`w-8 h-8 flex items-center justify-center rounded transition-all ${isExpanded ? 'text-[#00ff88] bg-[#00ff88]/10' : 'text-gray-600 hover:text-white hover:bg-[#222]'}`}
                               title="View Timeline"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                             </button>
                          )}

                          {/* Delete Button */}
                          <button 
                            onClick={() => setDeleteId(entry.id)} 
                            className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:text-red-500 hover:bg-[#222] transition-colors"
                            title="Delete Entry"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                      </div>
                  </div>

                  {/* Expanded Timeline View */}
                  {isExpanded && hasTimeline && (
                    <div className="border-t border-[#222] bg-[#050505] p-4 animate-in fade-in slide-in-from-top-1">
                       <Timeline
                          segments={entry.segments}
                          currentPhase={Phase.FOCUS}
                          currentDuration={0}
                          isRunning={false}
                          totalPhaseDuration={0}
                       />
                    </div>
                  )}
                </div>
              );
           })}
        </div>

        {/* Footer */}
        {history.length > 0 && (
            <div className="p-4 border-t border-[#222] bg-[#0a0a0a]">
                <button 
                  onClick={() => setIsClearAllConfirm(true)} 
                  className="w-full py-3 rounded border border-red-900/30 text-red-700 hover:bg-red-900/10 hover:border-red-800 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-all"
                >
                    Clear All History
                </button>
            </div>
        )}

        {/* Delete Confirmation Overlay (Individual) */}
        {deleteId && (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-20 flex-col p-8 text-center animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-full bg-red-900/20 text-red-500 flex items-center justify-center mb-4 border border-red-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Delete this entry?</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-[200px] mx-auto leading-relaxed">This record will be permanently removed from your local history.</p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setDeleteId(null)} 
                        className="flex-1 py-3 border border-[#333] rounded text-gray-300 text-xs font-bold uppercase hover:bg-[#222] transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onDelete(deleteId); setDeleteId(null); }} 
                        className="flex-1 py-3 bg-red-600 rounded text-white text-xs font-bold uppercase hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>
        )}

        {/* Clear All Confirmation Overlay */}
        {isClearAllConfirm && (
             <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-20 flex-col p-8 text-center animate-in fade-in duration-200">
                <h3 className="text-white font-bold text-lg mb-2 text-red-500">Clear All History?</h3>
                <p className="text-gray-500 text-sm mb-6">You are about to delete all {history.length} recorded sessions. This cannot be undone.</p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setIsClearAllConfirm(false)} 
                        className="flex-1 py-3 border border-[#333] rounded text-gray-300 text-xs font-bold uppercase hover:bg-[#222]"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onClear(); setIsClearAllConfirm(false); }} 
                        className="flex-1 py-3 bg-red-900/80 border border-red-700 rounded text-white text-xs font-bold uppercase hover:bg-red-800"
                    >
                        Yes, Clear All
                    </button>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};