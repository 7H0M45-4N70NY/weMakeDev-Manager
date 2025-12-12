import { triggerIngestionFlow, isKestraConfigured, getExecutionStatus } from './client';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Kestra Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isKestraConfigured', () => {
    it('should return false when KESTRA_URL is not set', () => {
      delete process.env.KESTRA_URL;
      delete process.env.KESTRA_API_TOKEN;
      expect(isKestraConfigured()).toBe(false);
    });

    it('should return false when KESTRA_API_TOKEN is not set', () => {
      process.env.KESTRA_URL = 'http://localhost:8080';
      delete process.env.KESTRA_API_TOKEN;
      expect(isKestraConfigured()).toBe(false);
    });

    it('should return true when both URL and token are set', () => {
      process.env.KESTRA_URL = 'http://localhost:8080';
      process.env.KESTRA_API_TOKEN = 'test-token';
      expect(isKestraConfigured()).toBe(true);
    });
  });

  describe('triggerIngestionFlow', () => {
    const mockInput = {
      user_id: 'user-123',
      raw_text: 'Call mom tomorrow',
    };

    it('should return mock response when Kestra is not configured', async () => {
      delete process.env.KESTRA_URL;
      delete process.env.KESTRA_API_TOKEN;

      const result = await triggerIngestionFlow(mockInput);

      expect(result.id).toMatch(/^mock-/);
      expect(result.namespace).toBe('manager');
      expect(result.flowId).toBe('task-ingestion');
      expect(result.state.current).toBe('RUNNING');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should call Kestra API when configured', async () => {
      process.env.KESTRA_URL = 'http://localhost:8080';
      process.env.KESTRA_API_TOKEN = 'test-token';

      const mockResponse = {
        id: 'exec-123',
        namespace: 'manager',
        flowId: 'task-ingestion',
        state: { current: 'RUNNING', startDate: '2025-12-12T00:00:00Z' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await triggerIngestionFlow(mockInput);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/executions/manager/task-ingestion',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on API failure', async () => {
      process.env.KESTRA_URL = 'http://localhost:8080';
      process.env.KESTRA_API_TOKEN = 'test-token';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(triggerIngestionFlow(mockInput)).rejects.toThrow(
        'Kestra API error (500): Internal Server Error'
      );
    });

    it('should use custom namespace from env', async () => {
      process.env.KESTRA_URL = 'http://localhost:8080';
      process.env.KESTRA_API_TOKEN = 'test-token';
      process.env.KESTRA_NAMESPACE = 'custom-ns';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'exec-123' }),
      });

      await triggerIngestionFlow(mockInput);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/executions/custom-ns/task-ingestion',
        expect.any(Object)
      );
    });
  });

  describe('getExecutionStatus', () => {
    it('should return mock status when Kestra is not configured', async () => {
      delete process.env.KESTRA_URL;
      delete process.env.KESTRA_API_TOKEN;

      const result = await getExecutionStatus('exec-123');

      expect(result.state).toBe('SUCCESS');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch execution status from Kestra API', async () => {
      process.env.KESTRA_URL = 'http://localhost:8080';
      process.env.KESTRA_API_TOKEN = 'test-token';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          state: { current: 'SUCCESS' },
          outputs: { taskId: 'task-123' },
        }),
      });

      const result = await getExecutionStatus('exec-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/executions/exec-123',
        expect.objectContaining({
          headers: { 'Authorization': 'Bearer test-token' },
        })
      );
      expect(result.state).toBe('SUCCESS');
      expect(result.outputs).toEqual({ taskId: 'task-123' });
    });

    it('should throw error on API failure', async () => {
      process.env.KESTRA_URL = 'http://localhost:8080';
      process.env.KESTRA_API_TOKEN = 'test-token';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(getExecutionStatus('invalid-id')).rejects.toThrow(
        'Failed to get execution status: Not Found'
      );
    });
  });
});
