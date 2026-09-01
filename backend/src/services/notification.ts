// ============================================================================
// NOTIFICATION SERVICE ABSTRACTION (Sections 32/57)
// Implements Web/SMS/IVR behind one interface so real providers (e.g.
// Twilio, MSG91, Exotel) can be dropped in later without touching callers.
// For this build, SMS/IVR are explicitly mocked and logged to the
// `notifications` table with status='mocked' — never claimed as real.
// ============================================================================

import { newId, nowIso } from '../utils/db'

export interface NotificationService {
  readonly channel: 'web' | 'sms' | 'ivr'
  send(userId: string | undefined, title: string, message: string): Promise<{ status: string }>
}

abstract class BaseNotificationService implements NotificationService {
  abstract readonly channel: 'web' | 'sms' | 'ivr'
  constructor(protected db: D1Database) {}

  async send(userId: string | undefined, title: string, message: string): Promise<{ status: string }> {
    const status = this.channel === 'web' ? 'sent' : 'mocked'
    await this.db
      .prepare('INSERT INTO notifications (id, user_id, channel, title, message, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)')
      .bind(newId('notif'), userId ?? null, this.channel, title, message, status, nowIso())
      .run()
    return { status }
  }
}

export class WebNotificationService extends BaseNotificationService {
  readonly channel = 'web' as const
}

export class MockSMSService extends BaseNotificationService {
  readonly channel = 'sms' as const
}

export class MockIVRService extends BaseNotificationService {
  readonly channel = 'ivr' as const
}

export function getNotificationServices(db: D1Database) {
  return {
    web: new WebNotificationService(db),
    sms: new MockSMSService(db),
    ivr: new MockIVRService(db),
  }
}
