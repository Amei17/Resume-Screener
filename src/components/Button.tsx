import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500":
              variant === "default",
            "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700":
              variant === "outline",
            "text-slate-700 hover:bg-slate-100 focus:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800":
              variant === "ghost",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
