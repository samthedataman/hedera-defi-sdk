// Jest setup file
// Configure test environment and global settings

// Increase timeout for API calls
jest.setTimeout(30000);

// Mock console.log for cleaner test output
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  // Optionally suppress logs during tests
  if (process.env.SUPPRESS_LOGS === 'true') {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterEach(() => {
  // Restore original console methods
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
});