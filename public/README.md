# AudioHook Browser Player

A web-based real-time audio player for monitoring AudioHook sessions in your browser.

## Features

- **Real-time Audio Playback**: Listen to live AudioHook sessions with µ-law audio decoding
- **Active Session Monitoring**: See all active sessions in real-time
- **Multi-Channel Support**: Monitor and control individual audio channels (internal, external, mixed)
- **Session Management**: Click any active session to quickly connect and start listening
- **Audio Controls**: Mute/unmute individual channels independently
- **Visual Metrics**: Track packets received, buffer size, and playback status

## Usage

### Basic Usage

1. Open `index.html` in your web browser
2. The page will automatically connect to the active sessions monitor
3. View the list of active sessions in the "Active Sessions" section
4. Click on any session to auto-fill the Session ID field
5. Click "Connect" to start listening to the audio

### URL Parameters

You can customize the WebSocket server URL using query parameters:

```
index.html?ws=wss://your-server.com
```

**Examples:**

- Local development: `index.html?ws=ws://localhost:3000`
- Production server: `index.html?ws=wss://audiohook.testk8s.videoengager.eu`

The URL parameter will automatically:
- Set the WebSocket Server URL input field
- Connect to the active sessions monitor on that server
- Override the default server URL

### Manual Connection

If you prefer to connect manually:

1. Edit the "WebSocket Server URL" field to point to your AudioHook server
2. Optionally enter a specific Session ID
3. Click "Connect"

**Note:** The URL should include the full path, e.g.:
- `wss://audiohook.testk8s.videoengager.eu/api/v1/browser/audio`

## Active Sessions Panel

The "Active Sessions" panel shows:
- **Session ID**: Unique identifier for each session
- **Organization ID**: Organization associated with the session
- **Conversation ID**: Conversation identifier
- **Participants**: Information about call participants (ANI, DNIS, names)

Sessions are updated in real-time as they are:
- **Added**: New sessions appear automatically
- **Modified**: Session details update dynamically
- **Deleted**: Ended sessions are removed from the list

## Audio Channels Panel

Once connected to a session, the "Audio Channels" panel displays:
- **Channel name**: `internal`, `external`, or `mixed`
- **Packet count**: Number of audio packets received per channel
- **Mute/Unmute button**: Control playback for each channel independently

### Channel Types

- **internal**: Audio from the internal participant (typically the agent)
- **external**: Audio from the external participant (typically the customer)
- **mixed**: Combined audio from both participants

## Metrics

Real-time metrics displayed:
- **Packets Received**: Total number of audio packets processed
- **Audio Playing**: Current playback status (Yes/No)
- **Buffer Size**: Audio buffer duration in milliseconds
- **Sample Rate**: Audio sample rate (8000 Hz)

## Logs

The logs panel at the bottom shows:
- Connection status updates
- Session events (added, removed)
- Channel detection
- Error messages
- Audio processing events

Color coding:
- 🔵 Blue: Informational messages
- 🟢 Green: Success messages
- 🟡 Yellow: Warnings
- 🔴 Red: Errors

## Technical Details

### Audio Processing

- **Codec**: µ-law (PCMU) audio decoding
- **Sample Rate**: 8000 Hz
- **Audio API**: Web Audio API with automatic context management
- **Buffer Management**: Per-channel playback timing to prevent audio mixing issues

### WebSocket Endpoints

The page connects to two WebSocket endpoints:

1. **Browser Audio Endpoint** (`/api/v1/browser/audio`)
   - Receives real-time audio data for a specific session
   - Accepts `sessionId` query parameter

2. **Active Connections Endpoint** (`/api/v1/active-connections/ws`)
   - Monitors all active sessions across the server
   - Receives real-time updates about session changes

### Browser Compatibility

Requires a modern browser with support for:
- WebSocket API
- Web Audio API
- ES6 JavaScript features

Tested on:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Troubleshooting

### No audio playback
- Check browser console for errors
- Ensure the session has active audio
- Try unmuting channels
- Click anywhere on the page to resume audio context (browser security requirement)

### Cannot see active sessions
- Check the WebSocket URL is correct
- Verify network connectivity to the server
- Check browser console for connection errors
- The monitor auto-reconnects after 5 seconds if disconnected

### Connection fails
- Ensure the server URL uses the correct protocol (`ws://` or `wss://`)
- Verify the server is running and accessible
- Check for CORS or firewall restrictions

## Development

To modify or extend the player:

1. The entire application is contained in `index.html` (self-contained)
2. Edit the HTML, CSS, and JavaScript as needed
3. No build process required - just refresh the browser

### Key Functions

- `connect()`: Establishes WebSocket connection to audio endpoint
- `connectToActiveSessions()`: Connects to active sessions monitor
- `playAudio()`: Handles audio decoding and playback
- `updateActiveSessionsList()`: Renders active sessions list
- `selectSession()`: Auto-fills session ID when clicking a session

## Security Notes

- Always use `wss://` (WebSocket Secure) in production
- The server may require authentication headers for AudioHook sessions
- Ensure proper CORS configuration on the server side
