import type { ReactNode } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppSelectOption = {
  value: string;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
};

type AppSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  shape?: "pill" | "field";
  size?: "sm" | "md";
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function AppSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select",
  ariaLabel,
  id,
  disabled,
  shape = "field",
  size = "md",
  icon,
  className,
  contentClassName,
}: AppSelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "group inline-flex w-full min-w-0 items-center justify-between gap-2 border border-(--color-border) bg-white text-left text-sm font-medium text-(--color-text-primary) outline-none transition-[border-color,box-shadow,background-color] hover:border-(--brand-accent)/50 focus-visible:border-(--brand-accent) focus-visible:ring-4 focus-visible:ring-(--brand-accent)/12 data-[state=open]:border-(--brand-accent) data-[state=open]:ring-4 data-[state=open]:ring-(--brand-accent)/12 data-placeholder:font-normal data-placeholder:text-(--color-text-muted) disabled:cursor-not-allowed disabled:bg-(--color-background-alt) disabled:text-(--color-text-secondary) disabled:hover:border-(--color-border)",
          shape === "pill" ? "rounded-full" : "rounded-xl",
          size === "sm" ? "h-9 px-3.5 text-[13px]" : "h-10 px-4",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon ? <span className="shrink-0 text-(--color-text-muted)">{icon}</span> : null}
          <span className="truncate">
            <SelectPrimitive.Value placeholder={placeholder} />
          </span>
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            className="size-4 shrink-0 text-(--color-text-muted) transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-(--brand-accent)"
            strokeWidth={2}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            "z-[80] max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-(--color-border) bg-white shadow-[0_12px_32px_-12px_rgba(30,27,75,0.25)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport className="max-h-[inherit] overflow-y-auto p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex cursor-pointer select-none items-center gap-3 rounded-lg py-2 pr-9 pl-3 text-sm text-(--color-text-primary) outline-none transition-colors data-disabled:pointer-events-none data-disabled:opacity-45 data-highlighted:bg-(--color-background-alt) data-[state=checked]:bg-(--brand-accent-soft) data-[state=checked]:font-semibold data-[state=checked]:text-(--brand-accent)"
              >
                <span className="min-w-0">
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  {option.description ? (
                    <span className="mt-0.5 block text-xs font-normal text-(--color-text-secondary)">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                <SelectPrimitive.ItemIndicator className="absolute right-3 inline-flex">
                  <Check className="size-4" strokeWidth={2.25} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
