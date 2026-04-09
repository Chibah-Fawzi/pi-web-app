"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSystemData } from "@/hooks/use-system-data";
import { useEffect } from "react";
import type { SystemData } from "@/hooks/use-system-data";

interface RealTimeDashboardProps {
  initialData: SystemData;
}

export function RealTimeDashboard({ initialData }: RealTimeDashboardProps) {
  const { data, isConnected, error, lastUpdate } = useSystemData(5000);
  const systemInfo = data || initialData;

  // Show a warning if we're using initial data and not connected
  const isUsingInitialData = !data && !isConnected;

  // Debug logging
  useEffect(() => {
    console.log('RealTimeDashboard mounted on client side');
    console.log('WebSocket connection status:', { isConnected, error, hasData: !!data });
  }, [isConnected, error, data]);

  return (
    <>
      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Live Data' : isUsingInitialData ? 'Static Data (No Live Updates)' : 'Disconnected'}
          </span>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Hostname:</span>
                <span className="text-sm font-medium">{systemInfo.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Platform:</span>
                <span className="text-sm font-medium">{systemInfo.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Architecture:</span>
                <span className="text-sm font-medium">{systemInfo.arch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU Cores:</span>
                <span className="text-sm font-medium">{systemInfo.cpuCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>CPU Temperature</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${systemInfo.cpuTemp > 80 ? 'text-red-600 dark:text-red-400' :
                systemInfo.cpuTemp > 60 ? 'text-orange-600 dark:text-orange-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                {systemInfo.cpuTemp.toFixed(1)}°C
              </div>
              <p className={`text-sm mt-2 ${systemInfo.cpuTemp > 80 ? 'text-red-600 dark:text-red-400' :
                systemInfo.cpuTemp > 60 ? 'text-orange-600 dark:text-orange-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                {systemInfo.cpuTemp > 80 ? "🔴 High Temperature" :
                  systemInfo.cpuTemp > 60 ? "🟠 Warm" : "🟢 Normal"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Memory Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${(systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) > 0.9 ? 'text-red-600 dark:text-red-400' :
                (systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) > 0.7 ? 'text-orange-600 dark:text-orange-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                {((systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100).toFixed(1)}%
              </div>
              <p className={`text-sm mt-2 ${(systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) > 0.9 ? 'text-red-600 dark:text-red-400' :
                (systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) > 0.7 ? 'text-orange-600 dark:text-orange-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                {systemInfo.memoryUsage.used.toFixed(1)}GB / {systemInfo.memoryUsage.total.toFixed(1)}GB
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Storage Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${parseFloat(systemInfo.storage.usagePercent) > 90 ? 'text-red-600 dark:text-red-400' :
                parseFloat(systemInfo.storage.usagePercent) > 70 ? 'text-orange-600 dark:text-orange-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                {systemInfo.storage.usagePercent}%
              </div>
              <p className={`text-sm mt-2 ${parseFloat(systemInfo.storage.usagePercent) > 90 ? 'text-red-600 dark:text-red-400' :
                parseFloat(systemInfo.storage.usagePercent) > 70 ? 'text-orange-600 dark:text-orange-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                {systemInfo.storage.used} / {systemInfo.storage.total}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Detailed System Information */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* CPU Usage per Core */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <span>CPU Usage by Core</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemInfo.cpuUsage.map((usage: string, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Core {index}</span>
                  <span className="font-medium">{usage}%</span>
                </div>
                <Progress
                  value={parseFloat(usage)}
                  className={`h-2 ${parseFloat(usage) > 80 ? '[&>div]:bg-red-500' :
                    parseFloat(usage) > 60 ? '[&>div]:bg-orange-500' :
                      '[&>div]:bg-green-500'
                    }`}
                />
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Load Average (1m, 5m, 15m):</span>
                <span className="font-medium">
                  {systemInfo.loadAverage.oneMin.toFixed(2)}, {systemInfo.loadAverage.fiveMin.toFixed(2)}, {systemInfo.loadAverage.fifteenMin.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">🖥️</span>
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Uptime:</span>
              <span className="text-sm font-medium">{systemInfo.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Kernel Release:</span>
              <span className="text-sm font-medium">{systemInfo.release}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Free Memory:</span>
              <span className="text-sm font-medium">{systemInfo.memoryUsage.free.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Available Storage:</span>
              <span className="text-sm font-medium">{systemInfo.storage.available} / {systemInfo.storage.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mount Point:</span>
              <span className="text-sm font-medium">{systemInfo.storage.mountPoint}</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
