import { NextFunction, Response, Request } from "express";
import metricCollector from "../MetricCollector";
import { MMLoggerMetadata } from "../MMLogger/MMLogger.types";
import { MMLogger } from "../MMLogger/MMLogger";

/**
 * Log this error to our server, with the metadata of the
 * request
 */
export function AnalyticRequestHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = new Date();
  /**
   * Use close instead of finished, that way all compute is done
   * @see https://nodejs.org/api/stream.html#class-streamwritable
   */
  res.once("close", () => {
    const { path, method } = req;
    const referer = req.headers["referer"];
    const userAgent = req.headers["user-agent"];
    const requestDuration = new Date().getTime() - startTime.getTime();

    /**
     * Report this back to HQ
     * @note This is a un-awaited promise, and will not block the request
     */
    metricCollector.captureRequestLog(
      path,
      method,
      requestDuration,
      referer,
      userAgent
    );
  });
  next();
}
