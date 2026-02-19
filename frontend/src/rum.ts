// src/lib/rum.ts
import { AwsRum, type AwsRumConfig } from 'aws-rum-web';

export const RUM_CONFIG: AwsRumConfig = {
  sessionSampleRate: 1,
  identityPoolId: "us-east-1:a0ba72cb-44e5-424c-912d-96a5fcaf6a48",
  endpoint: "https://dataplane.rum.us-east-1.amazonaws.com",
  telemetries: ["http", "errors", "performance"],
  allowCookies: true,
  enableXRay: true,
  signing: true
};

let rumClient: AwsRum | null = null;

export function initializeRum() {
  if (rumClient) return rumClient;

  try {
    const config = RUM_CONFIG;
    const APPLICATION_ID = '085ae878-120f-48bf-a5e8-b5b64716f233';
    const APPLICATION_VERSION = '1.0.0';
    const APPLICATION_REGION = 'us-east-1';

    rumClient = new AwsRum(
      APPLICATION_ID,
      APPLICATION_VERSION,
      APPLICATION_REGION,
      config
    );
  } catch (error) {
    console.warn('RUM initialization skipped:', error);
  }

  return rumClient;
}

export function recordPageView(location: string) {
  if (rumClient) {
    rumClient.recordPageView(location);
  }
}