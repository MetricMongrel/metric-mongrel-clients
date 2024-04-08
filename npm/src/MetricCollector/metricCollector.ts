import { MM_API_KEY, MM_BASE_URL } from "../envVars";

/**
 * Main class to collect and report metrics
 * back to HQ
 */
export class MetricCollector {
  private apiKey: string;
  private baseURL: string;
  constructor() {
    this.apiKey = MM_API_KEY;
    this.baseURL = new URL(MM_BASE_URL).href;
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
      throw new Error(`Failed to send metric: ${res.status}`);
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
    await this.sendPostRequest("/metrics", {
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
    await this.sendPostRequest("/metrics", {
      modelName,
      userInput,
      modelOutput,
      ...(metricMetadata ? metricMetadata : {}),
    });
  }
}
