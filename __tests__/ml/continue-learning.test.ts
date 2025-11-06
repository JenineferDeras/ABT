import { ContinueLearning } from '@/lib/ml/continue-learning';
import type { Prediction } from '@/lib/ml/types';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'mock-prediction-id' },
            error: null,
          })),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockPrediction,
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null,
        })),
      })),
      upsert: jest.fn(() => ({
        error: null,
      })),
    })),
  })),
}));

const mockPrediction: Prediction = {
  id: 'mock-prediction-id',
  modelId: 'test-model',
  customerId: 'cust-1',
  metric: 'default_risk',
  predictedValue: 0.12,
  confidence: 0.88,
  reasoning: 'Test prediction',
  createdAt: new Date().toISOString(),
  status: 'awaiting_feedback',
};

describe('ContinueLearning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordPrediction', () => {
    it('should record a prediction and return its ID', async () => {
      const predictionData = {
        modelId: 'test-model',
        customerId: 'cust-1',
        metric: 'default_risk',
        predictedValue: 0.12,
        confidence: 0.88,
        reasoning: 'Test prediction',
      };

      const id = await ContinueLearning.recordPrediction(predictionData);

      expect(id).toBe('mock-prediction-id');
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback and return accuracy', async () => {
      const result = await ContinueLearning.submitFeedback('mock-prediction-id', 0.15);

      expect(result).toHaveProperty('accuracy');
      expect(typeof result.accuracy).toBe('number');
      expect(result.accuracy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMetrics', () => {
    it('should return model metrics', async () => {
      const metrics = await ContinueLearning.getMetrics('test-model');

      expect(metrics).toHaveProperty('modelId');
      expect(metrics).toHaveProperty('totalPredictions');
      expect(metrics).toHaveProperty('correctPredictions');
      expect(metrics).toHaveProperty('accuracy');
      expect(metrics).toHaveProperty('lastUpdated');
    });
  });
});
