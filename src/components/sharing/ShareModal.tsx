import React, { useState } from "react";
import type { Journey } from "../../features/journey/journeyTypes";
import { generateShareableUrl } from "../../features/journey/journeyStorage";
import { X, Copy, Check, Code, Share2 } from "lucide-react";

interface ShareModalProps {
  journey: Journey;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ journey, isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const publicUrl = generateShareableUrl(journey, false);
  const embedUrl = generateShareableUrl(journey, true);
  const embedSnippet = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" title="${journey.title}"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--color-border-subtle)" }}>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-subtle)" }}>
              <Share2 className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            </div>
            <h3 className="text-base font-bold font-display" style={{ color: "var(--color-text)" }}>
              Share Journey Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-slate-500/10 cursor-pointer"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color: "var(--color-text)" }}
            >
              Direct Interactive Link
            </label>
            <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Encodes complete route coordinates and step-by-step transit cards directly into the URL for instant viewing.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono border outline-none truncate"
                style={{
                  backgroundColor: "var(--color-bg-subtle)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 hover:scale-[1.02] cursor-pointer"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "var(--color-border-subtle)" }}>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"
              style={{ color: "var(--color-text)" }}
            >
              <Code className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
              <span>Embed Code for Website / Event Page</span>
            </label>
            <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Copy this responsive iframe snippet to embed the interactive map and timeline on any webpage.
            </p>
            <div className="flex items-center gap-2">
              <textarea
                readOnly
                rows={2}
                value={embedSnippet}
                className="w-full px-3 py-2 rounded-xl text-[11px] font-mono border outline-none"
                style={{
                  backgroundColor: "var(--color-bg-subtle)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
              <button
                type="button"
                onClick={handleCopyEmbed}
                className="px-3.5 py-2 font-semibold text-xs rounded-xl border transition-colors flex items-center gap-1 shrink-0 hover:bg-slate-500/10 cursor-pointer"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmbed ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t flex justify-end" style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "var(--color-bg-subtle)" }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl border transition-colors hover:bg-slate-500/10 cursor-pointer"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
