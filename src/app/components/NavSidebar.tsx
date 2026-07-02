import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Layers, Smartphone, type LucideIcon } from "lucide-react";
import { useStore } from "../store";
import { TEMPLATES } from "../../templates/registry";

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/editor", label: "Editor", icon: Layers },
  { to: "/frames", label: "Frames", icon: Smartphone },
];

export const NavSidebar: React.FC = () => {
  const { scenes, activeSceneId, setActiveScene } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const onScenePage = location.pathname.startsWith("/editor/scene/");

  const selectScene = (id: string) => {
    setActiveScene(id);
    if (onScenePage) navigate(`/editor/scene/${id}`);
  };

  return (
    <>
      {/* Desktop: fixed left column with icon nav + scene strip */}
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

        <div className="mt-3 flex w-full flex-1 flex-col items-center gap-1.5 overflow-y-auto border-t border-rim px-1.5 pt-3">
          {scenes.map((scene, idx) => {
            const isActive = scene.id === activeSceneId;
            const meta = TEMPLATES[scene.template];
            const colors = meta.variants.find((v) => v.id === scene.variant)?.colors;
            return (
              <button
                key={scene.id}
                onClick={() => selectScene(scene.id)}
                title={`Scene ${idx + 1}`}
                aria-pressed={isActive}
                className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border transition ${
                  isActive
                    ? "border-accent-purple bg-accent-purple/10 text-zinc-100"
                    : "border-rim text-muted hover:border-accent-purple/60"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full border border-white/10"
                  style={{ backgroundColor: colors?.bg ?? "#252535" }}
                />
                <span className="text-[9px] font-semibold leading-none">{idx + 1}</span>
              </button>
            );
          })}
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
