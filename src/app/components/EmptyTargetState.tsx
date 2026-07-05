import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export const EmptyTargetState: React.FC<{ message: string; linkTo?: string; linkLabel?: string }> = ({
  message,
  linkTo,
  linkLabel,
}) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-rim bg-surface/40 px-6 py-16 text-center">
    <p className="text-[13px] text-muted">{message}</p>
    {linkTo && linkLabel && (
      <NavLink
        to={linkTo}
        className="flex items-center gap-1 text-[13px] text-accent-purple transition hover:underline"
      >
        {linkLabel}
        <ChevronRight size={13} />
      </NavLink>
    )}
  </div>
);
