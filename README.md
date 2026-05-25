
---

# Volume I. 🖋️

A minimalist, cross-device personal diary application designed for focused writing and quiet reflection. Built with a focus on privacy, elegant typography, and seamless cloud synchronization.

## ✨ Features

* **Cloud Synchronization:** Write on your laptop, read on your phone. Powered by Firebase Firestore for real-time, cross-device access.
* **True Dark Mode:** A custom-built dark theme that respects your explicit toggle choice, completely bypassing forced OS-level overrides.
* **Zen Mode:** A draggable, resizable sidebar that can be collapsed entirely (0px) for a distraction-free writing experience.
* **Rich Memories:** Attach up to 5 photos per entry with a built-in image lightbox and download capabilities.
* **Organization:** Tag tracking, search functionality, and a "Flashback" feature to revisit random past memories.
* **Data Portability:** Export your entire journal to JSON, beautifully formatted HTML, or plain TXT. Import legacy JSON backups with ease.

## 🛠️ Tech Stack

* **Frontend:** Next.js / React
* **Styling:** Tailwind CSS (with custom global theme overrides)
* **Database & Auth:** Google Firebase (Firestore)
* **Icons:** Lucide React
* **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/veda-anshu/DEAR-DIARY.git]
   cd volume-one

2. **Install dependencies:**
    ```bash
    npm install

    ```

3. **Set up Firebase:**
* Create a new project at [Firebase Console](https://console.firebase.google.com/).
* Initialize a Firestore Database (Start in Test Mode for development).
* Register a Web App to get your Firebase configuration keys.
* Open `utils/firebase.js` and replace the placeholder keys with your actual Firebase config.


4. **Run the development server:**
    ```bash
    npm run dev
    
    ```


Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the app.

## ☁️ Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1. Push your code to a private GitHub repository.
2. Log in to Vercel and click **Add New... > Project**.
3. Import your repository. Vercel will automatically detect Next.js.
4. Click **Deploy**. Your diary is now live and accessible from any device.

## 📝 Author

Developed by Pampana Veda Anshu.
