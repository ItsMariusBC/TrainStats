// src/components/ui/button.tsx
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'default',
  size = 'md',
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  
  return (
    <Comp
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        
        // Variant styles
        variant === 'default' && "bg-primary text-white hover:bg-primary-dark",
        variant === 'outline' && "border border-primary text-primary hover:bg-primary-lighter",
        variant === 'ghost' && "text-primary hover:bg-primary-lighter",
        
        // Size styles
        size === 'sm' && "h-8 px-3 text-sm",
        size === 'md' && "h-10 px-4",
        size === 'lg' && "h-12 px-6",
        
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };