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
}

export function ThemeToggle({ className, trigger, ...props }: ThemeToggleProps) {
  const { setTheme } = useTheme()

  // Conditionally render the trigger or the default button
  const TriggerComponent = trigger ? (
    <DropdownMenuTrigger asChild={true}>{trigger}</DropdownMenuTrigger>
  ) : (
    <DropdownMenuTrigger asChild={true}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(`rounded-md`, className)}
        {...props}
      >
        <Flame className="h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0 dark:-rotate-90 hover:text-sidebar-accent" />
        <Sun className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-0 light:rotate-0 light:scale-100 hover:text-sidebar-accent" />
        <span className="sr-only">Toggle theme</span>
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