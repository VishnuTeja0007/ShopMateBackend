export class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  static info(message: string, data?: any) {
    console.log(`[${this.formatTime()}] INFO: ${message}`, data || '');
  }

  static error(message: string, error?: any) {
    console.error(`[${this.formatTime()}] ERROR: ${message}`, error || '');
  }

  static warn(message: string, data?: any) {
    console.warn(`[${this.formatTime()}] WARN: ${message}`, data || '');
  }

  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.formatTime()}] DEBUG: ${message}`, data || '');
    }
  }
}
