import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';

// Store active AudioHook sessions and their browser listeners
const sessionListeners = new Map<string, Set<WebSocket>>();

export const addBrowserAudioRoute = (fastify: FastifyInstance, path: string): void => {
    
    // WebSocket endpoint for browsers to connect and listen to sessions
    fastify.get<{
        Querystring: {
            sessionId?: string;
        }
    }>(path, {
        websocket: true
    }, (connection, request) => {
        
        const sessionId = request.query.sessionId;
        
        if (!sessionId) {
            connection.socket.close(1008, 'Missing sessionId parameter');
            return;
        }

        fastify.log.info(`Browser client connected for session: ${sessionId}`);
        
        // Add this browser connection to listeners for this session
        if (!sessionListeners.has(sessionId)) {
            sessionListeners.set(sessionId, new Set());
        }
        sessionListeners.get(sessionId)!.add(connection.socket);

        connection.socket.on('close', () => {
            fastify.log.info(`Browser client disconnected from session: ${sessionId}`);
            const listeners = sessionListeners.get(sessionId);
            if (listeners) {
                listeners.delete(connection.socket);
                if (listeners.size === 0) {
                    sessionListeners.delete(sessionId);
                }
            }
        });

        connection.socket.on('error', (err) => {
            fastify.log.error(`Browser WebSocket error for session ${sessionId}:`, err);
        });
    });
};

// Function to broadcast audio data to all browser listeners of a session
export const broadcastAudioToBrowsers = (sessionId: string, audioData: Buffer, channel: 'external' | 'internal' | 'mixed') => {
    const listeners = sessionListeners.get(sessionId);
    if (!listeners || listeners.size === 0) {
        return;
    }

    // Send as JSON with metadata
    const message = JSON.stringify({
        type: 'audio',
        channel,
        data: audioData.toString('base64'),
        timestamp: Date.now()
    });

    listeners.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
};

// Function to send session metadata to browsers
export const broadcastSessionEventToBrowsers = (sessionId: string, event: string, data?: any) => {
    const listeners = sessionListeners.get(sessionId);
    if (!listeners || listeners.size === 0) {
        return;
    }

    const message = JSON.stringify({
        type: 'event',
        event,
        data,
        timestamp: Date.now()
    });

    listeners.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
};
