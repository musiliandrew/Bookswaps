-- Ensure you have pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique ID
    username TEXT UNIQUE NOT NULL,                      -- Display name
    email TEXT UNIQUE NOT NULL,                         -- Email for login
    password_hash TEXT NOT NULL,                        -- Hashed password
    age INTEGER,                                        -- Optional age
    city TEXT,                                          -- Required for swaps
    country TEXT,                                       -- Optional
    ethnicity TEXT,                                     -- Optional
    role TEXT CHECK (role IN ('Student', 'Writer', 'Reader', 'Other')), -- User type
    about_you TEXT,                                     -- Bio
    genres TEXT[],                                      -- Interests
    chat_preferences JSONB DEFAULT '{"location_enabled": false}', -- Chat/settings
    created_at TIMESTAMP DEFAULT NOW(),                 -- Signup timestamp
    profile_pic TEXT,                                   -- Optional: link to image
    last_active TIMESTAMP DEFAULT NOW(),                -- Optional: active tracking
    is_active BOOLEAN DEFAULT TRUE                      -- Soft delete or deactivate
);

-- Optional but useful for performance
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_city ON users (city);

-- Comments (for DB introspection tools like pgAdmin)
COMMENT ON TABLE users IS 'Stores user profiles, driving social features and personalization';
COMMENT ON COLUMN users.city IS 'Required for swaps, midpoint logic';
COMMENT ON COLUMN users.genres IS 'Used to personalize recommendations and feeds';
COMMENT ON COLUMN users.chat_preferences IS 'Controls chat and location visibility';


CREATE TABLE books (
    book_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique book ID
    title TEXT NOT NULL,                                -- Book title
    author TEXT NOT NULL,                               -- Author for sorting and filtering
    year INTEGER,                                       -- Optional publication year
    genre TEXT,                                         -- Genre/category
    isbn TEXT UNIQUE,                                   -- Optional ISBN, unique if present
    cover_image_url TEXT,                               -- Cover image URL
    original_owner_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Initial adder
    owner_id UUID REFERENCES users(user_id) ON DELETE SET NULL,          -- Current holder
    qr_code_id TEXT UNIQUE NOT NULL,                    -- QR code, required
    available_for_exchange BOOLEAN DEFAULT FALSE,       -- Swapping flag
    available_for_borrow BOOLEAN DEFAULT FALSE,         -- Borrowing flag
    condition TEXT CHECK (condition IN ('New', 'LikeNew', 'Worn', 'Damaged')), -- Book state
    synopsis TEXT,                                      -- User-provided note
    copy_count INTEGER DEFAULT 1 CHECK (copy_count >= 1), -- Total owned copies
    locked_until TIMESTAMP,                             -- Lock to prevent immediate re-swap
    created_at TIMESTAMP DEFAULT NOW()                  -- Time of entry
);

-- Optimization indexes
CREATE INDEX idx_books_owner_id ON books (owner_id);
CREATE INDEX idx_books_availability ON books (available_for_exchange, available_for_borrow);
CREATE INDEX idx_books_genre ON books (genre);
CREATE INDEX idx_books_qr_code_id ON books (qr_code_id);

-- Schema Documentation
COMMENT ON TABLE books IS 'Central catalog tracking book ownership, metadata, and availability for swap/borrow.';
COMMENT ON COLUMN books.qr_code_id IS 'Ties book to physical instance via QR. Used during swaps.';
COMMENT ON COLUMN books.locked_until IS 'Prevents immediate re-swaps, enforces cooling-off post-exchange.';

CREATE TABLE libraries (
    library_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),            -- Unique entry ID
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Owner of book
    book_id UUID NOT NULL REFERENCES books(book_id) ON DELETE CASCADE, -- Book being tracked
    status TEXT CHECK (status IN ('Owned', 'Exchanged', 'Borrowed')) DEFAULT 'Owned', -- Book state
    added_at TIMESTAMP DEFAULT NOW(),                                 -- When added
    last_status_change_at TIMESTAMP DEFAULT NOW(),                    -- Optional: for analytics/triggers
    CONSTRAINT unique_user_book UNIQUE (user_id, book_id)             -- Optional: prevent dupes
);

-- Optimization
CREATE INDEX idx_libraries_user_id ON libraries (user_id);
CREATE INDEX idx_libraries_book_id ON libraries (book_id);

-- Docs
COMMENT ON TABLE libraries IS 'Links users to their books, forming their personal library and swap trail';
COMMENT ON COLUMN libraries.status IS 'Tracks whether book is owned, exchanged, or borrowed by the user';
COMMENT ON COLUMN libraries.last_status_change_at IS 'Tracks last transition for audit or analytics';

CREATE TABLE book_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('Owned', 'Borrowed', 'Swapped')),
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    notes TEXT,
    source TEXT,
    CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_book_history_book_id ON book_history (book_id);
CREATE INDEX idx_book_history_book_id_start_date ON book_history (book_id, start_date);

-- Comments
COMMENT ON TABLE book_history IS 'Ledger of all user-book interactions for transparency and timeline rendering';
COMMENT ON COLUMN book_history.status IS 'Captures type of custody: ownership, borrowing, or swapping';
COMMENT ON COLUMN book_history.notes IS 'Optional comments about the book or transaction';

CREATE TABLE discussions (
    discussion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('Article', 'Synopsis', 'Query')),
    book_id UUID REFERENCES books(book_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    media_urls TEXT[],
    spoiler_flag BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0 CHECK (upvotes >= 0),
    views INTEGER DEFAULT 0 CHECK (views >= 0),
    status TEXT DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Flagged', 'Deleted')),
    created_at TIMESTAMP DEFAULT NOW(),
    last_edited_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_discussions_book_id ON discussions (book_id);
CREATE INDEX idx_discussions_created_at ON discussions (created_at);
CREATE INDEX idx_discussions_tags ON discussions USING GIN (tags);
CREATE INDEX idx_discussions_user_created ON discussions (user_id, created_at DESC);

-- Comments
COMMENT ON TABLE discussions IS 'User-generated content around books for community interaction';
COMMENT ON COLUMN discussions.status IS 'Controls visibility and moderation state of a post';
COMMENT ON COLUMN discussions.spoiler_flag IS 'Warns users if post contains major plot details';

CREATE TABLE notes (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES discussions(discussion_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (length(content) <= 280),
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    parent_note_id UUID REFERENCES notes(note_id) ON DELETE SET NULL,
    thread_id UUID REFERENCES notes(note_id) ON DELETE CASCADE,
    depth INTEGER DEFAULT 0 CHECK (depth >= 0),
    status TEXT DEFAULT 'Visible' CHECK (status IN ('Visible', 'Flagged', 'Hidden', 'Deleted')),
    created_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notes_discussion_id ON notes (discussion_id);
CREATE INDEX idx_notes_discussion_created ON notes (discussion_id, created_at);
CREATE INDEX idx_notes_thread_id ON notes (thread_id);

-- Comments
COMMENT ON TABLE notes IS 'Stores threaded comments under Discussion posts';
COMMENT ON COLUMN notes.content IS 'Limited to 280 chars to ensure short-form responses';
COMMENT ON COLUMN notes.thread_id IS 'Groups notes into top-level threads for organized display';
COMMENT ON COLUMN notes.status IS 'Controls moderation visibility of the comment';

CREATE TABLE reprints (
    reprint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES discussions(discussion_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    comment TEXT CHECK (length(comment) <= 280),
    status TEXT DEFAULT 'Visible' CHECK (status IN ('Visible', 'Flagged', 'Hidden', 'Deleted')),
    created_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_reprints_discussion_id ON reprints (discussion_id);
CREATE INDEX idx_reprints_user_id ON reprints (user_id);

-- Comments
COMMENT ON TABLE reprints IS 'Tracks reposts of Discussion Tab posts (Reprints)';
COMMENT ON COLUMN reprints.comment IS 'Optional personal comment (max 280 chars)';
COMMENT ON COLUMN reprints.status IS 'For content moderation and visibility control';


CREATE TABLE chats (
    chat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    status TEXT CHECK (status IN ('Sent', 'Viewed', 'Read', 'Replied')) DEFAULT 'Sent',
    book_id UUID REFERENCES books(book_id) ON DELETE SET NULL,
    parent_chat_id UUID REFERENCES chats(chat_id) ON DELETE SET NULL,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_receiver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chats_sender_id ON chats (sender_id);
CREATE INDEX idx_chats_receiver_id ON chats (receiver_id);
CREATE INDEX idx_chats_pair ON chats (sender_id, receiver_id, created_at DESC);

-- Comments
COMMENT ON TABLE chats IS 'Stores private Chat Forum messages';
COMMENT ON COLUMN chats.status IS 'Tracks chat lifecycle (Unread, Read, Replied)';
COMMENT ON COLUMN chats.book_id IS 'Links to ExchangeNow swaps for contextual chats';
COMMENT ON COLUMN chats.is_deleted_by_sender IS 'Used to soft-delete from sender view';
COMMENT ON COLUMN chats.updated_at IS 'Tracks last update (e.g., message edited, read)';


CREATE TABLE societies (
    society_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique group ID
    name TEXT NOT NULL, -- Group name
    description TEXT, -- Optional group summary
    focus_type TEXT CHECK (focus_type IN ('Book', 'Genre', 'Other')), -- Focus category
    focus_id TEXT, -- Book ID (UUID) or genre string
    icon_url TEXT, -- Group icon image
    creator_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Founder
    is_public BOOLEAN DEFAULT FALSE, -- Discoverability
    status TEXT CHECK (status IN ('Active', 'Inactive', 'Archived')) DEFAULT 'Active', -- Lifecycle state
    created_at TIMESTAMP DEFAULT NOW() -- Time of creation
);

-- Optional Indexes (search, discovery)
CREATE INDEX idx_societies_focus ON societies (focus_type, focus_id);
CREATE INDEX idx_societies_public ON societies (is_public);

-- Comments
COMMENT ON TABLE societies IS 'Stores Chat Forum Societies (group chats)';
COMMENT ON COLUMN societies.focus_id IS 'Links to Books.book_id or genre string';
COMMENT ON COLUMN societies.status IS 'Lifecycle state: Active, Inactive, Archived';


CREATE TABLE society_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique entry ID
    society_id UUID REFERENCES societies(society_id) ON DELETE CASCADE, -- Group
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Member
    role TEXT CHECK (role IN ('Member', 'Admin')) DEFAULT 'Member', -- Role
    status TEXT CHECK (status IN ('Active', 'Pending', 'Removed', 'Banned')) DEFAULT 'Active', -- Membership status
    is_creator BOOLEAN DEFAULT FALSE, -- True if user is society founder
    joined_at TIMESTAMP DEFAULT NOW() -- Join time
);

-- Enforce 1-member-per-society rule
CREATE UNIQUE INDEX idx_unique_society_user ON society_members (society_id, user_id);
CREATE INDEX idx_society_members_society_id ON society_members (society_id);

COMMENT ON TABLE society_members IS 'Tracks Society membership, roles, and member lifecycle';
COMMENT ON COLUMN society_members.status IS 'Active, Pending, Removed, or Banned membership state';
COMMENT ON COLUMN society_members.is_creator IS 'True if user is the founding member of the society';

CREATE TABLE society_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique message ID
    society_id UUID REFERENCES societies(society_id) ON DELETE CASCADE, -- Group
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Sender
    content TEXT NOT NULL, -- Message text
    book_id UUID REFERENCES books(book_id) ON DELETE SET NULL, -- Related book
    is_pinned BOOLEAN DEFAULT FALSE, -- Pinned status
    status TEXT CHECK (status IN ('Active', 'Edited', 'Deleted', 'Flagged')) DEFAULT 'Active', -- Message lifecycle
    created_at TIMESTAMP DEFAULT NOW(), -- Send time
    edited_at TIMESTAMP -- Last edit time
);

-- Index for fast lookups
CREATE INDEX idx_society_messages_society_id ON society_messages (society_id);

-- Optional: Only one pinned message per group (if you want tight pinning policy)
-- CREATE UNIQUE INDEX idx_one_pinned_per_society ON society_messages(society_id) WHERE is_pinned = TRUE;

COMMENT ON TABLE society_messages IS 'Stores Society chat messages for group interactions';
COMMENT ON COLUMN society_messages.is_pinned IS 'Highlights key group messages in UI';
COMMENT ON COLUMN society_messages.status IS 'Tracks message state: active, edited, flagged, or deleted';
COMMENT ON COLUMN society_messages.edited_at IS 'Timestamp of last message edit';

CREATE TABLE swaps (
    swap_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique swap ID
    initiator_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Starter
    receiver_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Other user
    initiator_book_id UUID REFERENCES books(book_id) ON DELETE SET NULL, -- Offered book
    receiver_book_id UUID REFERENCES books(book_id) ON DELETE SET NULL, -- Received book
    type TEXT CHECK (type IN ('Swap', 'Borrow')) NOT NULL DEFAULT 'Swap', -- Swap or borrow
    status TEXT CHECK (status IN ('Pending', 'Accepted', 'LocationSet', 'Scanning', 'Completed', 'Rejected', 'Disputed')) DEFAULT 'Pending', -- Progress
    location_name TEXT, -- Meetup spot
    location_coords JSONB, -- Coordinates
    meetup_time TIMESTAMP, -- Scheduled time
    qr_code_id TEXT UNIQUE, -- Swap QR code
    initiator_scan_at TIMESTAMP, -- Initiator’s scan
    receiver_scan_at TIMESTAMP, -- Receiver’s scan
    locked_until TIMESTAMP, -- 24-hour lock end
    dispute_reason TEXT, -- Issue note
    review_status TEXT CHECK (review_status IN ('None', 'Pending', 'Submitted')) DEFAULT 'None', -- Post-swap feedback
    resolved_at TIMESTAMP, -- Swap completion or resolution
    cancelled_at TIMESTAMP, -- Rejected or cancelled
    created_at TIMESTAMP DEFAULT NOW() -- Start time
);

-- Indexes
CREATE INDEX idx_swaps_initiator_id ON swaps (initiator_id);
CREATE INDEX idx_swaps_receiver_id ON swaps (receiver_id);

COMMENT ON TABLE swaps IS 'Tracks book exchange logic, locations, statuses, and confirmations between users';
COMMENT ON COLUMN swaps.qr_code_id IS 'QR used for scanning and verifying meetup';
COMMENT ON COLUMN swaps.locked_until IS 'Ensures item unavailability after exchange';
COMMENT ON COLUMN swaps.review_status IS 'Tracks if feedback was left post-swap';

CREATE TABLE bookmarks (
    bookmark_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique entry ID
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Booker
    book_id UUID REFERENCES books(book_id) ON DELETE CASCADE, -- Book
    notify_on_available BOOLEAN DEFAULT TRUE, -- Ping on availability?
    active BOOLEAN DEFAULT TRUE, -- Soft-delete toggle
    notified_at TIMESTAMP, -- Last notification time
    created_at TIMESTAMP DEFAULT NOW() -- Bookmark time
);

-- Index for fast lookups
CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id);

COMMENT ON TABLE bookmarks IS 'Tracks user interest in books and optionally notifies when available for exchange';
COMMENT ON COLUMN bookmarks.notify_on_available IS 'Whether user wants to be alerted on availability';
COMMENT ON COLUMN bookmarks.active IS 'Soft-deletion toggle for managing bookmarks without purging history';


CREATE TABLE favorites (
    favorite_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique entry ID
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- User
    book_id UUID REFERENCES books(book_id) ON DELETE CASCADE, -- Book
    reason TEXT CHECK (reason IN ('Like', 'Want to Read', 'Recommended', 'Owned Before')) DEFAULT 'Like', -- Reason for favoriting
    active BOOLEAN DEFAULT TRUE, -- Soft delete toggle
    notified_on_match BOOLEAN DEFAULT TRUE, -- Notify when matched for swap
    created_at TIMESTAMP DEFAULT NOW() -- Timestamp
);

-- Indexes for fast lookups
CREATE INDEX idx_favorites_user_id ON favorites (user_id);

COMMENT ON TABLE favorites IS 'Stores users’ favorite books to drive ExchangeNow and Favourites tab';
COMMENT ON COLUMN favorites.reason IS 'Captures why the book was favorited for future personalization';
COMMENT ON COLUMN favorites.active IS 'Soft deletion to track un-favorited books without losing data';


CREATE TABLE follows (
    follow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique follow ID
    follower_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Follower
    followed_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Followed user
    is_mutual BOOLEAN DEFAULT FALSE, -- Mutual connection
    active BOOLEAN DEFAULT TRUE, -- Soft delete for unfollows
    source TEXT CHECK (source IN ('Search', 'Swap', 'Chat', 'Recommendation')) DEFAULT 'Search', -- How the follow was initiated
    created_at TIMESTAMP DEFAULT NOW(), -- Follow time
    UNIQUE (follower_id, followed_id) -- Prevent duplicate follows
);

-- Index for fast follow lookups
CREATE INDEX idx_follows_follower_id ON follows (follower_id);
CREATE INDEX idx_follows_followed_id ON follows (followed_id);

COMMENT ON TABLE follows IS 'Manages user follows to drive chats, personalization, and feed logic';
COMMENT ON COLUMN follows.is_mutual IS 'Precomputed mutual status to accelerate chat unlocks';
COMMENT ON COLUMN follows.active IS 'Soft deletion for unfollow events, keeps social history';
COMMENT ON COLUMN follows.source IS 'Origin of follow for funnel analysis and personalization';

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique alert ID
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- Recipient
    book_id UUID REFERENCES books(book_id) ON DELETE SET NULL, -- Related book
    type TEXT CHECK (type IN ('Swap', 'Chat', 'Bookmark', 'System')) NOT NULL, -- Alert type
    message TEXT NOT NULL, -- Alert content
    is_read BOOLEAN DEFAULT FALSE, -- Read flag
    is_archived BOOLEAN DEFAULT FALSE, -- Archive toggle
    delivered_at TIMESTAMP, -- Optional delivery timestamp
    created_at TIMESTAMP DEFAULT NOW() -- Notification creation time
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);
CREATE INDEX idx_notifications_type ON notifications (type);

COMMENT ON TABLE notifications IS 'Sends alerts for swaps, bookmarks, chats, and system events';
COMMENT ON COLUMN notifications.type IS 'Type of notification for UI segmentation and tracking';
COMMENT ON COLUMN notifications.is_read IS 'Tracks read/unread state for engagement metrics';
COMMENT ON COLUMN notifications.delivered_at IS 'Delivery timestamp for latency and alert system diagnostics';

CREATE TABLE shares (
    share_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique share ID
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Sharer
    content_type TEXT CHECK (content_type IN ('Book', 'Discussion', 'Profile', 'Swap')) NOT NULL, -- Shared item type
    content_id TEXT NOT NULL, -- Item ID (e.g., book_id)
    destination TEXT CHECK (destination IN ('Group', 'Message', 'External', 'Feed')) NOT NULL, -- Where shared
    platform TEXT DEFAULT 'Web', -- Platform used
    is_reshare BOOLEAN DEFAULT FALSE, -- Indicates re-share
    metadata JSONB DEFAULT '{}'::JSONB, -- Flexible metadata blob
    created_at TIMESTAMP DEFAULT NOW(), -- Share time

    -- Constraint to avoid excessive duplicates
    UNIQUE(user_id, content_type, content_id, destination)
);

-- Indexes
CREATE INDEX idx_shares_user_id ON shares (user_id);
CREATE INDEX idx_shares_content_type_id ON shares (content_type, content_id);
CREATE INDEX idx_shares_destination ON shares (destination);

COMMENT ON TABLE shares IS 'Tracks sharing of books, discussions, profiles, and swaps for visibility analysis';
COMMENT ON COLUMN shares.platform IS 'Platform that initiated the share (e.g., Web, Mobile)';
COMMENT ON COLUMN shares.is_reshare IS 'Marks whether a share is original or repeated';
COMMENT ON COLUMN shares.metadata IS 'Stores additional sharing metadata in flexible structure';


CREATE TABLE locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique spot ID
    name TEXT NOT NULL, -- Spot name
    type TEXT CHECK (type IN ('Cafe', 'Hotel', 'Library', 'Bookstore', 'CommunityCenter', 'Park')) NOT NULL, -- Category
    coords JSONB NOT NULL, -- Coordinates {lat, lng}
    city TEXT NOT NULL, -- City name
    rating FLOAT, -- Optional quality score
    last_fetched TIMESTAMP DEFAULT NOW(), -- Cache freshness
    source TEXT DEFAULT 'GooglePlaces', -- Source API
    verified BOOLEAN DEFAULT FALSE, -- Manually approved?
    popularity_score FLOAT DEFAULT 0, -- Ranking metric
    is_active BOOLEAN DEFAULT TRUE, -- Soft-delete flag

    -- Constraints
    UNIQUE(name, city)
);

-- Indexes
CREATE INDEX idx_locations_city ON locations (city);
CREATE INDEX idx_locations_coords_lat_lng ON locations USING GIN (coords);

COMMENT ON TABLE locations IS 'Caches public exchange spots with coordinates and ratings for swap logic';
COMMENT ON COLUMN locations.coords IS 'Geo-coordinates used for midpoint calculation and scan verification';
COMMENT ON COLUMN locations.popularity_score IS 'Ranking metric based on usage and rating';
COMMENT ON COLUMN locations.source IS 'Data source e.g. Google, OSM';
COMMENT ON COLUMN locations.verified IS 'True if spot is human-vetted';
