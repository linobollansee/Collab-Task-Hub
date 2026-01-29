export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',
};

// Debug logging
if (typeof window !== 'undefined') {
  console.log('[ENV] API URL:', env.apiUrl);
  console.log('[ENV] WebSocket URL:', env.wsUrl);
}
