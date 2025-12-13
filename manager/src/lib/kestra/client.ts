/**
 * Kestra API Client
 * Handles communication with Kestra workflow orchestration service.
 * Includes mock mode for development/testing without Kestra instance.
 */

export interface KestraWorkflowInput {
  user_id: string;
  raw_text: string;
}

export interface KestraExecutionResponse {
  id: string;
  namespace: string;
  flowId: string;
  state: {
    current: string;
    startDate: string;
  };
}

export interface KestraConfig {
  url: string;
  token: string;
  namespace: string;
}

/**
 * Get Kestra configuration from environment
 */
function getKestraConfig(): KestraConfig | null {
  const url = process.env.KESTRA_URL;
  const token = process.env.KESTRA_API_TOKEN;
  const namespace = process.env.KESTRA_NAMESPACE || 'manager';

  if (!url || !token) {
    return null;
  }

  return { url, token, namespace };
}

/**
 * Check if Kestra is configured
 */
export function isKestraConfigured(): boolean {
  return getKestraConfig() !== null;
}

/**
 * Trigger the task ingestion workflow in Kestra
 * 
 * @param input - Workflow input containing user_id and raw_text
 * @returns Execution response from Kestra
 * @throws Error if Kestra is not configured or API call fails
 */
export async function triggerIngestionFlow(
  input: KestraWorkflowInput
): Promise<KestraExecutionResponse> {
  const config = getKestraConfig();

  if (!config) {
    // In development without Kestra, return mock response
    console.warn('[Kestra] Not configured, using mock mode');
    return mockTriggerIngestionFlow();
  }

  const response = await fetch(
    `${config.url}/api/v1/executions/${config.namespace}/task-ingestion`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: input,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kestra API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Mock implementation for development without Kestra
 */
async function mockTriggerIngestionFlow(): Promise<KestraExecutionResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    id: `mock-${Date.now()}`,
    namespace: 'manager',
    flowId: 'task-ingestion',
    state: {
      current: 'RUNNING',
      startDate: new Date().toISOString(),
    },
  };
}

/**
 * Check the status of a Kestra execution
 * 
 * @param executionId - The execution ID to check
 * @returns Current execution state
 */
export async function getExecutionStatus(
  executionId: string
): Promise<{ state: string; outputs?: Record<string, unknown> }> {
  const config = getKestraConfig();

  if (!config) {
    // Mock response
    return { state: 'SUCCESS' };
  }

  const response = await fetch(
    `${config.url}/api/v1/executions/${executionId}`,
    {
      headers: {
        'Authorization': `Bearer ${config.token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get execution status: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    state: data.state?.current || 'UNKNOWN',
    outputs: data.outputs,
  };
}
