## Context

The Euro Piggy Bank app currently uses localStorage for all data persistence, which limits users to single-device access and creates data loss risks. The app has a React + TypeScript + Vite frontend with Zustand state management. Current data includes denomination counts, savings history, user preferences, and theme settings. The codebase follows a component-based architecture with TypeScript interfaces for type safety.

## Goals / Non-Goals

**Goals:**
- Enable multi-device synchronization of savings data
- Provide secure user authentication with multiple providers
- Maintain offline functionality with sync when connectivity restored
- Preserve existing user experience and UI/UX patterns
- Ensure data security and privacy with proper Firebase security rules
- Enable seamless migration from localStorage to Firebase

**Non-Goals:**
- Complete rewrite of existing UI components
- Real-time collaboration between users (single-user focus)
- Advanced analytics beyond basic savings tracking
- Mobile app development (focus remains on web app)

## Decisions

### Firebase vs Other Backend Solutions
**Decision**: Use Firebase (Firestore + Authentication) over Supabase, AWS Amplify, or custom backend
**Rationale**: 
- Firebase provides real-time sync out-of-the-box
- Generous free tier suitable for personal finance app
- Excellent TypeScript support
- Simplified deployment and maintenance
- Built-in authentication with multiple providers

### Data Architecture: Firestore Structure
**Decision**: Use collection-based structure with user documents
**Rationale**:
- Users collection: `/users/{userId}` with profile data
- Savings data: `/users/{userId}/savings/{documentId}` for denomination snapshots
- History: `/users/{userId}/history/{documentId}` for historical entries
- Preferences: `/users/{userId}/preferences` single document
- This structure enables proper security rules and efficient queries

### State Management: Enhanced Zustand
**Decision**: Extend existing Zustand store with Firebase integration
**Rationale**:
- Minimal disruption to existing codebase
- Zustand supports middleware and subscriptions
- Can maintain current component patterns
- Easier migration path than switching to Redux or Context API

### Offline Strategy: Local Cache + Sync
**Decision**: Implement Firestore offline persistence with conflict resolution
**Rationale**:
- Firestore provides built-in offline cache
- Automatic sync when connectivity restored
- Conflict resolution using last-write-wins with timestamps
- Better user experience than fully offline-first approach

### Authentication Flow: Firebase Auth + Context
**Decision**: Use Firebase Authentication with React Context for auth state
**Rationale**:
- Firebase handles secure token management
- Context provides global auth state access
- Can integrate with existing Zustand store
- Supports email/password and Google OAuth

## Risks / Trade-offs

**Data Migration Complexity** → Implement gradual migration with user consent and rollback option
**Firebase Costs at Scale** → Monitor usage and implement data pruning for old history entries
**Offline Sync Conflicts** → Use timestamp-based conflict resolution with user notifications
**Learning Curve** → Provide comprehensive documentation and gradual feature rollout
**Vendor Lock-in** → Implement data export functionality for future portability

## Migration Plan

1. **Phase 1**: Setup Firebase project and authentication
2. **Phase 2**: Implement data models and Firestore integration
3. **Phase 3**: Create migration utility from localStorage
4. **Phase 4**: Update state management for Firebase sync
5. **Phase 5**: Add authentication UI and flows
6. **Phase 6**: Implement offline support and error handling
7. **Phase 7**: Testing, documentation, and deployment

**Rollback Strategy**: Maintain localStorage fallback option during transition period

## Open Questions

- Should we implement data encryption before sending to Firebase?
- How to handle large datasets for long-term users (pagination vs archiving)?
- What's the optimal sync frequency for real-time updates vs performance?
- Should we implement data export formats beyond JSON/CSV?
