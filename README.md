# 🎓 College REST API - Hono ⚡ + Prisma + PostgreSQL

This project is a simple **College Management REST API** built using:
- 🦄 [Hono.js](https://hono.dev/) - Lightweight, fast web framework
- 🛠️ [Prisma ORM](https://www.prisma.io/)
- 🐘 PostgreSQL

It handles:
✅ Student Management  
✅ Professor Management  
✅ Proctorship Relations  
✅ Library Memberships

---

## 🚀 Features

- **CRUD** operations for Students and Professors
- **Proctorship** - Assign a student to a professor
- **Library Membership** management
- Prevent **duplicate Aadhar** numbers
- **Cascade delete** support (Deleting a professor deletes assigned students)

---



## 🛠️ Installation & Setup

```bash
https://github.com/jagadish018/carbon.git
cd carbon 
npm install

npx prisma migrate dev --name "v5"


##  Setup .env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/your_db"

```
npm run dev

```
open http://localhost:3000
