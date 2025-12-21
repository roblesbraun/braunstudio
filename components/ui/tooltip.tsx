"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    triggerElement: HTMLElement | null;
    setTriggerElement: (el: HTMLElement | null) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function TooltipProvider({
    children,
    delayDuration = 0,
}: {
    children: React.ReactNode;
    delayDuration?: number;
}) {
    return <>{children}</>;
}

function Tooltip({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [triggerElement, setTriggerElement] =
        React.useState<HTMLElement | null>(null);

    return (
        <TooltipContext.Provider
            value={{ open, setOpen, triggerElement, setTriggerElement }}
        >
            <div
                className="relative inline-block"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                {children}
            </div>
        </TooltipContext.Provider>
    );
}

function TooltipTrigger({
    asChild,
    children,
    ...props
}: {
    asChild?: boolean;
    children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
    const context = React.useContext(TooltipContext);
    const ref = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        if (context && ref.current) {
            context.setTriggerElement(ref.current);
        }
    }, [context]);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ...props,
            ref: (el: HTMLElement) => {
                if (el) {
                    ref.current = el;
                    if (context) {
                        context.setTriggerElement(el);
                    }
                }
                if (typeof (children as any).ref === "function") {
                    (children as any).ref(el);
                } else if ((children as any).ref) {
                    (children as any).ref.current = el;
                }
            },
        });
    }
    return (
        <div ref={ref as any} {...props}>
            {children}
        </div>
    );
}

function TooltipContent({
    children,
    side = "right",
    align = "center",
    hidden = false,
    className,
    ...props
}: {
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    hidden?: boolean;
    className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
    const context = React.useContext(TooltipContext);
    const isOpen = context?.open && !hidden;
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!isOpen || !context?.triggerElement || !tooltipRef.current) {
            return;
        }

        const updatePosition = () => {
            const trigger = context.triggerElement;
            const tooltip = tooltipRef.current;
            if (!trigger || !tooltip) return;

            const triggerRect = trigger.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let top = 0;
            let left = 0;

            switch (side) {
                case "right":
                    top =
                        triggerRect.top +
                        triggerRect.height / 2 -
                        tooltipRect.height / 2;
                    left = triggerRect.right + 8;
                    break;
                case "left":
                    top =
                        triggerRect.top +
                        triggerRect.height / 2 -
                        tooltipRect.height / 2;
                    left = triggerRect.left - tooltipRect.width - 8;
                    break;
                case "bottom":
                    top = triggerRect.bottom + 8;
                    left =
                        triggerRect.left +
                        triggerRect.width / 2 -
                        tooltipRect.width / 2;
                    break;
                case "top":
                default:
                    top = triggerRect.top - tooltipRect.height - 8;
                    left =
                        triggerRect.left +
                        triggerRect.width / 2 -
                        tooltipRect.width / 2;
                    break;
            }

            // Adjust for align
            if (align === "start") {
                if (side === "top" || side === "bottom") {
                    left = triggerRect.left;
                } else {
                    top = triggerRect.top;
                }
            } else if (align === "end") {
                if (side === "top" || side === "bottom") {
                    left = triggerRect.right - tooltipRect.width;
                } else {
                    top = triggerRect.bottom - tooltipRect.height;
                }
            }

            setPosition({ top, left });
        };

        updatePosition();
        const interval = setInterval(updatePosition, 100);
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            clearInterval(interval);
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen, side, align, context]);

    if (!isOpen) return null;

    const tooltipContent = (
        <div
            ref={tooltipRef}
            className={cn(
                "fixed z-[9999] rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md pointer-events-none",
                className
            )}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
            {...props}
        >
            {children}
        </div>
    );

    if (typeof document !== "undefined") {
        return createPortal(tooltipContent, document.body);
    }

    return tooltipContent;
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
