import React from "react";
import { NavLink } from "react-router-dom";
import { Layers, Palette, Smartphone, Sparkles, Wand2, Zap, type LucideIcon } from "lucide-react";

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/editor", label: "Editor", icon: Layers },
  { to: "/style", label: "Style", icon: Palette },
  { to: "/frames", label: "Frames", icon: Smartphone },
  { to: "/overlays", label: "Overlays", icon: Sparkles },
  { to: "/motion", label: "Motion", icon: Zap },
  { to: "/prompts", label: "Prompts", icon: Wand2 },
];

export const NavSidebar: React.FC = () => {
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

      {/* Mobile: bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-rim bg-surface/95 py-2 backdrop-blur lg:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-5 py-1 transition ${
                isActive ? "text-accent-purple" : "text-muted"
              }`
            }
          >
            <Icon size={20} />
          </NavLink>
        ))}
      </nav>
    </>
  );
};
