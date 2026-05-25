# Volume I. 🖋️

A minimalist, cross-device personal diary application designed for focused writing and quiet reflection. Built with a focus on privacy, elegant typography, and seamless cloud synchronization.

## 🌐 Live Demo

🔗 https://dear-diary-teal.vercel.app/

---

## ✨ Features

- **Cloud Synchronization:** Write on your laptop, read on your phone. Powered by Firebase Firestore for real-time, cross-device access.

- **True Dark Mode:** A custom-built dark theme that respects your explicit toggle choice, completely bypassing forced OS-level overrides.

- **Zen Mode:** A draggable, resizable sidebar that can be collapsed entirely (0px) for a distraction-free writing experience.

- **Rich Memories:** Attach up to 5 photos per entry with a built-in image lightbox and download capabilities.

- **Organization:** Tag tracking, search functionality, and a "Flashback" feature to revisit random past memories.

- **Data Portability:** Export your entire journal to JSON, beautifully formatted HTML, or plain TXT. Import legacy JSON backups with ease.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js / React
- **Styling:** Tailwind CSS (with custom global theme overrides)
- **Database & Auth:** Google Firebase (Firestore)
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm

---

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/veda-anshu/DEAR-DIARY.git
cd DEAR-DIARY
````

#### 2. Install dependencies

```bash
npm install
```

#### 3. Set up Firebase

* Create a project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
* Initialize a Firestore Database
* Register a Web App
* Copy your Firebase configuration keys

Open:

```bash
utils/firebase.js
```

Replace the placeholder configuration with your own Firebase config.

---

#### 4. Run the development server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

in your browser.

---

## ☁️ Deployment

This project is optimized for deployment on Vercel.

### Steps

1. Push your code to a GitHub repository
2. Log in to Vercel
3. Click:

```text
Add New → Project
```

4. Import the repository
5. Click **Deploy**

Your diary app will be live instantly.

---

## 📸 Core Experience

Volume I. focuses on creating a calm and immersive journaling experience through:

* Elegant typography
* Minimal visual clutter
* Smooth transitions
* Responsive cross-device layout
* Personalized reflection tools

---

## 🔐 Privacy Note

This application stores journal entries securely using Firebase Firestore.
Sensitive API keys and credentials should always be stored using environment variables before production deployment.

---


## ⭐ Acknowledgements

Built using:

* React
* Next.js
* Tailwind CSS
* Firebase
* Vercel

---
