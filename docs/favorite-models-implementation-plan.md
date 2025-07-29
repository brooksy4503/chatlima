# Favorite Models Implementation Plan

## Overview

This plan outlines the implementation of a favorite models feature that allows users to mark and quickly access their preferred AI models. The feature will include a simple star-based UI similar to the images provided, with a "Favorites" tab in the model picker.

## Current State Analysis

### Existing Architecture
- **Database**: PostgreSQL with Drizzle ORM
- **Models**: Dynamic model loading from multiple providers (OpenRouter, Requesty, etc.)
- **UI**: Model picker component with search and filtering
- **Authentication**: Better Auth with user sessions
- **State Management**: React Context for model management

### Key Components Identified
- `lib/db/schema.ts` - Database schema definitions
- `lib/types/models.ts` - Model type definitions
- `components/model-picker.tsx` - Model selection UI
- `app/api/models/route.ts` - Model fetching API
- `lib/context/model-context.tsx` - Model state management

## Implementation Plan

### Phase 1: Database Schema

#### 1.1 Create Favorites Table
```sql
-- New migration file: drizzle/0021_add_favorite_models.sql
CREATE TABLE favorite_models (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, model_id)
);
```

#### 1.2 Update Schema Types
- Add `FavoriteModel` type to `lib/db/schema.ts`
- Add `favoriteModels` table definition
- Include proper foreign key constraints and indexes

### Phase 2: API Endpoints

#### 2.1 Create Favorites API Routes

**GET /api/favorites/models**
- Fetch user's favorite models
- Return list of favorite model IDs
- Include model details if requested

**POST /api/favorites/models**
- Add model to favorites
- Validate model exists
- Prevent duplicates

**DELETE /api/favorites/models/{modelId}**
- Remove model from favorites
- Handle non-existent favorites gracefully

#### 2.2 Update Models API
- Enhance `/api/models` to include favorite status
- Add `isFavorite` field to model responses
- Optimize queries to include favorite information

### Phase 3: Backend Services

#### 3.1 Create Favorites Service
```typescript
// lib/services/favorites.ts
export class FavoritesService {
  async getUserFavorites(userId: string): Promise<string[]>
  async addFavorite(userId: string, modelId: string): Promise<void>
  async removeFavorite(userId: string, modelId: string): Promise<void>
  async isFavorite(userId: string, modelId: string): Promise<boolean>
}
```

#### 3.2 Update Model Context
- Add favorites state management
- Include favorite status in model data
- Provide methods to toggle favorites

### Phase 4: UI Components

#### 4.1 Update Model Picker Component
- Add "Favorites" tab alongside "All" tab
- Implement star icon for favoriting/unfavoriting
- Add visual indicators for favorite status
- Handle favorite toggling with optimistic updates

#### 4.2 Create Favorite Toggle Component
```typescript
// components/favorite-toggle.tsx
interface FavoriteToggleProps {
  modelId: string;
  isFavorite: boolean;
  onToggle: (modelId: string, isFavorite: boolean) => void;
  disabled?: boolean;
}
```

#### 4.3 Update Model List Item
- Add star icon to each model entry
- Implement hover states for star interaction
- Show filled/outlined star based on favorite status

### Phase 5: State Management

#### 5.1 Extend Model Context
```typescript
// lib/context/model-context.tsx
interface ModelContextValue {
  // ... existing properties
  favorites: string[];
  toggleFavorite: (modelId: string) => Promise<void>;
  isFavorite: (modelId: string) => boolean;
}
```

#### 5.2 Add Favorites Hook
```typescript
// hooks/useFavorites.ts
export function useFavorites() {
  const { favorites, toggleFavorite, isFavorite } = useModel();
  return { favorites, toggleFavorite, isFavorite };
}
```

### Phase 6: UI/UX Enhancements

#### 6.1 Tab Navigation
- Implement "All" and "Favorites" tabs
- Show count of favorite models
- Handle empty favorites state

#### 6.2 Visual Design
- Star icons (filled for favorites, outlined for non-favorites)
- Hover effects and animations
- Consistent with existing design system

#### 6.3 Accessibility
- Proper ARIA labels for star buttons
- Keyboard navigation support
- Screen reader friendly descriptions

### Phase 7: Performance Optimizations

#### 7.1 Caching Strategy
- Cache favorite status in client state
- Implement optimistic updates
- Handle offline scenarios gracefully

#### 7.2 Database Optimization
- Add indexes on `(user_id, model_id)`
- Consider denormalization for frequently accessed data
- Implement efficient batch operations

### Phase 8: Testing

#### 8.1 Unit Tests
- Favorites service methods
- API endpoint functionality
- UI component behavior

#### 8.2 Integration Tests
- End-to-end favorite workflow
- Error handling scenarios
- Performance under load

#### 8.3 User Acceptance Tests
- Favorite/unfavorite workflow
- Tab switching behavior
- Search within favorites

## Technical Implementation Details

### Database Migration
```sql
-- drizzle/0021_add_favorite_models.sql
CREATE TABLE favorite_models (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, model_id)
);

CREATE INDEX idx_favorite_models_user_id ON favorite_models(user_id);
CREATE INDEX idx_favorite_models_model_id ON favorite_models(model_id);
```

### API Route Structure
```
/api/favorites/
├── models/
│   ├── route.ts (GET, POST)
│   └── [modelId]/
│       └── route.ts (DELETE)
```

### Component Hierarchy
```
ModelPicker
├── ModelPickerTabs (All, Favorites)
├── ModelSearch
├── ModelList
│   └── ModelListItem
│       └── FavoriteToggle
└── ModelDetails
```

## Security Considerations

### Authentication
- All favorite operations require valid user session
- Validate user ownership of favorites
- Prevent unauthorized access to other users' favorites

### Input Validation
- Validate model IDs exist before adding to favorites
- Sanitize all user inputs
- Implement rate limiting for favorite operations

### Data Integrity
- Use database constraints to prevent duplicates
- Implement proper error handling
- Add audit logging for debugging

## Error Handling

### Client-Side
- Optimistic updates with rollback on failure
- User-friendly error messages
- Retry mechanisms for network failures

### Server-Side
- Proper HTTP status codes
- Detailed error logging
- Graceful degradation

## Performance Considerations

### Database
- Efficient queries with proper indexing
- Consider pagination for large favorite lists
- Implement caching where appropriate

### Client
- Debounced favorite toggles
- Optimistic UI updates
- Efficient re-rendering strategies

## Migration Strategy

### Phase 1: Backend Foundation
1. Create database migration
2. Implement API endpoints
3. Add backend services
4. Update model context

### Phase 2: UI Implementation
1. Update model picker component
2. Add favorite toggle functionality
3. Implement tab navigation
4. Add visual indicators

### Phase 3: Testing & Polish
1. Comprehensive testing
2. Performance optimization
3. Accessibility improvements
4. User feedback integration

## Success Metrics

### Technical Metrics
- API response times < 200ms
- Database query performance
- Client-side rendering performance
- Error rates < 1%

### User Experience Metrics
- Time to favorite/unfavorite < 500ms
- Intuitive UI interactions
- Accessibility compliance
- User satisfaction scores

## Future Enhancements

### Potential Features
- Favorite model categories/tags
- Import/export favorite lists
- Share favorite configurations
- Favorite model recommendations
- Bulk favorite operations

### Technical Improvements
- Real-time sync across devices
- Offline favorite management
- Advanced filtering options
- Performance optimizations

## Conclusion

This implementation plan provides a comprehensive approach to adding favorite models functionality to ChatLima. The design prioritizes simplicity, performance, and user experience while maintaining consistency with the existing codebase architecture.

The phased approach allows for incremental development and testing, ensuring each component is solid before moving to the next phase. The plan also considers future enhancements and scalability requirements. 