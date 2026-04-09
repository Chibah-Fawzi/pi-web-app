import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

// Track if we've already warned about vcgencmd not being available
let vcgencmdWarningShown = false;

function getCpuUsage() {
  const cpus = os.cpus();
  return cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    const usage = 100 - (100 * cpu.times.idle) / total;
    return usage.toFixed(1);
  });
}

async function getCpuTemp() {
  try {
    const { stdout } = await execAsync("vcgencmd measure_temp");
    // in celsius! OBVIOUSLY!
    return parseFloat(stdout.replace("temp=", "").replace("'C", ""));
  } catch (error) {
    // Fallback for non-Raspberry Pi environments (like Docker build)
    if (!vcgencmdWarningShown) {
      console.warn("vcgencmd not available, using fallback temperature");
      vcgencmdWarningShown = true;
    }
    return 25.0; // Default temperature in Celsius
  }
}

function bytesToGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

function bytesToMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

async function getStorageInfo() {
  try {
    const { stdout } = await execAsync("df -h /");
    const lines = stdout.trim().split('\n');
    const dataLine = lines[1].split(/\s+/);
    
    return {
      total: dataLine[1],
      used: dataLine[2],
      available: dataLine[3],
      usagePercent: dataLine[4].replace('%', ''),
      mountPoint: dataLine[5]
    };
  } catch (error) {
    return {
      total: "Unknown",
      used: "Unknown", 
      available: "Unknown",
      usagePercent: "0",
      mountPoint: "/"
    };
  }
}

async function getUptime() {
  try {
    // First try to read the host's uptime from /host/proc/uptime
    const uptimeData = await fs.promises.readFile('/host/proc/uptime', 'utf8');
    const uptimeSeconds = parseFloat(uptimeData.split(' ')[0]);
    
    // Convert seconds to human readable format
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    
    if (days > 0) {
      return `up ${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `up ${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `up ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  } catch (error) {
    try {
      // Fallback: try to run uptime command on the host
      const { stdout } = await execAsync("uptime -p");
      return stdout.trim();
    } catch (uptimeError) {
      try {
        // Fallback to regular uptime command and parse the output
        const { stdout } = await execAsync("uptime");
        const uptimeMatch = stdout.match(/up\s+(.+?),\s+\d+\s+users/);
        if (uptimeMatch) {
          return `up ${uptimeMatch[1]}`;
        }
        // If parsing fails, return the raw output
        return stdout.trim();
      } catch (fallbackError) {
        // Final fallback for environments where uptime command is not available
        return "Unknown";
      }
    }
  }
}

async function getLoadAverage() {
  try {
    const { stdout } = await execAsync("uptime");
    const loadMatch = stdout.match(/load average: ([\d.]+), ([\d.]+), ([\d.]+)/);
    if (loadMatch) {
      return {
        oneMin: parseFloat(loadMatch[1]),
        fiveMin: parseFloat(loadMatch[2]),
        fifteenMin: parseFloat(loadMatch[3])
      };
    }
  } catch (error) {
    // Fallback to os.loadavg()
  }
  
  const load = os.loadavg();
  return {
    oneMin: load[0],
    fiveMin: load[1], 
    fifteenMin: load[2]
  };
}

export async function getSystemDetails() {
  // Get CPU usage
  const cpuUsage = getCpuUsage();

  // Get memory info
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
 
  const cpuTemp = await getCpuTemp();
  const storageInfo = await getStorageInfo();
  const uptime = await getUptime();
  const loadAverage = await getLoadAverage();

  return {
    cpuTemp,
    cpuUsage,
    memoryUsage: {
      total: parseFloat(bytesToGB(totalMem)),
      used: parseFloat(bytesToGB(usedMem)),
      free: parseFloat(bytesToGB(freeMem)),
    },
    storage: storageInfo,
    uptime,
    loadAverage,
    cpuCount: os.cpus().length,
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    release: os.release(),
  };
}
