# 🪙 CoinKeeper

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
</div>

<br />

**CoinKeeper** is a robust mobile cryptocurrency tracking application built with **React Native** and **TypeScript**. It allows users to track real-time crypto prices, view detailed market data, and manage a personalized portfolio with **offline-first** architecture and **cloud synchronization**.

---

## 📸 Screenshots

| Login / Auth | Market List | Coin Detail | Favorites |
|:---:|:---:|:---:|:---:|
| ![login](https://github.com/user-attachments/assets/cb7d2eac-1e33-4606-83dd-1985ca3e1fe4) |  ![Piyasalar](https://github.com/user-attachments/assets/78f55664-3fbd-4199-9f51-2ee25d14f0ad) |![detay](https://github.com/user-attachments/assets/f67b7325-2a87-4eb2-a7ce-870fb68f3c5f)| ![Favoriler](https://github.com/user-attachments/assets/e600ff0c-ed16-4a92-8063-1f76458da58b) |

---

## 🚀 Key Features

* **Authentication Flow:** Secure Email/Password login and registration using **Firebase Auth**.
* **Real-time Market Data:** Integration with **CoinGecko API** to fetch live prices, market caps, and volume data.
* **Performance Optimization:** Implemented **FlatList** with pagination (Infinite Scroll) to handle large datasets efficiently.
* **Search & Filtering:** Client-side filtering for instant search results using interactive UI.
* **Offline-First Strategy:** Uses **AsyncStorage** to cache market data, ensuring the app remains functional even without an internet connection.
* **Favorites & Sync:** Real-time database integration using **Firestore**. Users can add coins to favorites, and the list syncs across devices instantly.
* **Hybrid Data Fetching:** Optimized API usage by fetching specific price updates only for favorited coins to avoid Rate Limiting (HTTP 429).
* **Interactive UI:** Custom expandable text components, Pull-to-Refresh functionality, and Loading/Error states.

---

## 🛠 Tech Stack & Architecture

* **Core:** React Native (Expo SDK), TypeScript
* **Navigation:** React Navigation (Stack & Bottom Tabs)
* **State Management:** React Context API (Auth Flow)
* **Network:** Axios (Service Layer Pattern)
* **Backend-as-a-Service:** Firebase (Authentication, Firestore)
* **Storage:** AsyncStorage (Local Caching)
* **UI/UX:** StyleSheet, Vector Icons, Safe Area Context

### Project Structure (Clean Architecture)

src/ 
  ├── components/ # Reusable UI components (CoinItem, Buttons) 
  ├── config/ # Firebase and App configurations 
  ├── context/ # Global state (AuthContext) 
  ├── navigation/ # Navigation stacks and tabs 
  ├── screens/ # Application screens (Home, Detail, Login...) 
  ├── services/ # API calls and business logic (Separation of Concerns) 
  ├── types/ # TypeScript interfaces and navigation types 
  └── utils/ # Helper functions (Storage, formatting)


---

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/alican41/CoinKeeper.git](https://github.com/alican41/CoinKeeper.git)
    cd CoinKeeper
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Firebase and API keys:
    ```env
    EXPO_PUBLIC_API_URL=[https://api.coingecko.com/api/v3](https://api.coingecko.com/api/v3)
    EXPO_PUBLIC_FB_API_KEY=your_api_key
    EXPO_PUBLIC_FB_AUTH_DOMAIN=your_project_id.firebaseapp.com
    EXPO_PUBLIC_FB_PROJECT_ID=your_project_id
    # ... other firebase config
    ```

4.  **Run the App**
    ```bash
    npx expo start
    ```


