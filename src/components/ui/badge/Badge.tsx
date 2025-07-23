import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "border-transparent bg-blue-600 text-white",
  secondary: "border-transparent bg-gray-200 text-gray-900",
  destructive: "border-transparent bg-red-600 text-white",
  outline: "text-gray-900 border-gray-300",
  light: "border-transparent",
  solid: "border-transparent",
};

const badgeColors = {
  primary: {
    light: "bg-blue-100 text-blue-700",
    solid: "bg-blue-600 text-white",
  },
  success: {
    light: "bg-green-100 text-green-700",
    solid: "bg-green-600 text-white",
  },
  error: {
    light: "bg-red-100 text-red-700",
    solid: "bg-red-600 text-white",
  },
  warning: {
    light: "bg-amber-100 text-amber-700",
    solid: "bg-amber-600 text-white",
  },
  info: {
    light: "bg-sky-100 text-sky-700",
    solid: "bg-sky-600 text-white",
  },
  light: {
    light: "bg-gray-100 text-gray-700",
    solid: "bg-gray-200 text-gray-800",
  },
  dark: {
    light: "bg-gray-200 text-gray-800",
    solid: "bg-gray-800 text-white",
  },
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
  color?: keyof typeof badgeColors;
  size?: keyof typeof badgeSizes;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

function Badge({ 
  className, 
  variant = "default", 
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
  ...props 
}: BadgeProps) {
  // Determine the variant class
  let variantClass = badgeVariants[variant];
  
  // If it's a light or solid variant, add the color-specific class
  if (variant === "light" || variant === "solid") {
    variantClass = badgeColors[color]?.[variant] || variantClass;
  }
  
  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-medium leading-normal transition-colors gap-1",
        badgeSizes[size],
        variantClass,
        className
      )} 
      {...props} 
    >
      {startIcon && <span className="h-3.5 w-3.5">{startIcon}</span>}
      {children}
      {endIcon && <span className="h-3.5 w-3.5">{endIcon}</span>}
    </div>
  );
}

export default Badge;
export { Badge };
