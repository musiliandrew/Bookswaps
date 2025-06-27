# Book ID Validation Fix

## Issue Fixed
**Error**: `'book_id': 'Must be null for Article.'` when creating Article posts

## Root Cause
Frontend was sending `book_id` for all post types, but backend validation requires:
- **Article**: `book_id` must be `null` (no book association)
- **Synopsis/Query**: `book_id` is required (must have book association)

## Backend Validation Rules
```python
# From backend/discussions/serializers.py
if post_type in ['Synopsis', 'Query'] and not book_id:
    raise ValidationError({'book_id': 'Required for Synopsis or Query.'})
if post_type == 'Article' and book_id:
    raise ValidationError({'book_id': 'Must be null for Article.'})
```

## Fix Applied

### File Modified
- `frontend/src/components/Socials/Discussions/PostCreationModal.jsx`

### Changes Made

1. **Conditional Book ID Assignment**:
   ```javascript
   const formattedData = {
     ...postData,
     // For Articles, book_id must be null. For Synopsis/Query, use selected book_id
     book_id: postData.type === 'Article' ? null : postData.book_id,
     // ... rest of data
   };
   ```

2. **Added Frontend Validation**:
   ```javascript
   // Validate book requirement based on post type
   if ((postData.type === 'Synopsis' || postData.type === 'Query') && !postData.book_id) {
     toast.error(`Please select a book for ${postData.type} posts`);
     return;
   }
   ```

3. **Updated UI Labels**:
   ```javascript
   // Dynamic label based on post type
   {postData.type === 'Article' 
     ? 'Link to Book (optional)' 
     : `Select Book (required for ${postData.type})`
   }
   
   // Required indicator for Synopsis/Query
   {(postData.type === 'Synopsis' || postData.type === 'Query') && (
     <span className="text-error text-xs">*</span>
   )}
   ```

4. **Dynamic Placeholder Text**:
   ```javascript
   placeholder={
     postData.type === 'Article' 
       ? "Search for a book to link your discussion (optional)..."
       : `Search for the book for your ${postData.type.toLowerCase()}...`
   }
   ```

## Post Type Requirements

### 📝 Article
- ✅ **Book**: Optional (will be set to `null`)
- ✅ **Use Case**: General discussions, thoughts, opinions
- ✅ **Example**: "My thoughts on reading habits"

### 📖 Synopsis  
- ✅ **Book**: Required (must select a book)
- ✅ **Use Case**: Book reviews, summaries, analysis
- ✅ **Example**: "My review of The Great Gatsby"

### ❓ Query
- ✅ **Book**: Required (must select a book)
- ✅ **Use Case**: Questions about specific books
- ✅ **Example**: "What did you think about the ending of 1984?"

## User Experience Improvements

1. **Clear Requirements**: Users now see if book selection is optional or required
2. **Visual Indicators**: Required fields show asterisk (*)
3. **Contextual Placeholders**: Different placeholder text based on post type
4. **Frontend Validation**: Prevents submission with missing required books
5. **Better Error Messages**: Specific error messages for each post type

## Testing Checklist
- ✅ Article creation without book should work
- ✅ Article creation with book should work (book_id will be set to null)
- ✅ Synopsis creation without book should show error
- ✅ Synopsis creation with book should work
- ✅ Query creation without book should show error  
- ✅ Query creation with book should work

The frontend now properly handles book requirements for each post type!
