/**
 * Task Parser Service
 * Parses raw text input into structured task data using regex patterns.
 * MVP implementation - can be enhanced with NLP/LLM later.
 */

export interface ParsedTask {
  title: string;
  deadline?: string;
  priority: number;
  description?: string;
}

// Deadline patterns
const DEADLINE_PATTERNS = {
  today: /\b(today|tonight|this evening)\b/i,
  tomorrow: /\b(tomorrow|tmr|tmrw)\b/i,
  nextWeek: /\b(next week)\b/i,
  thisWeek: /\b(this week|end of week)\b/i,
  // Match specific days: "on Monday", "by Friday"
  dayOfWeek: /\b(on|by|before)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  // Match dates: "Dec 15", "December 15th", "12/15"
  specificDate: /\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\w+\s+\d{1,2}(?:st|nd|rd|th)?)\b/i,
};

// Priority patterns
const PRIORITY_PATTERNS = {
  urgent: /\b(urgent|asap|critical|emergency|immediately)\b/i,
  high: /\b(important|high priority|high|must)\b/i,
  medium: /\b(medium priority|moderate|should)\b/i,
  low: /\b(low priority|low|whenever|someday|maybe)\b/i,
};

// Time patterns to extract from title (reserved for future use)
// const TIME_PATTERN = /\b(at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i;

/**
 * Calculate deadline date from keyword
 */
function calculateDeadline(keyword: string): string {
  const now = new Date();
  const result = new Date(now);

  switch (keyword.toLowerCase()) {
    case 'today':
    case 'tonight':
    case 'this evening':
      // Set to end of today
      result.setHours(23, 59, 59, 999);
      break;

    case 'tomorrow':
    case 'tmr':
    case 'tmrw':
      result.setDate(result.getDate() + 1);
      result.setHours(17, 0, 0, 0); // Default to 5 PM
      break;

    case 'next week':
      result.setDate(result.getDate() + 7);
      result.setHours(17, 0, 0, 0);
      break;

    case 'this week':
    case 'end of week':
      // Set to Friday of current week
      const daysUntilFriday = (5 - result.getDay() + 7) % 7 || 7;
      result.setDate(result.getDate() + daysUntilFriday);
      result.setHours(17, 0, 0, 0);
      break;

    default:
      // Handle day of week
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = days.findIndex(d => keyword.toLowerCase().includes(d));
      if (dayIndex !== -1) {
        const currentDay = result.getDay();
        let daysToAdd = dayIndex - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence
        result.setDate(result.getDate() + daysToAdd);
        result.setHours(17, 0, 0, 0);
      }
  }

  return result.toISOString();
}

/**
 * Extract deadline from raw text
 */
function extractDeadline(text: string): { deadline?: string; cleanedText: string } {
  let deadline: string | undefined;
  let cleanedText = text;

  // Check each pattern
  for (const [, pattern] of Object.entries(DEADLINE_PATTERNS)) {
    const match = text.match(pattern);
    if (match) {
      deadline = calculateDeadline(match[0]);
      // Remove the deadline phrase from title
      cleanedText = cleanedText.replace(pattern, '').trim();
      break;
    }
  }

  return { deadline, cleanedText };
}

/**
 * Extract priority from raw text
 */
function extractPriority(text: string): { priority: number; cleanedText: string } {
  let priority = 0;
  let cleanedText = text;

  if (PRIORITY_PATTERNS.urgent.test(text)) {
    priority = 10;
    cleanedText = cleanedText.replace(PRIORITY_PATTERNS.urgent, '').trim();
  } else if (PRIORITY_PATTERNS.high.test(text)) {
    priority = 7;
    cleanedText = cleanedText.replace(PRIORITY_PATTERNS.high, '').trim();
  } else if (PRIORITY_PATTERNS.medium.test(text)) {
    priority = 5;
    cleanedText = cleanedText.replace(PRIORITY_PATTERNS.medium, '').trim();
  } else if (PRIORITY_PATTERNS.low.test(text)) {
    priority = 2;
    cleanedText = cleanedText.replace(PRIORITY_PATTERNS.low, '').trim();
  }

  return { priority, cleanedText };
}

/**
 * Clean up the title text
 */
function cleanTitle(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^[\s:,\-]+|[\s:,\-]+$/g, '') // Trim punctuation
    .trim();
}

/**
 * Parse raw text input into structured task data
 * 
 * @example
 * parseTaskFromText("Call mom tomorrow urgent")
 * // Returns: { title: "Call mom", deadline: "2025-12-13T17:00:00.000Z", priority: 10 }
 * 
 * @example
 * parseTaskFromText("Buy groceries")
 * // Returns: { title: "Buy groceries", priority: 0 }
 */
export function parseTaskFromText(rawText: string): ParsedTask {
  if (!rawText || typeof rawText !== 'string') {
    return { title: '', priority: 0 };
  }

  let text = rawText.trim();

  // Extract deadline first
  const { deadline, cleanedText: afterDeadline } = extractDeadline(text);
  text = afterDeadline;

  // Extract priority
  const { priority, cleanedText: afterPriority } = extractPriority(text);
  text = afterPriority;

  // Clean up the remaining title
  const title = cleanTitle(text);

  return {
    title: title || rawText.trim(), // Fallback to original if cleaning removed everything
    deadline,
    priority,
  };
}

/**
 * Validate parsed task has minimum required fields
 */
export function isValidParsedTask(task: ParsedTask): boolean {
  return task.title.length > 0 && task.title.length <= 255;
}
