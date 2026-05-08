import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 rounded-xl bg-bg-elevated border border-border px-4 text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors",
              icon && "pl-10",
              error && "border-spend focus:ring-spend",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-spend">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
