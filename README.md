# Virtual Try-On Platform

A cutting-edge, real-time Virtual Try-On (VTO) web application that allows users to virtually wear accessories like glasses and hats. Built with React, Three.js, and MediaPipe Face Mesh, this platform provides an immersive AR experience directly in the browser.

---

## Key Features

- **Real-time Face Tracking**: High-precision face landmark detection using MediaPipe Face Mesh.
- **3D Model Overlay**: Seamlessly overlay 3D models (GLB format) on the user's face with accurate positioning and scaling.
- **Product Gallery**: Browse a curated selection of virtual accessories including glasses and hats.
- **User Authentication**: Secure login and signup powered by Supabase.
- **User History & Saved Looks**: Track previously tried-on items and save your favorite looks for later.
- **Responsive Design**: Modern, dark-mode-ready UI built with React and custom CSS.
- **Privacy-First**: Face processing is performed locally in the browser; no video data is sent to external servers.

---

##  Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **3D Rendering**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) & [@react-three/drei](https://github.com/pmndrs/drei)
- **AR/Face Tracking**: [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh.html)
- **Styling**: Custom CSS with Dark Mode support

### Backend & Services
- **Database & Auth**: [Supabase](https://supabase.com/)
- **API (Serverless)**: Node.js functions for custom logic (located in `/api`)

---

## How It Works

### 1. Face Landmark Detection
The core of the AR experience is the `useFaceMesh` hook, which initializes Google's MediaPipe Face Mesh. It captures frames from the user's webcam and returns 468 precise 3D landmarks for the face.

### 2. 3D Coordinate Mapping
Using the detected landmarks, the application calculates the position, rotation, and scale for the 3D models:
- **Glasses**: Anchored to landmarks around the bridge of the nose and the temples.
- **Hats/Caps**: Positioned based on the forehead and top-of-head landmarks.

The `ARCanvas` component integrates these landmarks into a Three.js scene, ensuring the virtual objects follow the user's movements smoothly.

### 3. Model Rendering
Accessories are stored as `.glb` (GL Transmission Format) files in `public/models/`. These are loaded using `useGLTF` from `@react-three/drei` and rendered with high-quality PBR materials for a realistic appearance.

---

## Project Structure

```text
/api/               # Serverless backend functions (login, signup)
/public/            # Static assets and 3D GLB models
/src/
  ├── components/   # UI components (ARCanvas, Gallery, Sidebar, etc.)
  ├── context/      # AuthContext for state management
  ├── hooks/        # useFaceMesh for AR logic
  ├── utils/        # Supabase client and math utilities
  ├── App.jsx       # Main application routing and layout
  └── main.jsx      # Entry point
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Supabase account

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/Virtual-Try-On.git
    cd Virtual-Try-On
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Build for production**:
    ```bash
    npm run build
    ```

---

## Security & Privacy
- **Client-Side Processing**: All face tracking computations happen on the user's device. No video stream or biometric data is stored or transmitted to the cloud.
- **Supabase Auth**: Implements secure session management and row-level security (RLS) for user data.

---

## Future Enhancements
- [ ] Support for more accessory types (earrings, necklaces).
- [ ] Improved lighting matching for more realistic 3D integration.
- [ ] Social sharing functionality for saved looks.
- [ ] Mobile app integration via Progressive Web App (PWA).

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
