import React, { useState } from "react";
import type { JourneyRoute } from "../../features/journey/journeyTypes";
import { Plus, Trash2, Edit3, Check } from "lucide-react";

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
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          <span>Route Variants</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            {routes.length} Option{routes.length > 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={onAddRoute}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition flex items-center gap-1 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition font-medium ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/80"
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="px-2 py-0.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEditing(route.id)}
                    className="p-1 text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSelectRoute(route.id)}
                  className="text-left font-semibold"
                >
                  {route.name}
                </button>
              )}

              {!isEditing && (
                <button
                  onClick={() => startEditing(route)}
                  className={`p-0.5 rounded hover:bg-slate-700/50 ${
                    isActive ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Rename route"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}

              {routes.length > 1 && (
                <button
                  onClick={() => onDeleteRoute(route.id)}
                  className={`p-0.5 rounded hover:bg-rose-500/20 ${
                    isActive ? "text-rose-400 hover:text-rose-300" : "text-slate-400 hover:text-rose-600"
                  }`}
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
