import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Palette,
  Shuffle,
  Smartphone,
  Sparkles,
  Type,
  Wand2,
  Zap,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/editor", label: "Editor", icon: Layers },
  { to: "/content", label: "Content", icon: Type },
  { to: "/style", label: "Style", icon: Palette },
  { to: "/frames", label: "Frames", icon: Smartphone },
  { to: "/overlays", label: "Overlays", icon: Sparkles },
  { to: "/motion", label: "Motion", icon: Zap },
  { to: "/transitions", label: "Transitions", icon: Shuffle },
  { to: "/prompts", label: "Prompts", icon: Wand2 },
];

export const NavSidebar: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByTabs = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: direction * 140, behavior: "smooth" });
  };

  return (
    <>
      {/* Desktop: fixed left column with icon nav */}
      <nav className="hidden shrink-0 flex-col items-center border-r border-rim bg-surface/40 py-4 lg:flex lg:w-14">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                `flex h-11 w-11 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-accent-purple/15 text-accent-purple"
                    : "text-muted hover:bg-rim/60 hover:text-zinc-200"
                }`
              }
            >
              <Icon size={19} />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile: scrollable bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center border-t border-rim bg-surface/95 backdrop-blur lg:hidden">
        {canScrollLeft && (
          <button
            onClick={() => scrollByTabs(-1)}
            aria-label="Scroll tabs left"
            className="z-10 flex shrink-0 items-center justify-center bg-gradient-to-r from-surface via-surface/95 to-transparent py-2 pl-2 pr-4 text-muted"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex flex-1 snap-x snap-mandatory items-center gap-1 overflow-x-auto scroll-smooth py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                `flex shrink-0 snap-center flex-col items-center gap-0.5 rounded-lg px-5 py-1 transition ${
                  isActive ? "text-accent-purple" : "text-muted"
                }`
              }
            >
              <Icon size={20} />
            </NavLink>
          ))}
        </div>
        {canScrollRight && (
          <button
            onClick={() => scrollByTabs(1)}
            aria-label="Scroll tabs right"
            className="z-10 flex shrink-0 items-center justify-center bg-gradient-to-l from-surface via-surface/95 to-transparent py-2 pl-4 pr-2 text-muted"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </nav>
    </>
  );
};
