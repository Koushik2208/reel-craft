import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "reelcraft:mobile-export-banner-dismissed";

export const MobileExportBanner: React.FC = () => {
  const [isTouch, setIsTouch] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setIsTouch(navigator.maxTouchPoints > 0);
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (!isTouch || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  return (
    <div
      className="flex items-center justify-between gap-3 border-b bg-surface/60 px-4 py-2 lg:px-6 [border-image:linear-gradient(90deg,#FF3D9A,#7B5CF0,#00D4FF)_1]"
    >
      <p className="text-[12px] leading-snug text-accent-cyan">
        Preview works on mobile. For best results, export on desktop Chrome.
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-accent-cyan/80 transition hover:text-accent-cyan"
      >
        <X size={14} />
      </button>
    </div>
  );
};
