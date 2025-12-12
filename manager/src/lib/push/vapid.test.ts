import { sendPushNotification, sendBulkPushNotifications, PushSubscription, PushPayload } from './vapid';

// Mock web-push
jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
}));

describe('VAPID Push Notifications', () => {
  const mockSubscription: PushSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test',
    keys: {
      p256dh: 'test-p256dh-key',
      auth: 'test-auth-key',
    },
  };

  const mockPayload: PushPayload = {
    title: 'Test Notification',
    body: 'This is a test',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPushNotification', () => {
    it('should send push notification successfully', async () => {
      const webpush = require('web-push');
      webpush.sendNotification.mockResolvedValue(undefined);

      const result = await sendPushNotification(mockSubscription, mockPayload);
      
      expect(result.success).toBe(true);
      expect(webpush.sendNotification).toHaveBeenCalledWith(
        mockSubscription,
        JSON.stringify(mockPayload)
      );
    });

    it('should handle expired subscriptions', async () => {
      const webpush = require('web-push');
      const error = new Error('Subscription expired');
      (error as any).statusCode = 410;
      webpush.sendNotification.mockRejectedValue(error);

      const result = await sendPushNotification(mockSubscription, mockPayload);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Subscription expired');
    });

    it('should handle other errors', async () => {
      const webpush = require('web-push');
      const error = new Error('Network error');
      webpush.sendNotification.mockRejectedValue(error);

      const result = await sendPushNotification(mockSubscription, mockPayload);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('sendBulkPushNotifications', () => {
    it('should send bulk notifications', async () => {
      const webpush = require('web-push');
      webpush.sendNotification.mockResolvedValue(undefined);

      const subscriptions = [mockSubscription, mockSubscription];
      const result = await sendBulkPushNotifications(subscriptions, mockPayload);
      
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.expired).toHaveLength(0);
    });

    it('should track expired subscriptions', async () => {
      const webpush = require('web-push');
      const error = new Error('Subscription expired');
      (error as any).statusCode = 410;
      
      webpush.sendNotification
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(error);

      const subscriptions = [mockSubscription, { ...mockSubscription, endpoint: 'expired' }];
      const result = await sendBulkPushNotifications(subscriptions, mockPayload);
      
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.expired).toHaveLength(1);
      expect(result.expired[0]).toBe('expired');
    });

    it('should handle all failures', async () => {
      const webpush = require('web-push');
      webpush.sendNotification.mockRejectedValue(new Error('Network error'));

      const subscriptions = [mockSubscription, mockSubscription];
      const result = await sendBulkPushNotifications(subscriptions, mockPayload);
      
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(2);
    });
  });
});
