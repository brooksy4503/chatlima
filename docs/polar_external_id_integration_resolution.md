# Resolving Polar external_id Integration with BetterAuth

## 1. Problem Statement

The primary goal was to ensure that when a new user signs up for the application (initially via Google Sign-In), a corresponding customer record is created in Polar, and the application's internal user ID is stored as the `external_id` in the Polar customer record.

This was crucial to resolve errors like "Could not find Polar customer with external ID" which occurred when the application attempted to perform operations like fetching credit balances or reporting usage for users whose `external_id` was not known to Polar.

## 2. Initial Approaches & Challenges

### 2.1. Using `createCustomerOnSignUp` in Polar Plugin
- The `@polar-sh/better-auth` plugin offers a `createCustomerOnSignUp: true` option.
- Initial attempts might have used this, but direct control over the `externalId` and handling specific scenarios (like anonymous users vs. registered users) led to exploring custom hooks.

### 2.2. Using `onAccountCreated` in Polar Plugin
- The next approach involved setting `createCustomerOnSignUp: false` and leveraging the `onAccountCreated` hook provided within the `polarPlugin` configuration in `lib/auth.ts`.
- The logic here was to explicitly call `polarClient.customers.create({ ... externalId: user.id })`.
- **Challenge**: Through systematic logging, it was discovered that this `onAccountCreated` hook (and a similar one at the `socialProviders.google` level) was **not being triggered** for new users signing up via Google, especially when the anonymous user linking flow was involved. This meant the Polar customer creation logic was never executed.

## 3. Identifying the Correct Hook for Execution

- **Observation**: While the `onAccountCreated` hooks were silent, detailed logging revealed that the `onLinkAccount` hook within the `anonymous` plugin (also configured in `lib/auth.ts`) *was* consistently firing after a new user successfully authenticated via Google and their temporary anonymous user record was linked to their new registered user record.
- **Key Insight**: The `onLinkAccount` hook provides a `newUser` object, which contains `newUser.user` with all the necessary details for Polar customer creation: `id` (the application's user ID), `email`, and `name`.

## 4. Solution Implemented

The core of the solution was to relocate the Polar customer creation and linking logic to a place where it was guaranteed to run with the correct user data.

### 4.1. Moving Logic to `onLinkAccount`
- The entire try-catch block responsible for Polar customer operations was moved from the (non-firing) `onAccountCreated` hook of the `polarPlugin` into the (verified firing) `onLinkAccount` hook of the `anonymous` plugin in `lib/auth.ts`.

### 4.2. Logic within `onLinkAccount`
The implemented logic for the `newUser.user` (referred to as `userForPolar` in the code) is as follows:
1.  **Log Processing**: Log that Polar customer processing is starting for the authenticated user, including their app ID and email.
2.  **Check for Existing by `externalId`**: Attempt to fetch an existing Polar customer using `polarClient.customers.getExternal({ externalId: userForPolar.id })`.
    *   If found, log this and, as an optional step, verify if the email matches, offering a point to update the Polar customer's email if necessary (though `externalId` is the primary link).
3.  **Create if Not Found by `externalId`**:
    *   If the `getExternal` call fails with a "ResourceNotFound" (or 404) error, it means no Polar customer is currently linked to this application `user.id`.
    *   Log this and proceed to attempt creation: `polarClient.customers.create({ email: userForPolar.email, name: userForPolar.name, externalId: userForPolar.id })`.
    *   If creation is successful, log the new Polar customer ID and the associated `externalId`.
4.  **Error Handling for Creation**:
    *   If the `create` call itself fails, log the error. Crucially, this includes logging detailed API error responses from Polar.

## 5. Handling Pre-existing Polar Customers (Email Conflict)

- **Scenario**: A test case involved a user (`brooksy4503@gmail.com`) who already existed as a customer in the Polar (Sandbox) dashboard by email, but *without* an `external_id` set that matched the application's `user.id`.
- **Observed Behavior**: When the `onLinkAccount` logic attempted to `polarClient.customers.create()` for this user, Polar's API correctly returned an error: `{"detail":[{"loc":["body","email"],"msg":"A customer with this email address already exists.","type":"value_error"}]}`.
- **Resolution for Test Case**: For the specific test account (`brooksy4503@gmail.com`), the resolution was to manually delete this customer from the Polar Sandbox dashboard. Upon the next sign-in to the application, the `onLinkAccount` logic treated it as a completely new user (from Polar's perspective) and successfully created the Polar customer with the correct `external_id`.
- **General Implication**: This confirmed that Polar's `create` API does not automatically link/update an `external_id` if it finds an existing customer by email; it flags it as a conflict.
- **Current State for Production**: Since it was determined that there were no other existing application users who also pre-existed in Polar in this unlinked state, a complex automated backfill logic (e.g., attempting to list Polar customers by email and then update with `externalId` if a conflict on create occurs) was not added to the `onLinkAccount` hook. The current implementation will log the "email already exists" error from Polar if such a case arises. If this becomes a more common scenario, this error logging will be the starting point for implementing a more sophisticated linking strategy within the `createError` block.

## 6. Key Files Modified
- `lib/auth.ts`: This file saw all the significant changes, specifically within the `plugins` array, moving logic to the `anonymous` plugin's `onLinkAccount` hook and effectively commenting out the non-operational `onAccountCreated` hook in the `polarPlugin`.

## 7. Outcome
- New users signing up via Google are now correctly having Polar customer records created.
- The application's internal `user.id` is successfully stored as the `external_id` on these Polar customer records.
- Subsequent operations like credit checking and usage reporting for these users function correctly, as the link via `externalId` is established.
- The initial "Could not find Polar customer with external ID" errors have been resolved for new user flows and for test accounts that were reset/recreated. 