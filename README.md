# 📚 Bookswaps: Connect, Swap, Read! 🚀

**Powered by QuantIQ Dev**
*Project Led by CTO: Musili Andrew*

Welcome to **Bookswaps**, an innovative platform by **QuantIQ Dev**, where book lovers can exchange physical books, connect with fellow readers, and build a thriving literary community. Born out of a premium development ecosystem, this is not just an app—it's a movement.

## 🌟 Project Vision

**Bookswaps** aims to revolutionize traditional book-swapping with a secure, social, and seamless experience. By connecting readers in local communities, we aim to foster literary exchange and friendships, built around the passion for reading.

## ✨ Key Features

### 👤 User Management

* Bookmark, like, and share your favorite books
* Create a personal Library Card to track your reading journey

### 📚 Library

* Discover books in the Global Library
* Showcase your collection via the Personal Library

### 💬 Social Connections

* Follow fellow readers and engage with their book activities
* Connect with Neighbor Readers nearby
* Curated discussion threads and literary conversations
* Friendships through shared reading passions

### 🔄 Book Swaps

* Physical book exchanges with local users
* Smart Location Picking Algorithm (in development)
* Safe public meeting spots for swaps

## 🚧 Features to Build (Open to Invited Collaborators)

* 🤖 **AI Chat Bot for Socializing**: Smart assistant for user engagement
* 💡 **AI-Driven Discussions**: Curated topics moderated by AI
* 📸 **Story-Like Feature**: "Right Now" updates feed

## 🛠️ Tech Stack

**Frontend:** React.js, Tailwind CSS, ReactIcons
**Backend:** Python Django + Django REST Framework
**Containerization:** Docker
**Cache:** Redis
**Database:** PostgreSQL
**APIs:**

* Google Books API / Open Library API
* Google Maps API

**Real-Time:** WebSockets for notifications
**Deployment:** Dockerized infrastructure (Cloud provider TBD)

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have:

* Python 3.10+
* Node.js + npm
* Docker + Docker Compose
* PostgreSQL 15+
* Redis 7+
* Django 4.x
* Tailwind CSS 3.x+
* API keys: Google Maps + Book API

### 🛠️ Installation Steps

1. **Install Docker & PostgreSQL**

   ```bash
   docker --version
   ```

2. **Clone the Repo**

   ```bash
   git clone <private-repo-url>
   cd Bookswaps
   ```

3. **Set Up `.env` Config**
   Create `.env`:

   ```bash
   touch .env
   ```

   Fill with:

   ```env
   DB_NAME=bookswaps
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=db
   DB_PORT=5432
   SECRET_KEY=your_django_secret_key
   DEBUG=True
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_email_app_password
   DEFAULT_FROM_EMAIL=your_email@gmail.com
   REDIS_URL=redis://redis:6379/1
   FRONTEND_URL=http://localhost:5173
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GOOGLE_BOOKS_API_KEY=your_google_books_api_key
   ```

4. **Spin Up with Docker Compose**

   ```bash
   docker-compose up --build
   ```

5. **Verify Local Setup**

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:8000/api`

## 🤝 How to Contribute

This is a proprietary project under **QuantIQ Dev**. All contributions require prior approval:

* Email interest to: **[contact@quantiqdev.com](mailto:contact@quantiqdev.com)**
* Adhere to coding standards, NDA, and team protocols
* Submit code via approved private channels

## 📜 License

**Bookswaps** is a proprietary product of QuantIQ Dev. All rights reserved. Unauthorized use, distribution, or modification is strictly prohibited.

## 🎉 Why Join QuantIQ Dev?

* Work with bleeding-edge tech 🧠
* Get mentored by Founder Musili Andrew 💼
* Build premium software used by real communities 🌍

Let’s build something extraordinary.
**Innovate with QuantIQ Dev.** 💡✨
