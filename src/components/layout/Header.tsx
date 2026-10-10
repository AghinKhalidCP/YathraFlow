import React from "react";
import { Compass, Share2, Printer, Sparkles, Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  hasJourney: boolean;
  onOpenShareModal: () => void;
  onOpenEmailModal: () => void;
  onPrint: () => void;
  onCreateNew: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasJourney,
  onOpenShareModal,
  onOpenEmailModal,
  onPrint,
  onCreateNew,
}) => {
  return (
    <header
      className="sticky top-0 z-30 no-print border-b backdrop-blur-md"
      style={{
        backgroundColor: "var(--color-surface-overlay)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--color-accent-subtle)" }}
          >
            <Compass
              className="w-4.5 h-4.5"
              style={{ color: "var(--color-accent)" }}
            />
          </div>
          <div>
            <h1
              className="text-base font-bold font-display tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              YathraFlow
            </h1>
            <p
              className="text-[11px] hidden sm:block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Kerala Multimodal Journey Visualizer
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {hasJourney && (
            <>
              <button
                onClick={onCreateNew}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5"
                style={{
                  color: "var(--color-text-secondary)",
                  borderColor: "var(--color-border)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-bg-subtle)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">New</span>
              </button>

              <button
                onClick={onOpenEmailModal}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5"
                style={{
                  color: "var(--color-text-secondary)",
                  borderColor: "var(--color-border)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-bg-subtle)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Email</span>
              </button>

              <button
                onClick={onPrint}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5"
                style={{
                  color: "var(--color-text-secondary)",
                  borderColor: "var(--color-border)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-bg-subtle)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Printer className="w-3 h-3" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                onClick={onOpenShareModal}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
                style={{ backgroundColor: "var(--color-accent)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-accent)")
                }
              >
                <Share2 className="w-3 h-3" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
