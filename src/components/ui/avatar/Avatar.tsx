"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
  status?: 'online' | 'offline' | 'busy';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, size = 'medium', status, ...props }, ref) => {
    // Size classes
    const sizeClasses = {
      xsmall: 'h-6 w-6',
      small: 'h-8 w-8',
      medium: 'h-10 w-10',
      large: 'h-12 w-12',
      xlarge: 'h-16 w-16',
      xxlarge: 'h-20 w-20',
    };

    // Status indicator classes
    const statusClasses = {
      online: 'bg-green-500',
      offline: 'bg-gray-500',
      busy: 'bg-red-500',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && (
          <img
            src={src}
            alt="Avatar"
            className="aspect-square h-full w-full object-cover"
          />
        )}
        
        {status && (
          <span className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            statusClasses[status],
            size === 'xsmall' || size === 'small' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'
          )}/>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export default Avatar;
export { Avatar, AvatarFallback, AvatarImage };
