export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

let currentLevel = LogLevel.WARN;

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

function formatMessage(level: string, msg: string): string {
  return `[celo-minimarket:${level}] ${msg}`;
}

export const logger = {
  debug(msg: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(formatMessage("debug", msg), ...args);
    }
  },
  info(msg: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.INFO) {
      console.info(formatMessage("info", msg), ...args);
    }
  },
  warn(msg: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(formatMessage("warn", msg), ...args);
    }
  },
  error(msg: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(formatMessage("error", msg), ...args);
    }
  },
};
