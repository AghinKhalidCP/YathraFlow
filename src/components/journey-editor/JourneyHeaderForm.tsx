import React from "react";
import { MapPin, Navigation, Edit2 } from "lucide-react";

interface JourneyHeaderFormProps {
  title: string;
  originLabel: string;
  destinationLabel: string;
  onUpdate: (updates: { title?: string; originLabel?: string; destinationLabel?: string }) => void;
}

export const JourneyHeaderForm: React.FC<JourneyHeaderFormProps> = ({
  title,
  originLabel,
  destinationLabel,
  onUpdate,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 mb-4">
      <div className="flex items-center space-x-2 text-slate-400 mb-3 text-[11px] font-semibold uppercase tracking-wider">
        <Edit2 className="w-3.5 h-3.5 text-amber-500" />
        <span>Journey Details</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Journey Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="e.g. Kozhikode Station to Hackathon Venue"
            className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-semibold font-display text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Starting Origin</span>
            </label>
            <input
              type="text"
              value={originLabel}
              onChange={(e) => onUpdate({ originLabel: e.target.value })}
              placeholder="e.g. Kozhikode Railway Station"
              className="w-full px-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-rose-600" />
              <span>Final Destination</span>
            </label>
            <input
              type="text"
              value={destinationLabel}
              onChange={(e) => onUpdate({ destinationLabel: e.target.value })}
              placeholder="e.g. Institute of Palliative Medicine"
              className="w-full px-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
