import { MMLogger } from "../MMLogger/MMLogger";
import { MM_API_KEY, MM_BASE_URL } from "../envVars";

/**
 * Main class to collect and report metrics
 * back to HQ
 */
export class MetricCollector {
  private apiKey: string;
  private baseURL: string;
  private logger: MMLogger;
  constructor() {
    this.apiKey = MM_API_KEY;
    this.baseURL = new URL("v1", MM_BASE_URL).href;
    this.logger = new MMLogger("mm-metrics-collector", { console: true });
  }

  /**
   * Wrapper to send a post request with the apiKey
   * in the header
   */
  private async sendPostRequest(
    endpoint: string,
    body: {
      [key: string]:
        | string
        | boolean
        | number
        | { [key: string]: string | boolean | number };
    }
  ) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (res.status !== 200) {
      console.log(`Failed to send MetricMongal: ${res.status}`);
      this.logger.warn(`Failed to send MetricMongal: ${res.status}`);
    }
  }

  /**
   * Increment a given metric
   */
  public async increment(
    metricName: string,
    metricValue: number = 1,
    metricMetadata?: { [key: string]: number | boolean | string },
    /**
     * Used to indicate if this is the result of an automatic process
     * or a manual trigger
     */
    metricType?: "AUTO" | "MANUAL"
  ) {
    await this.sendPostRequest("/increment", {
      metricName,
      metricValue,
      ...(metricMetadata ? metricMetadata : {}),
      ...(metricType ? { metricType } : {}),
    });
  }

  /**
   * Capture a model input/output
   */
  public async captureModelIO(
    modelName: string,
    userInput: string,
    modelOutput: string,
    metricMetadata?: { [key: string]: number | boolean | string }
  ) {
    await this.sendPostRequest("/modelIO", {
      modelName,
      userInput,
      modelOutput,
      ...(metricMetadata ? metricMetadata : {}),
    });
  }
}
