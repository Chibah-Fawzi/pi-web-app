import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClientDashboard } from "@/components/client-dashboard";
import { getSystemDetails } from "@/lib/system";

export default async function Home() {
  const systemInfo = await getSystemDetails();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Welcome to Your Raspberry Pi
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            Monitor performance, chat with your local model via{" "}
            <code className="text-sm">pi-chat</code>, and add more features from
            one app.
          </p>
        </section>

        <ClientDashboard initialData={systemInfo} />

        <section className="mb-12">
          <h3 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Features
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white/80 backdrop-blur-sm transition-shadow hover:shadow-lg dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">📊</span>
                  <span>Live System Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time CPU, memory, temperature, and storage via SSE.
                </p>
                <span className="mt-3 inline-block text-sm text-green-600">
                  ✓ Active
                </span>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm transition-shadow hover:shadow-lg dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">💬</span>
                  <span>LLM Chat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Uses the <code className="text-sm">pi-chat</code> API server to
                  reach Ollama (streaming).
                </p>
                <span className="mt-3 inline-block text-sm text-green-600">
                  ✓ Active
                </span>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm transition-shadow hover:shadow-lg dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">💾</span>
                  <span>Storage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Disk usage from the host.
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used:</span>
                    <span className="font-medium">{systemInfo.storage.used}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">
                      {systemInfo.storage.available} / {systemInfo.storage.total}
                    </span>
                  </div>
                  <Progress
                    value={parseFloat(systemInfo.storage.usagePercent)}
                    className={`mt-2 h-2 ${
                      parseFloat(systemInfo.storage.usagePercent) > 90
                        ? "[&>div]:bg-red-500"
                        : parseFloat(systemInfo.storage.usagePercent) > 70
                          ? "[&>div]:bg-orange-500"
                          : "[&>div]:bg-green-500"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm transition-shadow hover:shadow-lg dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">⚡</span>
                  <span>Load average</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Load (1m):</span>
                    <span className="font-medium">
                      {systemInfo.loadAverage.oneMin.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Load (5m):</span>
                    <span className="font-medium">
                      {systemInfo.loadAverage.fiveMin.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Load (15m):</span>
                    <span className="font-medium">
                      {systemInfo.loadAverage.fifteenMin.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
