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
  /**
   * Whether to log to the console or via bunyan
   */
  private console: boolean;

  constructor(loggerName: string, config?: { console?: boolean }) {
    this.logger = bunyan.createLogger({ name: loggerName });
    this.console = config?.console ?? false;
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
    const toLog = `${this.getMetadataLoggerString()}${message}`;
    if (this.console) {
      console.log(toLog, ...args);
    } else {
      this.logger.info(toLog, ...args);
    }
  }

  /**
   * Log an warn with the metadata
   */
  public warn(message: string, ...args: any[]): void {
    const toLog = `${this.getMetadataLoggerString()}${message}`;
    if (this.console) {
      console.warn(toLog, ...args);
    } else {
      this.logger.warn(toLog, ...args);
    }
  }

  /**
   * Log an error with the metadata
   */
  public error(message: string, ...args: any[]): void {
    const toLog = `${this.getMetadataLoggerString()}${message}`;
    if (this.console) {
      console.error(toLog, ...args);
    } else {
      this.logger.error(toLog, ...args);
    }
  }

  /**
   * Log an debug with the metadata
   */
  public debug(message: string, ...args: any[]): void {
    const toLog = `${this.getMetadataLoggerString()}${message}`;
    if (this.console) {
      console.debug(toLog, ...args);
    } else {
      this.logger.debug(toLog, ...args);
    }
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
