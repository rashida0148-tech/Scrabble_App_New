import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("h-16 w-16", className)}
      {...props}
    >
      <rect width="100" height="100" rx="12" fill="currentColor" />
      <text
        x="50"
        y="58"
        fontFamily="var(--font-playfair-display), serif"
        fontSize="50"
        fontWeight="bold"
        fill="hsl(var(--background))"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        L
      </text>
      <text
        x="78"
        y="82"
        fontFamily="var(--font-pt-sans), sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="hsl(var(--background))"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        D
      </text>
    </svg>
  );
}
