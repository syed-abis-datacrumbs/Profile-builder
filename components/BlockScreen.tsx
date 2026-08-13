import { Lock } from 'lucide-react';

export default function BlockScreen() {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/5 pointer-events-auto">
      <div className="flex flex-col items-center gap-4 text-center p-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-white/90 shadow-xl flex items-center justify-center border border-slate-200 backdrop-blur-md">
          <Lock className="w-8 h-8 text-slate-700" />
        </div>
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-700">Coming Soon</h2>
        </div>
      </div>
    </div>
  );
}
