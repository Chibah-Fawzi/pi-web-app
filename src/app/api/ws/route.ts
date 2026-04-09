import { NextRequest } from 'next/server';
import { getSystemDetails } from '@/lib/system';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const interval = parseInt(searchParams.get('interval') || '5000');

  const encoder = new TextEncoder();
  
  let intervalId: NodeJS.Timeout | null = null;
  let isClosed = false;
  const stream = new ReadableStream({
    start(controller) {
      
      const cleanup = () => {
        isClosed = true;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };
      
      const sendData = async () => {
        if (isClosed) return;
        
        try {
          const systemInfo = await getSystemDetails();
          const data = JSON.stringify({
            type: 'system-update',
            data: systemInfo,
            timestamp: new Date().toISOString()
          });
          
          if (!isClosed) {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        } catch (error) {
          console.error('Error fetching system data:', error);
          if (!isClosed) {
            const errorData = JSON.stringify({
              type: 'error',
              message: 'Failed to fetch system data',
              timestamp: new Date().toISOString()
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          }
        }
      };

      // Send initial data
      sendData();

      // Set up interval for periodic updates
      intervalId = setInterval(() => {
        if (!isClosed) {
          sendData();
        }
      }, interval);

      // Handle client disconnect
      request.signal?.addEventListener('abort', cleanup);
    },
    
    cancel() {
      isClosed = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
