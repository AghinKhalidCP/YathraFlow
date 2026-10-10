import React from "react";
import type { JourneyLeg } from "../../features/journey/journeyTypes";
import { LegEditorCard } from "./LegEditorCard";
import { Plus, ListPlus } from "lucide-react";

interface LegListEditorProps {
  legs: JourneyLeg[];
  onUpdateLeg: (legId: string, updates: Partial<JourneyLeg>) => void;
  onDeleteLeg: (legId: string) => void;
  onDuplicateLeg: (legId: string) => void;
  onMoveLeg: (legId: string, direction: "up" | "down") => void;
  onAddLeg: () => void;
}

export const LegListEditor: React.FC<LegListEditorProps> = ({
  legs,
  onUpdateLeg,
  onDeleteLeg,
  onDuplicateLeg,
  onMoveLeg,
  onAddLeg,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2">
          <ListPlus className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
          <h3
            className="text-xs font-bold font-display uppercase tracking-wider"
            style={{ color: "var(--color-text)" }}
          >
            Journey Legs ({legs.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={onAddLeg}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Leg</span>
        </button>
      </div>

      {legs.length === 0 ? (
        <div
          className="border border-dashed rounded-2xl p-8 text-center text-xs"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg-subtle)",
            color: "var(--color-text-muted)",
          }}
        >
          <p className="font-semibold mb-1">No legs in this route yet</p>
          <p className="text-[11px] max-w-xs mx-auto">
            Click &quot;Add Leg&quot; above to configure your first step with a vehicle, real stops, and fare estimate.
          </p>
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
            onDuplicate={() => onDuplicateLeg(leg.id)}
            onMoveUp={() => onMoveLeg(leg.id, "up")}
            onMoveDown={() => onMoveLeg(leg.id, "down")}
          />
        ))
      )}
    </div>
  );
};
