import React, { useState } from "react";
import type { Journey } from "../../features/journey/journeyTypes";
import { generateShareableUrl } from "../../features/journey/journeyStorage";
import { X, Copy, Check, Code } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold">Share Journey Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Direct Shareable Link (No Backend Required)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              This link encodes your exact journey data directly into the URL. Anyone with this link can view the read-only interactive guide.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition flex items-center gap-1 shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Code className="w-4 h-4 text-teal-600" />
              <span>Embed Code for Website / Event Page</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Copy this HTML snippet to embed a compact read-only guide directly on your event website.
            </p>
            <div className="flex items-center gap-2">
              <textarea
                readOnly
                rows={2}
                value={embedSnippet}
                className="w-full px-3 py-2 bg-slate-900 text-teal-300 rounded-lg text-[11px] font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyEmbed}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 shrink-0"
              >
                {copiedEmbed ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEmbed ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
