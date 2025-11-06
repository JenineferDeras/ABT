/**
 * Configuration for external integrations
 */
export interface IntegrationConfig {
  name: string;
  enabled: boolean;
  rateLimitPerMinute: number;
  retryAttempts: number;
  timeoutMs: number;
}

/**
 * Base integration class with rate limiting, retry, and timeout logic
 */
export class Integration {
  private callCount = 0;
  private lastReset = Date.now();

  constructor(private cfg: IntegrationConfig) {}

  /**
   * Check and enforce rate limits
   */
  private checkRateLimit(): void {
    const now = Date.now();

    // Reset counter every minute
    if (now - this.lastReset > 60_000) {
      this.callCount = 0;
      this.lastReset = now;
    }

    if (this.callCount >= this.cfg.rateLimitPerMinute) {
      throw new Error(
        `Rate limit exceeded for ${this.cfg.name}. Max ${this.cfg.rateLimitPerMinute} calls/minute.`
      );
    }

    this.callCount++;
  }

  /**
   * Execute a function with retry logic and timeout
   * @param fn - Async function to execute
   * @returns Promise with the function result
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.cfg.enabled) {
      throw new Error(`${this.cfg.name} integration is disabled`);
    }

    this.checkRateLimit();

    let lastError: unknown;

    for (let attempt = 0; attempt < this.cfg.retryAttempts; attempt++) {
      try {
        // Race between the function and timeout
        const result = await Promise.race<T>([
          fn(),
          new Promise<T>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout after ${this.cfg.timeoutMs}ms`)),
              this.cfg.timeoutMs
            )
          ),
        ]);

        return result;
      } catch (error) {
        lastError = error;
        console.warn(
          `${this.cfg.name} attempt ${attempt + 1}/${this.cfg.retryAttempts} failed:`,
          error
        );

        // Exponential backoff: 500ms, 1s, 2s, 4s...
        if (attempt < this.cfg.retryAttempts - 1) {
          const delay = 2 ** attempt * 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}
