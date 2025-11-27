import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';

// Store browser connections listening to active sessions list
const activeConnectionListeners = new Set<WebSocket>();

// Store active sessions with their details
export interface SessionDetail {
    sessionId: string;
    organizationId: string;
    conversationId: string;
    participants: Array<{
        id: string;
        ani?: string;
        aniName?: string;
        dnis?: string;
    }>;
}

const activeSessions = new Map<string, SessionDetail>();

export const addActiveConnectionsRoute = (fastify: FastifyInstance, path: string): void => {
    
    // WebSocket endpoint for browsers to monitor all active sessions
    fastify.get(path, {
        websocket: true
    }, (connection, request) => {
        
        fastify.log.info('Browser client connected to active connections monitor');
        
        // Add this browser connection to listeners
        activeConnectionListeners.add(connection.socket);

        // Send all current active sessions to the newly connected client
        activeSessions.forEach((detail, sessionId) => {
            const message = JSON.stringify({
                type: 'session-change',
                action: 'added',
                session: detail,
                timestamp: Date.now()
            });
            
            if (connection.socket.readyState === WebSocket.OPEN) {
                connection.socket.send(message);
            }
        });

        connection.socket.on('close', () => {
            fastify.log.info('Browser client disconnected from active connections monitor');
            activeConnectionListeners.delete(connection.socket);
        });

        connection.socket.on('error', (err) => {
            fastify.log.error('Active connections WebSocket error:', err);
        });
    });
};

// Function to broadcast session changes to all monitoring browsers
const broadcastSessionChange = (action: 'added' | 'modified' | 'deleted', session: SessionDetail) => {
    if (activeConnectionListeners.size === 0) {
        return;
    }

    const message = JSON.stringify({
        type: 'session-change',
        action,
        session,
        timestamp: Date.now()
    });

    activeConnectionListeners.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
};

// Function to add/update a session
export const addOrUpdateActiveSession = (sessionId: string, detail: Partial<SessionDetail>) => {
    const existing = activeSessions.get(sessionId);
    
    if (existing) {
        // Update existing session
        const updated = { ...existing, ...detail, sessionId };
        activeSessions.set(sessionId, updated);
        broadcastSessionChange('modified', updated);
    } else {
        // Add new session
        const newSession: SessionDetail = {
            sessionId,
            organizationId: detail.organizationId ?? '',
            conversationId: detail.conversationId ?? '',
            participants: detail.participants ?? [],
        };
        activeSessions.set(sessionId, newSession);
        broadcastSessionChange('added', newSession);
    }
};

// Function to remove a session
export const removeActiveSession = (sessionId: string) => {
    const session = activeSessions.get(sessionId);
    if (session) {
        activeSessions.delete(sessionId);
        broadcastSessionChange('deleted', session);
    }
};

// Function to get all active sessions (for debugging/testing)
export const getActiveSessions = (): Map<string, SessionDetail> => {
    return activeSessions;
};
