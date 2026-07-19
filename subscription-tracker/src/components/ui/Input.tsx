import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-10 rounded-xl border border-border bg-surface px-3 text-sm text-ink placeholder:text-muted",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25",
            error && "border-coral focus:border-coral focus:ring-coral/25",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-coral">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
