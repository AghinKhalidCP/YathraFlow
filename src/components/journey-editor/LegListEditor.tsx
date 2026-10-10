import React from "react";
import type { JourneyLeg } from "../../features/journey/journeyTypes";
import { LegEditorCard } from "./LegEditorCard";
import { Plus } from "lucide-react";

interface LegListEditorProps {
  legs: JourneyLeg[];
  onUpdateLeg: (legId: string, updates: Partial<JourneyLeg>) => void;
  onDeleteLeg: (legId: string) => void;
  onMoveLeg: (legId: string, direction: "up" | "down") => void;
  onAddLeg: () => void;
}

export const LegListEditor: React.FC<LegListEditorProps> = ({
  legs,
  onUpdateLeg,
  onDeleteLeg,
  onMoveLeg,
  onAddLeg,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Journey Leg Steps ({legs.length})
        </h3>
        <button
          onClick={onAddLeg}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Journey Leg</span>
        </button>
      </div>

      {legs.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 text-xs">
          No legs added to this route yet. Click "Add Journey Leg" above to start building the step-by-step route.
        </div>
      ) : (
        legs.map((leg, index) => (
          <LegEditorCard
            key={leg.id}
            leg={leg}
            index={index}
            totalLegs={legs.length}
            onUpdate={(updates) => onUpdateLeg(leg.id, updates)}
            onDelete={() => onDeleteLeg(leg.id)}
            onMoveUp={() => onMoveLeg(leg.id, "up")}
            onMoveDown={() => onMoveLeg(leg.id, "down")}
          />
        ))
      )}
    </div>
  );
};
