import React from 'react';

interface ModalProps {
  onRestart: () => void;
  onTakeBreak: () => void;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ onRestart, onTakeBreak, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-[#333] p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-6 transform scale-100">
        
        <h2 className="text-xl font-bold text-center">Session Interrupted</h2>
        
        <div className="flex flex-col gap-1 text-center">
          <p className="text-gray-400 text-sm">Distracted?</p>
          <p className="text-white font-bold text-base">What's next?</p>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button 
            onClick={onRestart}
            className="w-full py-3 rounded bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-gray-200"
          >
            Restart Session
          </button>
          
          <button 
            onClick={onTakeBreak}
            className="w-full py-3 rounded border border-[#333] hover:border-[#00ff88] hover:text-[#00ff88] text-gray-300 font-bold uppercase text-xs tracking-widest"
          >
            Take a Break
          </button>

          <button 
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-white text-xs"
          >
            Close / Resume
          </button>
        </div>
      </div>
    </div>
  );
};