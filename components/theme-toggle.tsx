"use client"

import * as React from "react"
import { CircleDashed, Flame, Sun, TerminalSquare, CassetteTape, Leaf } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Add a 'trigger' prop to the interface
interface ThemeToggleProps extends Omit<React.ComponentProps<typeof Button>, 'asChild'> {
  trigger?: React.ReactNode;
  showLabel?: boolean;
  labelText?: React.ReactNode;
}

export function ThemeToggle({ className, trigger, showLabel, labelText, ...props }: ThemeToggleProps) {
  const { setTheme, theme, resolvedTheme } = useTheme()

  // Determine the icon to display
  let IconComponent;
  const iconClassName = "h-4 w-4 hover:text-sidebar-accent";

  // Use `theme` if it's one of the explicit themes we set
  // Otherwise, rely on `resolvedTheme` which handles 'system' or initial undefined `theme`
  const activeTheme = (theme && theme !== 'system') ? theme : resolvedTheme;

  switch (activeTheme) {
    case "light":
      IconComponent = <Sun className={iconClassName} />;
      break;
    case "dark":
      IconComponent = <Flame className={iconClassName} />;
      break;
    case "black":
      IconComponent = <CircleDashed className={iconClassName} />;
      break;
    case "sunset":
      IconComponent = <Sun className={iconClassName} />; // Using Sun for sunset
      break;
    case "cyberpunk":
      IconComponent = <TerminalSquare className={iconClassName} />;
      break;
    case "retro":
      IconComponent = <CassetteTape className={iconClassName} />;
      break;
    case "nature":
      IconComponent = <Leaf className={iconClassName} />;
      break;
    default:
      // Fallback if activeTheme is somehow still not recognized
      IconComponent = <Flame className={iconClassName} />; // Default to Flame
  }

  // Conditionally render the trigger or the default button
  const TriggerComponent = trigger ? (
    <DropdownMenuTrigger asChild={true}>{trigger}</DropdownMenuTrigger>
  ) : (
    <DropdownMenuTrigger asChild={true}>
      <Button
        variant="ghost"
        size={showLabel && labelText ? "default" : "icon"}
        className={cn(
          `rounded-md`,
          showLabel && labelText ? "px-2 py-1 h-auto" : "", // Adjust padding/height if label is shown
          className
        )}
        {...props}
      >
        {IconComponent}
        {showLabel && labelText && <span>{labelText}</span>}
        {(!showLabel || !labelText) && <span className="sr-only">Toggle theme</span>}
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {TriggerComponent}
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Flame className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("black")}>
          <CircleDashed className="mr-2 h-4 w-4" />
          <span>Black</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("sunset")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Sunset</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("cyberpunk")}>
          <TerminalSquare className="mr-2 h-4 w-4" />
          <span>Cyberpunk</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("retro")}>
          <CassetteTape className="mr-2 h-4 w-4" />
          <span>Retro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("nature")}>
          <Leaf className="mr-2 h-4 w-4" />
          <span>Nature</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}