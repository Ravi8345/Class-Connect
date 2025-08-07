// js/logger.js
// Basic logging utility (can expand later)
export function logAction(action, details) {
  console.log(`[${new Date().toISOString()}] ACTION: ${action} DETAILS:`, details);
}
