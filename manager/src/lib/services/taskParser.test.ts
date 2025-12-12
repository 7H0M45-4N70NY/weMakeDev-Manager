import { parseTaskFromText, isValidParsedTask } from './taskParser';

describe('Task Parser', () => {
  describe('parseTaskFromText', () => {
    it('should parse simple task without modifiers', () => {
      const result = parseTaskFromText('Call mom');
      expect(result.title).toBe('Call mom');
      expect(result.priority).toBe(0);
      expect(result.deadline).toBeUndefined();
    });

    it('should handle empty input', () => {
      const result = parseTaskFromText('');
      expect(result.title).toBe('');
      expect(result.priority).toBe(0);
    });

    it('should handle whitespace-only input', () => {
      const result = parseTaskFromText('   ');
      expect(result.title).toBe('');
    });

    describe('deadline extraction', () => {
      it('should detect "today" keyword', () => {
        const result = parseTaskFromText('Finish report today');
        expect(result.title).toBe('Finish report');
        expect(result.deadline).toBeDefined();
        const deadline = new Date(result.deadline!);
        const today = new Date();
        expect(deadline.getDate()).toBe(today.getDate());
      });

      it('should detect "tomorrow" keyword', () => {
        const result = parseTaskFromText('Call mom tomorrow');
        expect(result.title).toBe('Call mom');
        expect(result.deadline).toBeDefined();
        const deadline = new Date(result.deadline!);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        expect(deadline.getDate()).toBe(tomorrow.getDate());
      });

      it('should detect "tmr" abbreviation', () => {
        const result = parseTaskFromText('Meeting tmr');
        expect(result.title).toBe('Meeting');
        expect(result.deadline).toBeDefined();
      });

      it('should detect "next week" keyword', () => {
        const result = parseTaskFromText('Review code next week');
        expect(result.title).toBe('Review code');
        expect(result.deadline).toBeDefined();
        const deadline = new Date(result.deadline!);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        expect(deadline.getDate()).toBe(nextWeek.getDate());
      });

      it('should detect day of week', () => {
        const result = parseTaskFromText('Submit report by Friday');
        expect(result.title).toBe('Submit report');
        expect(result.deadline).toBeDefined();
        const deadline = new Date(result.deadline!);
        expect(deadline.getDay()).toBe(5); // Friday
      });

      it('should detect "on Monday"', () => {
        const result = parseTaskFromText('Team meeting on Monday');
        expect(result.title).toBe('Team meeting');
        expect(result.deadline).toBeDefined();
        const deadline = new Date(result.deadline!);
        expect(deadline.getDay()).toBe(1); // Monday
      });
    });

    describe('priority extraction', () => {
      it('should detect "urgent" as priority 10', () => {
        const result = parseTaskFromText('Urgent: Fix production bug');
        expect(result.title).toBe('Fix production bug');
        expect(result.priority).toBe(10);
      });

      it('should detect "asap" as priority 10', () => {
        const result = parseTaskFromText('Call client asap');
        expect(result.title).toBe('Call client');
        expect(result.priority).toBe(10);
      });

      it('should detect "critical" as priority 10', () => {
        const result = parseTaskFromText('Critical server issue');
        expect(result.title).toBe('server issue');
        expect(result.priority).toBe(10);
      });

      it('should detect "important" as priority 7', () => {
        const result = parseTaskFromText('Important meeting prep');
        expect(result.title).toBe('meeting prep');
        expect(result.priority).toBe(7);
      });

      it('should detect "high priority" as priority 7', () => {
        const result = parseTaskFromText('High priority task');
        expect(result.title).toBe('task');
        expect(result.priority).toBe(7);
      });

      it('should detect "low priority" as priority 2', () => {
        const result = parseTaskFromText('Low priority cleanup');
        expect(result.title).toBe('cleanup');
        expect(result.priority).toBe(2);
      });

      it('should default to priority 0 when no keyword', () => {
        const result = parseTaskFromText('Regular task');
        expect(result.priority).toBe(0);
      });
    });

    describe('combined extraction', () => {
      it('should extract both deadline and priority', () => {
        const result = parseTaskFromText('Urgent: Submit report tomorrow');
        expect(result.title).toBe('Submit report');
        expect(result.priority).toBe(10);
        expect(result.deadline).toBeDefined();
      });

      it('should handle priority before deadline', () => {
        const result = parseTaskFromText('Important meeting tomorrow');
        expect(result.title).toBe('meeting');
        expect(result.priority).toBe(7);
        expect(result.deadline).toBeDefined();
      });

      it('should handle deadline before priority', () => {
        const result = parseTaskFromText('Tomorrow urgent call');
        expect(result.title).toBe('call');
        expect(result.priority).toBe(10);
        expect(result.deadline).toBeDefined();
      });
    });

    describe('edge cases', () => {
      it('should preserve title when all text is modifiers', () => {
        const result = parseTaskFromText('tomorrow urgent');
        // Should fallback to original text if cleaning removes everything meaningful
        expect(result.title.length).toBeGreaterThan(0);
      });

      it('should handle case insensitivity', () => {
        const result = parseTaskFromText('URGENT: Call TOMORROW');
        expect(result.priority).toBe(10);
        expect(result.deadline).toBeDefined();
      });

      it('should normalize whitespace', () => {
        const result = parseTaskFromText('  Call   mom   tomorrow  ');
        expect(result.title).toBe('Call mom');
      });
    });
  });

  describe('isValidParsedTask', () => {
    it('should return true for valid task', () => {
      const task = { title: 'Valid task', priority: 5 };
      expect(isValidParsedTask(task)).toBe(true);
    });

    it('should return false for empty title', () => {
      const task = { title: '', priority: 0 };
      expect(isValidParsedTask(task)).toBe(false);
    });

    it('should return false for title exceeding 255 chars', () => {
      const task = { title: 'a'.repeat(256), priority: 0 };
      expect(isValidParsedTask(task)).toBe(false);
    });

    it('should return true for title at exactly 255 chars', () => {
      const task = { title: 'a'.repeat(255), priority: 0 };
      expect(isValidParsedTask(task)).toBe(true);
    });
  });
});
