export const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const getControllerUrl = (sessionId: string, customHost?: string) => {
  const protocol = window.location.protocol;
  
  // Use custom IP if provided, otherwise use current window host (which includes port)
  let host = customHost || window.location.host;

  // IMPORTANT: If user provided a manual IP (customHost) and it doesn't have a port, 
  // we MUST append the current port (usually 5173) or the phone won't connect.
  if (customHost && window.location.port && !customHost.includes(':')) {
      host = `${customHost}:${window.location.port}`;
  }

  return `${protocol}//${host}/#/controller?session=${sessionId}`;
};

export const getQRCodeUrl = (data: string) => {
  // Using a public API for QR code generation to avoid heavy local dependencies for this demo
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}`;
};