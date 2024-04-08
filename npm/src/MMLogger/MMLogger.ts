import bunyan from "bunyan";
import { MMLoggerMetadata } from "./MMLogger.types";
import httpContext from "express-http-context";

/**
 * Main Metric Mongrel Logger.
 * This is a special logger since you can specify metadata. Depending if you are
 * running in a http context, the metadata will be saved as follows:
 * - Running with a HTTP context (e.g. express server): Metadata is saved in the http context, and is unique per request
 * - Running standalone (e.g. in a script): Metadata is saved in the class itself and persists for the entire life of the class
 */
export class MMLogger {
  private logger: bunyan;
  private metadata?: MMLoggerMetadata;

  constructor(loggerName: string) {
    this.logger = bunyan.createLogger({ name: loggerName });
  }

  public setMetadata(metadata: MMLoggerMetadata): void {
    /**
     * Use the express http context to set this metadata
     */
    if (!httpContext.ns.active) {
      this.logger.warn(
        `No HTTP context detected. Metadata will be saved directly to the logger`
      );
      this.metadata = metadata;
    } else {
      httpContext.set("metadata", metadata);
    }
  }

  /**
   * Log an info with the metadata
   */
  public info(message: string, ...args: any[]): void {
    this.logger.info(`${this.getMetadataLoggerString()}${message}`, ...args);
  }

  /**
   * Log an warn with the metadata
   */
  public warn(message: string, ...args: any[]): void {
    this.logger.debug(`${this.getMetadataLoggerString()}${message}`, ...args);
  }

  /**
   * Log an error with the metadata
   */
  public error(message: string, ...args: any[]): void {
    this.logger.error(`${this.getMetadataLoggerString()}${message}`, ...args);
  }

  /**
   * Log an debug with the metadata
   */
  public debug(message: string, ...args: any[]): void {
    this.logger.debug(`${this.getMetadataLoggerString()}${message}`, ...args);
  }

  /**
   * Get a pretty printed version of the metadata stored
   * to attach to a log
   */
  private getMetadataLoggerString() {
    const metadata = this.getMetadataFromStorage();
    if (metadata && Object.keys(metadata).length > 0) {
      let toReturn = "[";
      for (const [key, value] of Object.entries(metadata)) {
        toReturn += `${key}=${value};`;
      }
      toReturn = toReturn.slice(0, -1);
      toReturn += "] ";
      return toReturn;
    }
    return "";
  }

  /**
   * Gets metadata from storage (either HTTP contet or class)
   */
  private getMetadataFromStorage(): MMLoggerMetadata {
    let metadata = this.metadata ?? {};
    if (httpContext.ns.active) {
      metadata = httpContext.get("metadata");
    }
    return metadata;
  }

  /**
   * Get metadata needed when an error is triggered
   */
  getMetadata(): MMLoggerMetadata {
    return this.getMetadataFromStorage();
  }
}
