# 👥 Follow/Follower Button Logic Documentation

## 🔄 Relationship States & Button Logic

### **Core Relationship States**

The follow system tracks these key states for any two users (A and B):

1. **`is_following`** - Whether user A follows user B
2. **`is_mutual`** - Whether both users follow each other
3. **`active`** - Whether the follow relationship is active (soft delete)

### **Button States Based on Context**

#### **1. Profile Discovery / Search Results**
**Context**: User viewing search results or recommended users

| User A → User B State | Button Text | Button Action | API Call |
|----------------------|-------------|---------------|----------|
| Not following | **"Follow"** | Follow user B | `POST /api/users/follow/{userB_id}/` |
| Following | **"Following"** | Unfollow user B | `DELETE /api/users/unfollow/{userB_id}/` |
| Mutual (both follow each other) | **"Following"** | Unfollow (breaks mutual) | `DELETE /api/users/unfollow/{userB_id}/` |

#### **2. Followers List (User B's followers)**
**Context**: User A viewing User B's followers list

| Relationship State | Button Text | Button Action | API Call |
|-------------------|-------------|---------------|----------|
| Follower you DON'T follow back | **"Follow Back"** | Follow the follower | `POST /api/users/follow/{follower_id}/` |
| Follower you DO follow back (mutual) | **"Following"** | Unfollow the follower | `DELETE /api/users/unfollow/{follower_id}/` |
| **If viewing own followers** | **"Remove"** | Remove this follower | `DELETE /api/users/remove-follower/{follower_id}/` |

**Key Logic**: In followers list, button depends on whether YOU follow THEM back, not just that they follow you.

#### **3. Following List (User B's following)**
**Context**: User A viewing User B's following list

| Relationship State | Button Text | Button Action | API Call |
|-------------------|-------------|---------------|----------|
| **If viewing own following** | **"Following"** | Unfollow this user | `DELETE /api/users/unfollow/{user_id}/` |
| A doesn't follow this user | **"Follow"** | Follow this user | `POST /api/users/follow/{user_id}/` |
| A follows this user | **"Following"** | Unfollow this user | `DELETE /api/users/unfollow/{user_id}/` |

**Note**: When viewing your own following list, all users should show "Following" since you follow them by definition.

#### **4. Mutual Followers List**
**Context**: Users who follow each other (bidirectional relationship)

| Relationship State | Button Text | Button Action | API Call |
|-------------------|-------------|---------------|----------|
| **Always mutual** | **"Following"** | Unfollow (breaks mutual) | `DELETE /api/users/unfollow/{user_id}/` |
| **If viewing own mutual** | **"Remove"** | Remove follower (breaks mutual) | `DELETE /api/users/remove-follower/{user_id}/` |

**Note**: Mutual list should NEVER show "Follow Back" since you're already following each other by definition.

## 🎯 Button Logic Implementation

### **Frontend Logic (UserList.jsx)**

```javascript
const UserList = ({ users, listType, userFollowStatuses, onFollow, onUnfollow, onRemoveFollower }) => {
  return users.map((user) => {
    const followStatus = userFollowStatuses[user.user_id] || { is_following: false, is_mutual: false };
    const isFollowerList = listType === 'followers' || listType === 'mutual';
    const isFollowingList = listType === 'following';

    // For following list, we know the user is following these people
    const isActuallyFollowing = followStatus.is_following || isFollowingList;

    return (
      <div className="user-item">
        {/* Show Remove button only for follower lists when viewing own profile */}
        {isFollowerList && (
          <button onClick={() => onRemoveFollower(user.user_id)}>
            Remove
          </button>
        )}

        {/* Main follow/unfollow button */}
        <button
          onClick={() =>
            isActuallyFollowing
              ? onUnfollow(user.user_id)
              : onFollow(user.user_id, 'Connections')
          }
        >
          {isActuallyFollowing
            ? 'Following'
            : isFollowerList
              ? 'Follow Back'
              : 'Follow'
          }
        </button>
      </div>
    );
  });
};
```

### **API Endpoints**

#### **1. Follow User**
```
POST /api/users/follow/{user_id}/
Body: { "followed_id": "user_id", "source": "Search|Connections|Recommendation" }
Response: { "is_mutual": boolean, "message": "Success" }
```

#### **2. Unfollow User**
```
DELETE /api/users/unfollow/{user_id}/
Response: { "message": "Unfollowed successfully" }
```

#### **3. Remove Follower**
```
DELETE /api/users/remove-follower/{user_id}/
Response: { "message": "Follower removed successfully" }
```

#### **4. Get Follow Status**
```
GET /api/users/follow-status/{user_id}/?other_user_id={other_user_id}
Response: { "is_following": boolean, "is_mutual": boolean }
```

## 🔍 Context-Specific Button Behavior

### **Discovery Section**
- **Recommended Users**: Only shows users you're NOT following
- **Search Results**: Shows all matching users with appropriate button states
- **Button Text**: "Follow" or "Following"

### **Connections Section**
- **Followers Tab**: Shows your followers with "Follow Back" or "Remove" options
- **Following Tab**: Shows who you follow with "Following" (unfollow) option
- **Mutual Tab**: Shows mutual connections with "Following" or "Remove" options

### **Profile Cards**
- **Own Profile**: No follow buttons
- **Other Profiles**: "Follow" or "Following" button based on relationship

## 🎨 Visual States

### **Button Styling**
```css
/* Follow Button (Primary Action) */
.follow-button {
  background: linear-gradient(to right, var(--primary), var(--accent));
  color: white;
}

/* Following Button (Secondary Action) */
.following-button {
  background: linear-gradient(to right, #6b7280, #4b5563);
  color: white;
}

/* Remove Button (Destructive Action) */
.remove-button {
  background: transparent;
  color: var(--secondary);
  border: 1px solid var(--secondary);
}
```

### **Mutual Indicator**
```jsx
{followStatus.is_mutual && (
  <span className="mutual-badge">
    Mutual
  </span>
)}
```

## 🔄 State Management

### **Local State Updates**
When a follow action is performed, the UI optimistically updates:

```javascript
// After successful follow
setUserFollowStatuses(prev => ({
  ...prev,
  [userId]: { 
    is_following: true, 
    is_mutual: result.is_mutual || false 
  }
}));

// After successful unfollow
setUserFollowStatuses(prev => ({
  ...prev,
  [userId]: { 
    is_following: false, 
    is_mutual: false 
  }
}));
```

### **Backend State Updates**
The backend automatically handles:
- **Mutual Detection**: When A follows B, check if B follows A
- **Notification Creation**: Send follow notifications
- **Soft Deletion**: Mark relationships as inactive instead of deleting

## 🚨 Edge Cases & Validation

### **Frontend Validation**
- Prevent following yourself
- Disable buttons during API calls
- Handle network errors gracefully

### **Backend Validation**
- Validate user existence
- Prevent duplicate follows
- Handle soft delete/reactivation
- Update mutual status automatically

## 📱 Mobile Considerations

### **Button Sizing**
- Minimum touch target: 44px
- Responsive text sizing
- Clear visual feedback

### **Loading States**
- Show spinner during API calls
- Disable interaction during processing
- Provide clear success/error feedback

## 🔧 Testing Scenarios

### **Test Cases**
1. **Follow new user** → Button changes to "Following"
2. **Unfollow user** → Button changes to "Follow"
3. **Follow back** → Creates mutual relationship
4. **Remove follower** → Breaks mutual if exists
5. **Search and follow** → Updates discovery recommendations
6. **Network failure** → Reverts optimistic updates

This logic ensures consistent and intuitive follow/follower interactions across all parts of the application.
