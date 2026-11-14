// cPanel / Phusion Passenger CommonJS bootstrapper for ESM dist/server.js
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

import('./dist/server.js').catch((err) => {
  console.error('Failed to start WATCH & EARN BD server:', err);
  process.exit(1);
});
