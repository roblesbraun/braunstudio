import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
    // Create an arc path from ~8 o'clock to ~4 o'clock (about 240° of arc)
    // Using SVG arc: M startX startY A rx ry x-axis-rotation large-arc-flag sweep-flag endX endY
    const radius = 10;
    const centerX = 12;
    const centerY = 12;

    // 8 o'clock position (240 degrees)
    const startAngle = (240 * Math.PI) / 180;
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);

    // 4 o'clock position (120 degrees)
    const endAngle = (120 * Math.PI) / 180;
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    return (
        <svg
            className={cn("animate-spin", className)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="status"
            aria-label="Loading"
            {...props}
        >
            <path
                d={`M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-75"
            />
        </svg>
    );
}

export { Spinner };
