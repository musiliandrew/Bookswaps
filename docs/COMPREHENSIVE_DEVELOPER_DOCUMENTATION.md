# 🛠️ BookSwaps - Complete Developer Documentation

> **Professional Technical Documentation for BookSwaps Social Reading Platform**
> 
> Comprehensive guide for developers working with the BookSwaps codebase, APIs, architecture, and deployment.

---

## 📋 **Table of Contents**

1. [🏗️ Architecture Overview](#architecture-overview)
2. [🚀 Quick Start Guide](#quick-start-guide)
3. [🔧 Backend Documentation](#backend-documentation)
4. [⚛️ Frontend Documentation](#frontend-documentation)
5. [🔌 API Reference](#api-reference)
6. [🗄️ Database Schema](#database-schema)
7. [🔐 Authentication System](#authentication-system)
8. [💬 Real-time Features](#real-time-features)
9. [🎨 UI/UX Components](#ui-ux-components)
10. [🧪 Testing Strategy](#testing-strategy)
11. [🚀 Deployment Guide](#deployment-guide)
12. [📊 Performance & Monitoring](#performance-monitoring)

---

## 🏗️ **Architecture Overview**

### **System Architecture**

BookSwaps follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    BookSwaps Platform                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Frontend      │   Backend       │   Infrastructure        │
│   React.js      │   Django REST   │   PostgreSQL           │
│   Tailwind CSS  │   WebSockets    │   Redis Cache          │
│   Framer Motion │   JWT Auth      │   Docker Containers    │
│   WebSocket     │   Celery Tasks  │   MinIO Storage        │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### **Technology Stack**

**Frontend Technologies:**
- **React 18** - Modern React with hooks and concurrent features
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth interactions
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Toastify** - Notification system
- **Heroicons** - SVG icon library

**Backend Technologies:**
- **Django 4.2** - Python web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and session storage
- **Celery** - Asynchronous task processing
- **JWT** - Authentication tokens

**Infrastructure:**
- **Docker & Docker Compose** - Containerization
- **MinIO** - S3-compatible object storage
- **Nginx** - Reverse proxy and static file serving
- **Gunicorn** - WSGI HTTP server

### **Project Structure**

```
BookSwaps/
├── backend/                 # Django backend application
│   ├── bookswaps/          # Main Django project
│   ├── users/              # User management app
│   ├── library/            # Book and library management
│   ├── swaps/              # Book swapping functionality
│   ├── chat/               # Real-time messaging
│   ├── discussions/        # Community discussions
│   ├── notifications/      # Notification system
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page-level components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React context providers
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS and styling
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Development environment
├── nginx/                  # Nginx configuration
└── docs/                   # Documentation files
```

---

## 🚀 **Quick Start Guide**

### **Prerequisites**

- **Docker & Docker Compose** - For containerized development
- **Node.js 18+** - For frontend development
- **Python 3.11+** - For backend development
- **Git** - Version control

### **Development Setup**

**1. Clone Repository:**
```bash
git clone https://github.com/musiliandrew/Bookswaps.git
cd Bookswaps
```

**2. Environment Configuration:**
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure environment variables
# Edit backend/.env and frontend/.env with your settings
```

**3. Start Development Environment:**
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start services individually
docker-compose up postgres redis minio  # Infrastructure
docker-compose up backend              # Django backend
docker-compose up frontend             # React frontend
```

**4. Database Setup:**
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Load sample data (optional)
docker-compose exec backend python manage.py loaddata fixtures/sample_data.json
```

**5. Access Applications:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin
- **MinIO Console:** http://localhost:9001

### **Development Workflow**

**Backend Development:**
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run development server
python manage.py runserver

# Run tests
python manage.py test

# Create new app
python manage.py startapp app_name
```

**Frontend Development:**
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## 🔧 **Backend Documentation**

### **Django Apps Structure**

**1. Users App (`users/`)**
- **Purpose:** User authentication, profiles, and account management
- **Models:** `CustomUser`, `UserProfile`, `UserPreferences`
- **Key Features:** JWT authentication, social login, profile management

**2. Library App (`library/`)**
- **Purpose:** Book catalog and personal library management
- **Models:** `Book`, `Library`, `BookInteraction`, `ReadingProgress`
- **Key Features:** Book CRUD, library organization, reading tracking

**3. Swaps App (`swaps/`)**
- **Purpose:** Book exchange and borrowing system
- **Models:** `Swap`, `SwapRequest`, `Location`, `Notification`
- **Key Features:** Swap workflow, location services, QR verification

**4. Chat App (`chat/`)**
- **Purpose:** Real-time messaging and communication
- **Models:** `Conversation`, `Message`, `Society`, `SocietyMember`
- **Key Features:** Direct messaging, group chat, WebSocket support

**5. Discussions App (`discussions/`)**
- **Purpose:** Community discussions and content sharing
- **Models:** `Discussion`, `Comment`, `Vote`, `Tag`
- **Key Features:** Forum-style discussions, voting, content moderation

### **Key Backend Components**

**Authentication System:**
```python
# Custom User Model
class CustomUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    # ... additional fields

# JWT Authentication
class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # JWT token validation logic
        pass
```

**API Serializers:**
```python
# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username', 'email', 'profile_picture']

# Book Serializer
class BookSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Book
        fields = '__all__'
```

**ViewSets and API Views:**
```python
# Book ViewSet
class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Book.objects.filter(user=self.request.user)
```

**WebSocket Consumers:**
```python
# Chat Consumer
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # WebSocket connection logic
        pass
    
    async def receive(self, text_data):
        # Handle incoming messages
        pass
```

### **Database Models**

**Core Models Overview:**

**User Model:**
```python
class CustomUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    birth_date = models.DateField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)
    genres = models.JSONField(blank=True, null=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    profile_public = models.BooleanField(default=True)
```

**Book Model:**
```python
class Book(models.Model):
    book_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True, blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    cover_image_url = models.URLField(max_length=500, blank=True, null=True)
    user = models.ForeignKey(CustomUser, related_name='owned_books', on_delete=models.SET_NULL)
    available_for_exchange = models.BooleanField(default=True)
    available_for_borrow = models.BooleanField(default=False)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Swap Model:**
```python
class Swap(models.Model):
    swap_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    initiator = models.ForeignKey(CustomUser, related_name='initiated_swaps')
    receiver = models.ForeignKey(CustomUser, related_name='received_swaps')
    initiator_book = models.ForeignKey(Book, related_name='initiated_swaps')
    receiver_book = models.ForeignKey(Book, related_name='received_swaps')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    message = models.TextField(blank=True, null=True)
    meetup_location = models.CharField(max_length=255, blank=True, null=True)
    meetup_time = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### **API Endpoints Structure**

**Authentication Endpoints:**
```
POST   /api/users/register/           # User registration
POST   /api/users/login/              # User login
POST   /api/users/logout/             # User logout
POST   /api/users/refresh-token/      # Refresh JWT token
POST   /api/users/password-reset/     # Request password reset
POST   /api/users/password-confirm/   # Confirm password reset
```

**User Management:**
```
GET    /api/users/profile/            # Get user profile
PUT    /api/users/profile/            # Update user profile
GET    /api/users/search/             # Search users
POST   /api/users/follow/             # Follow user
DELETE /api/users/unfollow/           # Unfollow user
GET    /api/users/followers/          # Get followers
GET    /api/users/following/          # Get following
```

**Library Management:**
```
GET    /api/library/books/            # List user's books
POST   /api/library/books/            # Add new book
GET    /api/library/books/{id}/       # Get book details
PUT    /api/library/books/{id}/       # Update book
DELETE /api/library/books/{id}/       # Delete book
GET    /api/library/search/           # Search books
POST   /api/library/bookmark/         # Bookmark book
```

**Swap System:**
```
GET    /api/swaps/                    # List user's swaps
POST   /api/swaps/initiate/           # Initiate swap
PUT    /api/swaps/{id}/accept/        # Accept swap
PUT    /api/swaps/{id}/confirm/       # Confirm swap
PUT    /api/swaps/{id}/cancel/        # Cancel swap
GET    /api/swaps/history/            # Swap history
```

**Chat System:**
```
GET    /api/chat/conversations/       # List conversations
POST   /api/chat/conversations/       # Create conversation
GET    /api/chat/conversations/{id}/messages/  # Get messages
POST   /api/chat/conversations/{id}/messages/ # Send message
GET    /api/chat/societies/           # List societies
POST   /api/chat/societies/{id}/messages/send/ # Send society message
```

---

## ⚛️ **Frontend Documentation**

### **React Application Structure**

**Component Hierarchy:**
```
App.jsx
├── AuthProvider (Context)
├── Navbar (Layout)
└── Routes
    ├── HomePage (Public)
    ├── LoginPage (Auth)
    ├── RegisterPage (Auth)
    ├── ProfilePage (Protected)
    ├── LibraryPage (Protected)
    ├── SocialsPage (Protected)
    └── NotificationsPage (Protected)
```

**Key Frontend Components:**

**1. Authentication Components:**
```javascript
// AuthContext.jsx - Global authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const login = async (credentials) => {
    // Login logic with JWT handling
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**2. Library Components:**
```javascript
// BookCard.jsx - Individual book display
const BookCard = ({ book, onSwapRequest, onBookmark }) => {
  return (
    <motion.div className="book-card" whileHover={{ scale: 1.02 }}>
      <img src={book.cover_image_url} alt={book.title} />
      <h3>{book.title}</h3>
      <p>{book.author}</p>
      <div className="actions">
        <button onClick={() => onSwapRequest(book)}>Request Swap</button>
        <button onClick={() => onBookmark(book)}>Bookmark</button>
      </div>
    </motion.div>
  );
};

// LibraryPage.jsx - Main library interface
const LibraryPage = () => {
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('my-library');
  
  return (
    <div className="library-page">
      <LibraryNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <BookGrid books={books} />
      <AddBookModal />
    </div>
  );
};
```

**3. Chat Components:**
```javascript
// ChatPage.jsx - Main chat interface
const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [activeTab, setActiveTab] = useState('dms');
  
  return (
    <div className="chat-page">
      <ChatSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onConversationSelect={setSelectedConversation}
        onSocietySelect={setSelectedSociety}
      />
      {activeTab === 'dms' && selectedConversation && (
        <ConversationView conversation={selectedConversation} />
      )}
      {activeTab === 'groups' && selectedSociety && (
        <SocietyChatView society={selectedSociety} />
      )}
    </div>
  );
};

// ConversationView.jsx - Direct message interface
const ConversationView = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const sendMessage = async () => {
    // Send message logic with WebSocket
  };
  
  return (
    <div className="conversation-view">
      <MessageList messages={messages} />
      <MessageInput 
        value={newMessage}
        onChange={setNewMessage}
        onSend={sendMessage}
      />
    </div>
  );
};
```

### **Custom Hooks**

**API Hooks:**
```javascript
// useBooks.js - Book management hook
export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/library/books/');
      setBooks(response.data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const addBook = useCallback(async (bookData) => {
    // Add book logic
  }, []);
  
  return { books, isLoading, error, fetchBooks, addBook };
};

// useChat.js - Chat functionality hook
export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [socket, setSocket] = useState(null);
  
  const sendMessage = useCallback(async (conversationId, content) => {
    // Send message via WebSocket and API
  }, [socket]);
  
  return { conversations, messages, sendMessage };
};
```

**WebSocket Hook:**
```javascript
// useWebSocket.js - WebSocket connection management
export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);
      options.onMessage?.(data);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };
    
    return () => ws.close();
  }, [url]);
  
  const sendMessage = useCallback((data) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(data));
    }
  }, [socket, isConnected]);
  
  return { socket, isConnected, lastMessage, sendMessage };
};
```

### **State Management**

**Context Providers:**
```javascript
// AuthContext - Authentication state
// ThemeContext - UI theme and styling
// NotificationContext - Toast notifications
// ChatContext - Real-time chat state
```

**Local State Patterns:**
```javascript
// Component state with useState
const [localState, setLocalState] = useState(initialValue);

// Effect hooks for side effects
useEffect(() => {
  // Side effect logic
  return () => {
    // Cleanup logic
  };
}, [dependencies]);

// Callback hooks for performance
const memoizedCallback = useCallback(() => {
  // Callback logic
}, [dependencies]);

// Memo hooks for expensive calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### **Styling System**

**Tailwind CSS Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#456A76',
        accent: '#D4A017',
        secondary: '#F0EAD0',
        background: '#FEFEFE',
        text: '#2D3748',
      },
      fontFamily: {
        'lora': ['Lora', 'serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

**CSS Custom Properties:**
```css
/* index.css */
:root {
  --primary: #456A76;
  --accent: #D4A017;
  --secondary: #F0EAD0;
  --light-accent: #FEF3C7;
  --background: #FEFEFE;
  --text: #2D3748;
  --card-bg: rgba(255, 255, 255, 0.8);
}

/* Component-specific styles */
.bookish-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.flying-books-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.flying-book {
  position: absolute;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
```

**Animation System:**
```javascript
// Framer Motion variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Usage in components
<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
  exit="exit"
>
  {items.map((item, index) => (
    <motion.div key={item.id} variants={fadeInUp}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 🔌 **API Reference**

### **Authentication API**

**POST /api/users/register/**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "birth_date": "YYYY-MM-DD",
  "city": "string",
  "country": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "user_id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

**POST /api/users/login/**
```json
{
  "username": "string",
  "password": "string"
}
```

### **Library API**

**GET /api/library/books/**
- **Query Parameters:** `page`, `search`, `genre`, `available_for_exchange`
- **Response:** Paginated list of books

**POST /api/library/books/**
```json
{
  "title": "string",
  "author": "string",
  "isbn": "string",
  "genre": "string",
  "year": 2024,
  "condition": "excellent|good|fair|poor",
  "available_for_exchange": true,
  "available_for_borrow": false
}
```

### **Chat API**

**GET /api/chat/conversations/**
- **Response:** List of user's conversations with latest message

**POST /api/chat/conversations/{id}/messages/**
```json
{
  "content": "string",
  "message_type": "TEXT|IMAGE|VOICE",
  "reply_to": "message_id (optional)"
}
```

**WebSocket Events:**
```json
// Send message
{
  "type": "chat_message",
  "conversation_id": "uuid",
  "content": "string",
  "message_type": "TEXT"
}

// Typing indicator
{
  "type": "typing",
  "conversation_id": "uuid",
  "is_typing": true
}
```

### **Society API**

**GET /api/chat/societies/**
- **Response:** List of available societies

**POST /api/chat/societies/{id}/join/**
- **Response:** Join society (if public or invited)

**POST /api/chat/societies/{id}/messages/send/**
```json
{
  "content": "string",
  "message_type": "TEXT"
}
```

---

## 🗄️ **Database Schema**

### **Core Tables**

**users_customuser:**
```sql
CREATE TABLE users_customuser (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    birth_date DATE,
    city VARCHAR(100),
    country VARCHAR(100),
    profile_picture TEXT,
    genres JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    profile_public BOOLEAN DEFAULT TRUE
);
```

**library_book:**
```sql
CREATE TABLE library_book (
    book_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13) UNIQUE,
    genre VARCHAR(100),
    year INTEGER,
    cover_image_url TEXT,
    user_id UUID REFERENCES users_customuser(user_id) ON DELETE SET NULL,
    available_for_exchange BOOLEAN DEFAULT TRUE,
    available_for_borrow BOOLEAN DEFAULT FALSE,
    condition VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**chat_conversation:**
```sql
CREATE TABLE chat_conversation (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES chat_conversation(conversation_id),
    user_id UUID REFERENCES users_customuser(user_id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**chat_message:**
```sql
CREATE TABLE chat_message (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversation(conversation_id),
    sender_id UUID REFERENCES users_customuser(user_id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT',
    reply_to_id UUID REFERENCES chat_message(message_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);
```

### **Indexes and Performance**

**Essential Indexes:**
```sql
-- User lookups
CREATE INDEX idx_users_username ON users_customuser(username);
CREATE INDEX idx_users_email ON users_customuser(email);

-- Book searches
CREATE INDEX idx_books_title ON library_book(title);
CREATE INDEX idx_books_author ON library_book(author);
CREATE INDEX idx_books_genre ON library_book(genre);
CREATE INDEX idx_books_user ON library_book(user_id);

-- Chat performance
CREATE INDEX idx_messages_conversation ON chat_message(conversation_id);
CREATE INDEX idx_messages_created_at ON chat_message(created_at DESC);
CREATE INDEX idx_conversations_updated ON chat_conversation(updated_at DESC);

-- Society lookups
CREATE INDEX idx_society_members ON chat_societymember(society_id, user_id);
CREATE INDEX idx_society_messages ON chat_societymessage(society_id, created_at DESC);
```

---

## 🔐 **Authentication System**

### **JWT Implementation**

**Token Structure:**
```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

**Custom Authentication Backend:**
```python
# authentication.py
class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        return (user, validated_token)
```

**Frontend Token Management:**
```javascript
// utils/auth.js
class AuthService {
  constructor() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async refreshAccessToken() {
    try {
      const response = await api.post('/api/users/refresh-token/', {
        refresh: this.refreshToken
      });

      this.token = response.data.access;
      localStorage.setItem('access_token', this.token);
      api.defaults.headers.Authorization = `Bearer ${this.token}`;

      return this.token;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.Authorization;
  }
}
```

### **Permission System**

**Custom Permissions:**
```python
# permissions.py
class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user

class IsSocietyMember(BasePermission):
    def has_permission(self, request, view):
        society_id = view.kwargs.get('society_id')
        return SocietyMember.objects.filter(
            society_id=society_id,
            user=request.user
        ).exists()
```

---

## 💬 **Real-time Features**

### **WebSocket Implementation**

**Django Channels Setup:**
```python
# routing.py
websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<conversation_id>\w+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/society/(?P<society_id>\w+)/$', SocietyChatConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_id>\w+)/$', NotificationConsumer.as_asgi()),
]

# consumers.py
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']

        if message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'typing':
            await self.handle_typing(data)

    async def handle_chat_message(self, data):
        # Save message to database
        message = await self.save_message(data)

        # Broadcast to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )
```

**Frontend WebSocket Client:**
```javascript
// hooks/useWebSocket.js
export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const wsUrl = `${url}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'typing') {
        options.onTyping?.(data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback((data) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(data));
    }
  }, [socket, isConnected]);

  return { socket, isConnected, messages, sendMessage };
};
```

### **Real-time Notifications**

**Notification System:**
```python
# notifications/models.py
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('swap_request', 'Swap Request'),
        ('swap_accepted', 'Swap Accepted'),
        ('new_message', 'New Message'),
        ('new_follower', 'New Follower'),
        ('society_invite', 'Society Invite'),
    ]

    notification_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(default=dict)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

# notifications/utils.py
async def send_notification(user, notification_type, title, message, data=None):
    notification = await Notification.objects.acreate(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        data=data or {}
    )

    # Send via WebSocket
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        f'notifications_{user.user_id}',
        {
            'type': 'notification',
            'notification': NotificationSerializer(notification).data
        }
    )

    return notification
```

---

## 🎨 **UI/UX Components**

### **Design System**

**Color Palette:**
```css
:root {
  /* Primary Colors */
  --primary: #456A76;        /* Deep blue-gray */
  --accent: #D4A017;         /* Golden yellow */
  --secondary: #F0EAD0;      /* Warm cream */
  --light-accent: #FEF3C7;   /* Light cream */

  /* Neutral Colors */
  --background: #FEFEFE;     /* Off-white */
  --text: #2D3748;          /* Dark gray */
  --text-light: #718096;    /* Medium gray */
  --border: #E2E8F0;        /* Light gray */

  /* Status Colors */
  --success: #48BB78;       /* Green */
  --warning: #ED8936;       /* Orange */
  --error: #F56565;         /* Red */
  --info: #4299E1;          /* Blue */
}
```

**Typography System:**
```css
/* Font Families */
.font-lora { font-family: 'Lora', serif; }
.font-open-sans { font-family: 'Open Sans', sans-serif; }

/* Font Sizes */
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
```

**Component Library:**
```javascript
// components/UI/Button.jsx
const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';

  const variants = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 focus:ring-[var(--primary)]/50',
    secondary: 'bg-[var(--secondary)] text-[var(--text)] hover:bg-[var(--secondary)]/80 focus:ring-[var(--secondary)]/50',
    accent: 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 focus:ring-[var(--accent)]/50',
    outline: 'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// components/UI/Card.jsx
const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-[var(--border)]
      ${hover ? 'hover:shadow-md transition-shadow' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

// components/UI/Modal.jsx
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-lora font-semibold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
```

### **Animation System**

**Framer Motion Variants:**
```javascript
// utils/animations.js
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

// Flying books animation
export const flyingBooksVariants = {
  book1: {
    animate: {
      x: [0, 100, 200, 150, 300],
      y: [0, -50, 30, 80, -20],
      rotate: [0, 15, -10, 20, -5],
      scale: [1, 1.1, 0.9, 1.05, 1],
      transition: {
        duration: 25,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  },
  book2: {
    animate: {
      x: [0, -80, -150, -200, -120, -250],
      y: [0, -100, 50, -30, 70, -80],
      rotate: [0, -20, 25, -15, 30, -10],
      scale: [1, 1.2, 0.8, 1.1, 0.9, 1],
      transition: {
        duration: 30,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  }
};
```

---

This completes the comprehensive developer documentation covering all major aspects of the BookSwaps platform. The documentation provides detailed technical information for developers to understand, maintain, and extend the codebase effectively.
