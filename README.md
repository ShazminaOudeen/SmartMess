# 🍽 SmartMess – Smart Canteen Management System

[![MongoDB](https://img.shields.io/badge/MongoDB-4DB33D?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![AI Chatbot](https://img.shields.io/badge/AI-Chatbot-blueviolet?style=for-the-badge)]()

---

## 📌 Description
**SmartMess** is a full-stack web application designed to modernize university canteen services by enabling digital meal ordering, cashless payments, and centralized system management.

The platform connects **students, canteen operators, and administrators** through a secure, role-based system that improves efficiency, transparency, and user convenience.

An integrated **AI chatbot** provides instant assistance, helping users navigate the system and resolve common queries.

SmartMess follows a **modular, scalable MERN architecture** that reflects real-world software system design.

---

## 🛠 Tech Stack

- **Frontend:** React.js, JavaScript, Tailwind CSS, Vite  
- **Backend:** Node.js, Express.js (REST APIs)
- **Database:** MongoDB  
- **Architecture:** MERN Stack, RESTful API Architecture  
- **Tools:** VS Code, Postman, Git & GitHub  

### Additional Component
- AI Chatbot Assistant  

---

## ✨ Features (Functional Overview)

## 👤 User Management & Authorization
- Student, Canteen, and Admin registration  
- Secure login & authentication  
- Role-based access control  
- Profile management & password update  

---

## 🎓 Student Module

### 🍽 Canteen & Meal Browsing
- View approved canteens  
- Browse meals by canteen  
- Filter meals by price, category, and availability  

### 🛒 Cart & Order Management
- Add meals to cart  
- Update quantities & remove items  
- Place orders  
- Cancel orders before preparation  

### 💳 Payment Handling
- Checkout & payment interface  
- Mock/sandbox payment processing  
- Payment success/failure notifications  
- Secure transaction storage  

### 📊 Student Tracking
- View order history & order status  
- Monitor monthly meal expenses  
- Submit ratings & feedback  

---

## 🏪 Canteen Module

### 🏪 Profile Management
- Update canteen details  
- Manage operating hours  
- Upload canteen images  

### 🍛 Meal Management
- Add, edit, delete meals  
- Set meal availability & pricing  
- Categorize menu items  

### 📦 Order Processing
- View incoming orders  
- Accept or reject orders  
- Update preparation status  
- Mark orders as completed  

### 💰 Revenue Tracking
- Daily sales summary  
- Monthly income reports  

### ⭐ Feedback Monitoring
- View ratings & reviews  
- Respond to feedback  

---

## 🛠 Admin & System Oversight Module

### ✅ Canteen Approval & Compliance
- Review canteen registrations  
- Approve or reject applications  
- Enable or disable canteen visibility  

### 🚨 Complaint Management
- Students & canteens submit complaints  
- Admin reviews & resolves issues  
- Maintain complaint history  

### 📊 System Monitoring & Analytics
- View total users & orders  
- Monitor system activity  
- Track reported canteens  

### 🔐 Administrative Controls
- Block/unblock user accounts  
- Moderate reviews  
- Maintain audit logs  

---

## 🤖 AI Chatbot Assistant
- Provides instant user support  
- Helps students navigate ordering & payments  
- Answers frequently asked questions  
- Enhances user experience  

---

## 🚀 Installation & Setup Guide

## 📌 Prerequisites

Make sure you have installed:

- Node.js (v18 or above)
- MongoDB (Local or MongoDB Atlas)
- Git
- VS Code

---

## 🔽 1️⃣ Clone the Repository

```bash
git clone https://github.com/ShazminaOudeen/SmartMess.git
cd SmartMess
```

---

## 📦 2️⃣ Backend Setup

```bash
cd backend
npm install
```

### 🔐 Create `.env` File in Backend Folder

Create a file named `.env` and add:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### ▶ Run Backend Server

```bash
npm start
```

Server will run on:

```
http://localhost:5000
```

---

## 💻 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

## 🧪 API Testing

- Postman to test backend APIs

---

## 🎓 Project Details

**Academic Year:** 3rd Year – 1st Semester  
**Module:** IT Project Management (ITPM)  
**Team Size:** 4 Members  
**Contribution Areas:**
- User Authentication & Authorization  
- Student Ordering & Payment System  
- Canteen Management & Revenue Tracking  
- Admin Oversight & Complaint Handling  
- AI Chatbot Integration  



