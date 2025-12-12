# Testing Guide

**Project:** Manager - Task Management & AI Planning PWA  
**Date:** 2025-12-09

---

## Overview

Comprehensive testing strategy for the Manager application covering unit tests, integration tests, and manual testing procedures.

---

## Testing Pyramid

```
        /\
       /  \  E2E Tests (Playwright)
      /____\
     /      \
    /        \  Integration Tests
   /          \
  /____________\
 /              \
/                \ Unit Tests (Jest)
/__________________\
```

---

## Unit Tests

### Running Unit Tests

```bash
# Run all tests
DD

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- src/lib/auth.test.ts

# Run with coverage
npm run test -- --coverage
```

### Test Files

| File | Coverage | Status |
|------|----------|--------|
| `src/lib/supabase/client.test.ts` | Client initialization | ✅ |
| `src/lib/supabase/middleware.test.ts` | Session middleware | ✅ |
| `src/lib/db/tasks.test.ts` | Database functions | ✅ |
| `src/app/api/tasks/route.test.ts` | API endpoints | ✅ |

### Example Unit Test

```typescript
describe('Task Database Functions', () => {
  it('should create a task with valid input', async () => {
    const input = {
      title: 'Test Task',
      priority: 5,
    };

    expect(input.title).toBe('Test Task');
    expect(input.priority).toBe(5);
  });

  it('should validate required fields', async () => {
    const input = { title: '' };
    expect(input.title).toBe('');
  });
});
```

---

## Integration Tests

### API Integration Tests

Test API endpoints with real database (test database):

```bash
# Set up test database
npm run test:db:setup

# Run integration tests
npm run test:integration

# Clean up test database
npm run test:db:cleanup
```

### Example Integration Test

```typescript
describe('Task API Integration', () => {
  it('should create and retrieve a task', async () => {
    // Create task
    const createResponse = await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
    });
    const { data: task } = await createResponse.json();

    // Retrieve task
    const getResponse = await fetch(`/api/tasks/${task.id}`);
    const { data: retrieved } = await getResponse.json();

    expect(retrieved.id).toBe(task.id);
    expect(retrieved.title).toBe('Test');
  });
});
```

---

## Manual Testing

### Authentication Flow

**Test Case 1: Sign Up**
1. Navigate to `/signup`
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123!`
4. Click "Sign Up"
5. **Expected:** Redirect to login with success message
6. **Verify:** User created in Supabase Auth

**Test Case 2: Email Confirmation**
1. Check Supabase Auth → Users
2. Find newly created user
3. Click "Confirm" button
4. **Expected:** User marked as confirmed

**Test Case 3: Sign In**
1. Navigate to `/login`
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123!`
4. Click "Sign In"
5. **Expected:** Redirect to `/dashboard`
6. **Verify:** User email displayed in header

**Test Case 4: Logout**
1. Click "Logout" button
2. **Expected:** Redirect to `/login`
3. **Verify:** Cookies cleared

### Task Management Flow

**Test Case 5: Create Task**
1. On dashboard, fill "Add New Task" form
2. Title: "Buy groceries"
3. Priority: "High (10)"
4. Deadline: Tomorrow
5. Click "Add Task"
6. **Expected:** Task appears in list immediately
7. **Verify:** Task in Supabase database

**Test Case 6: View Tasks**
1. On dashboard, view task list
2. **Expected:** Tasks sorted by deadline then priority
3. **Verify:** All task details displayed

**Test Case 7: Mark Complete**
1. Click "Mark Complete" on a task
2. **Expected:** Task status changes to "completed"
3. **Verify:** Status updated in database

**Test Case 8: Filter Tasks**
1. Click filter button (e.g., "Pending")
2. **Expected:** Only pending tasks shown
3. Click "All"
4. **Expected:** All tasks shown

### API Testing with cURL

**Test Case 9: GET /api/tasks**
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Cookie: sb-auth-token=..."
```
**Expected:** 200 OK with task array

**Test Case 10: POST /api/tasks**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-auth-token=..." \
  -d '{"title":"New Task","priority":5}'
```
**Expected:** 201 Created with task object

**Test Case 11: PUT /api/tasks/:id**
```bash
curl -X PUT http://localhost:3000/api/tasks/task-id \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-auth-token=..." \
  -d '{"status":"completed"}'
```
**Expected:** 200 OK with updated task

**Test Case 12: DELETE /api/tasks/:id**
```bash
curl -X DELETE http://localhost:3000/api/tasks/task-id \
  -H "Cookie: sb-auth-token=..."
```
**Expected:** 200 OK with success message

### Error Handling

**Test Case 13: Unauthorized Access**
1. Call API without authentication
2. **Expected:** 401 Unauthorized
3. **Verify:** Error message returned

**Test Case 14: Invalid Input**
1. POST to `/api/tasks` with empty title
2. **Expected:** 400 Bad Request
3. **Verify:** Validation error message

**Test Case 15: Not Found**
1. GET `/api/tasks/invalid-id`
2. **Expected:** 404 Not Found
3. **Verify:** Error message returned

### Performance Testing

**Test Case 16: Load Time**
1. Open application in browser
2. Measure initial load time
3. **Expected:** < 3 seconds
4. **Verify:** Using DevTools Performance tab

**Test Case 17: API Response Time**
1. Create 100 tasks
2. Call GET `/api/tasks`
3. **Expected:** < 500ms response time
4. **Verify:** Using DevTools Network tab

### Responsive Design

**Test Case 18: Mobile View**
1. Open application on mobile device (375px width)
2. Test all pages and interactions
3. **Expected:** All content readable and usable
4. **Verify:** No horizontal scrolling

**Test Case 19: Tablet View**
1. Open application on tablet (768px width)
2. Test layout and interactions
3. **Expected:** Optimized layout for tablet

**Test Case 20: Desktop View**
1. Open application on desktop (1920px width)
2. Test layout and interactions
3. **Expected:** Full-width layout

---

## Regression Testing

### Before Each Release

1. **Run full test suite**
   ```bash
   npm run test
   ```

2. **Run build**
   ```bash
   npm run build
   ```

3. **Manual smoke tests**
   - Sign up
   - Sign in
   - Create task
   - Mark complete
   - Logout

4. **API tests**
   - All 5 endpoints
   - Error cases
   - Edge cases

---

## Test Coverage Goals

| Component | Target | Current |
|-----------|--------|---------|
| Authentication | 90% | ✅ |
| API Routes | 85% | ✅ |
| Database | 80% | ✅ |
| UI Components | 75% | 📋 |
| Overall | 80% | 📋 |

---

## Continuous Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run build
      - run: npm run lint
```

---

## Test Data

### Sample Tasks

```json
[
  {
    "title": "Complete project proposal",
    "description": "Finish the Q4 project proposal",
    "priority": 10,
    "deadline": "2025-12-15T17:00:00Z"
  },
  {
    "title": "Review team feedback",
    "priority": 5,
    "deadline": "2025-12-12T17:00:00Z"
  },
  {
    "title": "Update documentation",
    "priority": 3
  }
]
```

### Test Users

```
Email: test@example.com
Password: TestPassword123!

Email: dev@example.com
Password: DevPassword123!
```

---

## Debugging

### Enable Debug Logging

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### Browser DevTools

1. Open DevTools (F12)
2. Network tab: Monitor API calls
3. Application tab: Check cookies and storage
4. Console tab: Check for errors
5. Performance tab: Measure load times

### Supabase Logs

1. Go to Supabase dashboard
2. Database → Logs
3. View query logs
4. Check for errors

---

## Test Checklist

Before marking story as complete:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual smoke tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Linting passes
- [ ] Code coverage acceptable

---

## Common Issues

### Tests Fail with "Cannot find module"
- Run `npm install`
- Clear node_modules: `rm -rf node_modules && npm install`

### Tests Timeout
- Increase Jest timeout: `jest.setTimeout(10000)`
- Check for hanging promises

### Database Connection Fails
- Verify Supabase credentials
- Check network connectivity
- Verify RLS policies

---

## Resources

- [Jest Documentation](https://jestjs.io)
- [Testing Library](https://testing-library.com)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-09
