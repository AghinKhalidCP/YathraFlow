import React from "react";
import { Compass, Share2, Printer, RotateCcw, Sparkles } from "lucide-react";

interface HeaderProps {
  onOpenShareModal: () => void;
  onOpenEmailModal: () => void;
  onPrint: () => void;
  onResetDemo: () => void;
  onLoadKochiDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenShareModal,
  onOpenEmailModal,
  onPrint,
  onResetDemo,
  onLoadKochiDemo,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800/80 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-amber-400 font-bold shadow-xs shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold font-display tracking-tight text-white">
                YathraFlow
              </h1>
              <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full">
                Kerala Multimodal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-normal">
              Step-by-step visual transit navigator & route visualizer
            </p>
          </div>
        </div>

        {/* Demo Preset Route Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-800/60 p-1 rounded-full border border-slate-700/60 text-xs">
          <span className="text-slate-400 text-[11px] font-medium px-2.5 hidden md:inline">Presets:</span>
          <button
            onClick={onResetDemo}
            className="px-3 py-1 rounded-full bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white font-medium transition flex items-center gap-1.5 text-xs"
            title="Load Kozhikode Hackathon Venue Route"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Kozhikode Venue</span>
          </button>
          <button
            onClick={onLoadKochiDemo}
            className="px-3 py-1 rounded-full bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white font-medium transition text-xs"
            title="Load Cochin Airport to Fort Kochi Route"
          >
            Kochi Airport
          </button>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenEmailModal}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Email Text</span>
          </button>
          <button
            onClick={onPrint}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
          <button
            onClick={onOpenShareModal}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs shadow-xs transition flex items-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-950" />
            <span>Share Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
