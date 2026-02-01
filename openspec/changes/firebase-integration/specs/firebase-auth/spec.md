## ADDED Requirements

### Requirement: User Registration
The system SHALL allow users to create an account using email and password or Google OAuth.

#### Scenario: Email Registration
- **WHEN** user enters valid email and password
- **THEN** system creates Firebase account and sends verification email
- **THEN** user is logged in automatically after verification

#### Scenario: Google OAuth Registration
- **WHEN** user clicks "Sign in with Google"
- **THEN** system opens Google OAuth flow
- **THEN** user is logged in after successful authorization

### Requirement: User Authentication
The system SHALL authenticate users with email/password or Google OAuth.

#### Scenario: Email Login
- **WHEN** user enters correct email and password
- **THEN** system validates credentials and logs user in
- **THEN** user is redirected to main app interface

#### Scenario: Invalid Credentials
- **WHEN** user enters incorrect email or password
- **THEN** system displays error message
- **THEN** user remains on login screen

### Requirement: Session Management
The system SHALL maintain user authentication state across app sessions.

#### Scenario: Persistent Login
- **WHEN** user closes and reopens app
- **THEN** system automatically logs user in if session is valid
- **THEN** user sees their saved data

#### Scenario: Session Expiry
- **WHEN** authentication token expires
- **THEN** system prompts user to re-authenticate
- **THEN** user is logged out after failed re-authentication

### Requirement: Password Recovery
The system SHALL allow users to reset forgotten passwords.

#### Scenario: Password Reset Request
- **WHEN** user requests password reset with email
- **THEN** system sends reset email
- **THEN** user can set new password via email link

### Requirement: Account Deletion
The system SHALL allow users to permanently delete their account and data.

#### Scenario: Account Deletion
- **WHEN** user requests account deletion
- **THEN** system confirms deletion intent
- **THEN** all user data is removed from Firebase
- **THEN** user is logged out and redirected
