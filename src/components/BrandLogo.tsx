import logo from "@/assets/trizen-mark.png";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imgClassName?: string;
};

export function BrandLogo({ className, imgClassName }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        className,
      )}
    >
      <img
        src={logo}
        alt="Trizen Community"
        width={40}
        height={35}
        decoding="async"
        className={cn("h-full w-full object-contain", imgClassName)}
      />
    </span>
  );
}
