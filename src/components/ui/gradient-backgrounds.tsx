import { cn } from "@/lib/utils";

interface GradientBackgroundsProps {
  children?: React.ReactNode;
  className?: string;
}

export function GradientBackgrounds({ children, className }: GradientBackgroundsProps) {
  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden", className)}>
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-[30%] -left-[20%] h-[60vh] w-[60vh] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: "hsl(var(--primary))" }}
        />
        <div
          className="absolute top-[20%] -right-[15%] h-[50vh] w-[50vh] rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: "hsl(var(--accent))" }}
        />
        <div
          className="absolute -bottom-[20%] left-[30%] h-[45vh] w-[45vh] rounded-full opacity-[0.06] blur-[110px]"
          style={{ background: "hsl(var(--chart-4))" }}
        />
      </div>
      {children}
    </div>
  );
}

export const Component = GradientBackgrounds;

export default GradientBackgrounds;
