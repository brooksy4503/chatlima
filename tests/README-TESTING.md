# ChatLima Playwright Tests

This directory contains automated end-to-end tests for the ChatLima application using Playwright.

## Test Overview

The test suite includes:

1. **DeepSeek Model Test** - Tests the complete flow with authenticated users:
   - Navigating to ChatLima
   - Selecting the DeepSeek Chat V3 0324 model
   - Sending a test message
   - Verifying response is received
   - Checking UI elements are working correctly

2. **Anonymous User Test** - Tests functionality for anonymous users:
   - Basic chat functionality without authentication
   - Model selection (if available to anonymous users)
   - Message sending and receiving
   - Interface validation

3. **Model Selection State Test** - Tests model selector functionality and state management

## Authentication Setup

The tests now support proper authentication using Playwright's built-in authentication state management.

### How Authentication Works

1. **Setup Phase**: A dedicated `auth.setup.ts` file handles authentication once before all tests
2. **State Persistence**: Authentication state is saved to `playwright/.auth/user.json`
3. **Test Reuse**: All test projects reuse the authenticated state
4. **Anonymous Fallback**: Tests can also run against anonymous user functionality

### Authentication Methods

#### Method 1: Automated Authentication (Recommended for CI)
Set environment variables for automated Google authentication:

```bash
export TEST_GOOGLE_EMAIL="your-test-email@gmail.com"
export TEST_GOOGLE_PASSWORD="your-test-password"
```

#### Method 2: Manual Authentication (Local Development)
If no test credentials are provided, the setup will pause for manual authentication:

1. The browser will open to Google's OAuth page
2. Manually sign in with your Google account
3. The test will continue once authentication is complete

#### Method 3: Anonymous User Testing
Run tests that don't require authentication:

```bash
npx playwright test chatlima-anonymous-test.spec.ts
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Install Playwright Browsers**
   ```bash
   npx playwright install
   ```

3. **Set Up Authentication (Optional)**
   ```bash
   # For automated authentication
   export TEST_GOOGLE_EMAIL="your-test-email@gmail.com"
   export TEST_GOOGLE_PASSWORD="your-test-password"
   ```

## Running Tests

### Run All Tests (with Authentication)
```bash
pnpm test
```

### Run Anonymous User Tests Only
```bash
npx playwright test chatlima-anonymous-test.spec.ts
```

### Run Tests with UI (Interactive Mode)
```bash
pnpm run test:ui
```

### Run Tests in Debug Mode
```bash
pnpm run test:debug
```

### Run Tests with Browser Visible
```bash
pnpm run test:headed
```

### Run Specific Test
```bash
npx playwright test chatlima-deepseek-test.spec.ts
```

### Re-authenticate (Clear Saved State)
```bash
rm -rf playwright/.auth/
pnpm test
```

## Test Structure

```
tests/
├── auth.setup.ts                    # Authentication setup
├── chatlima-deepseek-test.spec.ts   # Authenticated user tests
├── chatlima-anonymous-test.spec.ts  # Anonymous user tests
├── README-TESTING.md                # This file
playwright/
├── .auth/                           # Authentication state (gitignored)
│   └── user.json                    # Saved authentication state
playwright.config.ts                 # Playwright configuration
package.json                         # Dependencies and scripts
```

## What the Tests Verify

### Authenticated User Tests:
1. ✅ Google authentication flow
2. ✅ Model dropdown opens correctly
3. ✅ DeepSeek Chat V3 0324 model is available and selectable
4. ✅ Model selection persists after selection
5. ✅ Message input field accepts text
6. ✅ Send button becomes enabled when text is entered
7. ✅ Message is sent successfully
8. ✅ AI response is received within timeout
9. ✅ Chat appears in sidebar with appropriate title
10. ✅ Both user message and AI response are displayed
11. ✅ Copy buttons are available for both messages
12. ✅ Full user features are accessible

### Anonymous User Tests:
1. ✅ Anonymous access to ChatLima
2. ✅ Basic chat functionality
3. ✅ Model selection (if available)
4. ✅ Message sending capability
5. ✅ AI response generation
6. ✅ Sign-in option visibility
7. ✅ Interface responsiveness

## Expected Results

When tests pass, you should see:
- Authentication setup completing successfully
- All assertions passing
- Console logs confirming successful steps
- Test report generated in `playwright-report/`

## Troubleshooting

### Authentication Issues

1. **Manual Authentication Required**: If you see "No test credentials provided - manual authentication needed", either:
   - Set `TEST_GOOGLE_EMAIL` and `TEST_GOOGLE_PASSWORD` environment variables
   - Or manually authenticate when the browser opens

2. **Authentication State Invalid**: Clear saved state and re-authenticate:
   ```bash
   rm -rf playwright/.auth/
   pnpm test
   ```

3. **Google OAuth Errors**: Ensure:
   - Test credentials are valid
   - 2FA is disabled on the test account (or use app-specific password)
   - Google hasn't blocked the automation (try manual authentication)

### Common Test Issues

1. **Network Timeouts**: The test waits up to 30 seconds for AI responses. If your network is slow, you may need to increase timeouts.

2. **Model Availability**: If the DeepSeek model is not available, tests will adapt or fail gracefully.

3. **Rate Limiting**: Multiple test runs might hit API rate limits. Wait a few minutes between runs if needed.

4. **Anonymous User Limitations**: Some features may not be available to anonymous users - this is expected behavior.

### Debug Options

- Use `--debug` flag to run tests in debug mode
- Check `playwright-report/` for detailed HTML reports
- View screenshots and videos in the report for failed tests
- Check authentication state: `cat playwright/.auth/user.json`

## CI/CD Integration

The tests are configured for CI environments with:
- Reduced parallelism on CI
- Automatic retries (2 attempts)
- HTML report generation
- Trace collection on failures
- Authentication state management

### GitHub Actions Example:
```yaml
- name: Run Playwright tests
  env:
    TEST_GOOGLE_EMAIL: ${{ secrets.TEST_GOOGLE_EMAIL }}
    TEST_GOOGLE_PASSWORD: ${{ secrets.TEST_GOOGLE_PASSWORD }}
  run: |
    pnpm install
    npx playwright install --with-deps
    pnpm test
```

### Manual CI Authentication
If automated authentication doesn't work in CI, you can:
1. Run tests locally to generate authentication state
2. Upload the auth state as a CI artifact
3. Download and use it in CI runs

## Security Considerations

- Authentication state files are automatically gitignored
- Use dedicated test accounts, not personal accounts
- Consider using Google service accounts for CI
- Regularly rotate test credentials
- Monitor test account usage for security

## Alternative Testing Approaches

If authentication continues to be problematic, consider:

1. **Mock Authentication**: Set up a test environment with mocked auth
2. **API Testing**: Test backend APIs directly with Playwright's API testing features
3. **Component Testing**: Use Playwright component testing for individual components
4. **Local Development**: Run a local version of ChatLima with simplified auth 