import React, { useState } from "react";
import type { JourneyRoute } from "../../features/journey/journeyTypes";
import { Plus, Trash2, Edit3, Check, Layers } from "lucide-react";

interface RouteTabSelectorProps {
  routes: JourneyRoute[];
  activeRouteId: string;
  onSelectRoute: (id: string) => void;
  onAddRoute: () => void;
  onDeleteRoute: (id: string) => void;
  onUpdateRoute: (id: string, updates: { name?: string; description?: string }) => void;
}

export const RouteTabSelector: React.FC<RouteTabSelectorProps> = ({
  routes,
  activeRouteId,
  onSelectRoute,
  onAddRoute,
  onDeleteRoute,
  onUpdateRoute,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const startEditing = (route: JourneyRoute) => {
    setEditingId(route.id);
    setEditingName(route.name);
  };

  const saveEditing = (id: string) => {
    if (editingName.trim()) {
      onUpdateRoute(id, { name: editingName.trim() });
    }
    setEditingId(null);
  };

  return (
    <div
      className="rounded-2xl border p-3.5 mb-3.5 shadow-xs"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          <Layers className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
          <span>Route Variants</span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              color: "var(--color-accent)",
            }}
          >
            {routes.length} Option{routes.length > 1 ? "s" : ""}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddRoute}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border flex items-center gap-1 hover:bg-slate-500/10"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <Plus className="w-3 h-3" style={{ color: "var(--color-accent)" }} />
          <span>Add Alternative</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {routes.map((route) => {
          const isActive = route.id === activeRouteId;
          const isEditing = editingId === route.id;

          return (
            <div
              key={route.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                isActive ? "shadow-xs" : "opacity-75 hover:opacity-100"
              }`}
              style={{
                backgroundColor: isActive ? "var(--color-accent)" : "var(--color-bg-subtle)",
                borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                color: isActive ? "#ffffff" : "var(--color-text)",
              }}
            >
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="px-2 py-0.5 text-xs rounded-lg outline-none font-sans"
                    style={{
                      backgroundColor: "var(--color-bg-elevated)",
                      color: "var(--color-text)",
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => saveEditing(route.id)}
                    className="p-1 hover:opacity-80"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectRoute(route.id)}
                  className="text-left cursor-pointer"
                >
                  {route.name}
                </button>
              )}

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => startEditing(route)}
                  className="p-0.5 rounded opacity-70 hover:opacity-100"
                  title="Rename route alternative"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}

              {routes.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteRoute(route.id)}
                  className="p-0.5 rounded opacity-70 hover:opacity-100 hover:text-rose-300"
                  title="Delete route alternative"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
