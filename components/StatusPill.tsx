import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { memo, useMemo } from "react";

interface StatusPillProps {
  status: "not-started" | "in-progress" | "complete";
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
}

export const StatusPill = memo(function StatusPill({ status, className, onClick, "aria-label": ariaLabel }: StatusPillProps) {
  const statusStyles = useMemo(() => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "complete":
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
        case "in-progress":
          return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      }
    };

    const getStatusDot = (status: string) => {
      switch (status) {
        case "complete":
          return "bg-green-600";
        case "in-progress":
          return "bg-amber-600";
        default:
          return "bg-gray-600";
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case "complete":
          return "Complete";
        case "in-progress":
          return "In progress";
        default:
          return "Not started";
      }
    };

    return {
      color: getStatusColor(status),
      dot: getStatusDot(status),
      label: getStatusLabel(status),
    };
  }, [status]);

  const content = (
    <>
      <span className={cn("w-1.5 h-1.5 rounded-full", statusStyles.dot)} aria-hidden="true" />
      {statusStyles.label}
    </>
  );

  if (onClick) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className={cn("text-xs px-3 py-2 rounded-full inline-flex items-center gap-1.5 min-h-[44px]", statusStyles.color, className)}
        aria-label={ariaLabel || `Cycle status, currently ${statusStyles.label}`}
      >
        {content}
      </Button>
    );
  }

  return (
    <span className={cn("text-xs px-3 py-2 rounded-full inline-flex items-center gap-1.5 min-h-[44px]", statusStyles.color, className)}>
      {content}
    </span>
  );
});
