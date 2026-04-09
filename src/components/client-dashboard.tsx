"use client"

import dynamic from "next/dynamic";
import type { SystemData } from "@/hooks/use-system-data";

interface RealTimeDashboardProps {
    initialData: SystemData;
}

// Import RealTimeDashboard as a client-side only component
const RealTimeDashboard = dynamic(() => import("./real-time-dashboard").then(mod => ({ default: mod.RealTimeDashboard })), {
    ssr: false,
    loading: () => (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-muted-foreground">Loading live data...</span>
            </div>
        </div>
    )
});

export function ClientDashboard(props: RealTimeDashboardProps) {
    return <RealTimeDashboard {...props} />;
}
