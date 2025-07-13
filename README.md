<p align="center">
  <img src="https://ucarecdn.com/844d473f-fb1a-4547-b9fb-2ce1bb5d82be/logo.svg" alt="Tasksoldier Logo" width="120" />
</p>

# Tasksoldier v0.2.1-alpha.2

> An alpha-stage collaborative task management platform built with **Next.js 15**, **Bun**, **Prisma**

## 🚧 Status

**Tasksoldier** is currently in **alpha release**. While core functionality is in place, several features are still under active development.

---

## 🧰 Tech Stack

- ⚡️ [Next.js 15 (App Router)](https://nextjs.org)
- 🐰 [Bun](https://bun.sh) — fast runtime & package manager
- 🧩 [Prisma ORM](https://www.prisma.io/)
- 🔐 Session-based auth (custom)
- ☁️ [Uploadcare](https://uploadcare.com/) for media upload
- 🍞 [Sonner](https://sonner.emilkowal.dev/) for beautiful toast notifications
- 🎨 ShadCN UI (Tailwind-based component library)

---

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/raj-kashyap001/tasksoldier.git
cd tasksoldier
```

### 2. Install dependencies

```bash
bun install
```

### 3. Setup environment variables

Create a `.env` file based on the provided example:

```bash
cp .env.example .env
```

Edit `.env` with your credentials.

### 4. Setup your database

```bash
bunx prisma migrate dev --name init
```

To seed sample data:

```bash
bun run seed
```

### 5. Run the development server

```bash
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
src/
  app/            # Next.js App Router routes
  components/     # UI and app components
  lib/            # Server utilities (e.g. db, session)
  prisma/         # Prisma schema & migrations
  public/         # Static assets
```

---

## ✅ Current Features

- [x] Authentication (signup/login/logout)
- [x] Workspace & project management
- [x] Task Kanban board
- [x] Real-time workspace switching
- [x] Image uploads with Uploadcare
- [x] Profile management
- [x] Modular role & permission system

---

## 🕐 Roadmap

- Notifications (email, toast, browser)
- Activity logs
- User preferences (theme, locale, etc.)
- Comment threads & mentions
- Workspace audit trail

---

## 🛡 License

MIT © 2025 Raj Kashyap
