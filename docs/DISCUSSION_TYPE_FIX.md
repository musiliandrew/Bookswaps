# Discussion Type Validation Fix

## Issue Fixed
**Error**: `"Debate" is not a valid choice` when creating discussions

## Root Cause
Frontend had a `'Debate'` post type option that wasn't supported by the backend.

**Backend Allowed Types**: `['Article', 'Synopsis', 'Query']`
**Frontend Had**: `['Article', 'Synopsis', 'Query', 'Debate']`

## Fix Applied

### Files Modified
- `frontend/src/components/Socials/Discussions/PostCreationModal.jsx`

### Changes Made

1. **Removed 'Debate' Post Type**:
   ```javascript
   // Before
   const postTypes = [
     { value: 'Article', ... },
     { value: 'Synopsis', ... },
     { value: 'Query', ... },
     { value: 'Debate', ... }  // ❌ Not supported by backend
   ];

   // After
   const postTypes = [
     { value: 'Article', ... },
     { value: 'Synopsis', ... },
     { value: 'Query', ... }   // ✅ Only backend-supported types
   ];
   ```

2. **Removed Debate Validation Logic**:
   ```javascript
   // Removed this validation
   if (postData.type === 'Debate' && !postData.debate_question.trim()) {
     toast.error('Please provide a debate question');
     return;
   }
   ```

3. **Cleaned Up State**:
   ```javascript
   // Removed debate-specific fields
   debate_mode: false,
   debate_question: ''
   ```

## Backend Validation Rules

### Article
- ✅ No book required
- ✅ Can have any content

### Synopsis  
- ✅ Book required (`book_id` must be provided)
- ✅ Intended for book reviews and summaries

### Query
- ✅ Book required (`book_id` must be provided)  
- ✅ Intended for questions about specific books

## Testing
- ✅ Article creation (without book) should work
- ✅ Synopsis creation (with book) should work  
- ✅ Query creation (with book) should work
- ✅ No more "Debate is not a valid choice" errors

## Token Refresh Status
✅ **Working Correctly**: The logs show automatic token refresh is functioning properly:
```
Token is expired → POST /api/users/token/refresh/ → Successfully issued new access token
```

The authentication system is working as expected with automatic token renewal.
