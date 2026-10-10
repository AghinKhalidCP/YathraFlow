import React, { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

type ThemeOption = "light" | "dark" | "system";

const OPTIONS: { value: ThemeOption; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentOption = OPTIONS.find((o) => o.value === theme) || OPTIONS[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors duration-200 border"
        style={{
          color: "var(--color-text-secondary)",
          borderColor: "var(--color-border)",
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--color-bg-subtle)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
        aria-label={`Theme: ${currentOption.label}`}
        title={`Current theme: ${currentOption.label}`}
      >
        <CurrentIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-36 rounded-xl border shadow-lg py-1 z-50"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            borderColor: "var(--color-border)",
          }}
        >
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors"
                style={{
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-text-secondary)",
                  backgroundColor: isActive
                    ? "var(--color-accent-subtle)"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor =
                      "var(--color-bg-subtle)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {option.label}
                {isActive && (
                  <span className="ml-auto text-[10px] font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
