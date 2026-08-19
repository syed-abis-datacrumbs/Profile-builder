'use client';

import { Lock, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BlockScreenProps {
  onOpenAuth?: () => void;
  onClose?: () => void;
}

export default function BlockScreen({ onOpenAuth, onClose }: BlockScreenProps) {
  const router = useRouter();
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-auto p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-slate-700" />
        </div>

        {/* Text Content */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">This Page is Private</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          You need permission to view this content. Contact the administrator or sign in to request access.
        </p>

        {/* Buttons */}
        <div className="flex w-full justify-center">
          <button 
            onClick={onClose || (() => window.location.href = "/")}
            className="w-full py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
