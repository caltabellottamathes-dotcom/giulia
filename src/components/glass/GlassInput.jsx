import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export default function GlassInput({
  label,
  type = "text",
  icon: Icon,
  rightIcon: RightIcon,
  className,
  inputClassName,
  ...props
}) {
  const [show, setShow] = useState(false);
  const inputType = type === "password" && show ? "text" : type;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
        <input
          type={inputType}
          className={cn(
            "w-full rounded-xl bg-white/40 backdrop-blur-md border border-white/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-300 focus:outline-none focus:border-olive/40 focus:bg-white/60",
            Icon && "pl-10",
            (RightIcon || type === "password") && "pr-10",
            inputClassName
          )}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {RightIcon && type !== "password" && (
          <RightIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
      </div>
    </div>
  );
}