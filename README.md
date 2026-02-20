# Foodingo 🍔📱 - Food Delivery App (React Native)

![React Native](https://img.shields.io/badge/React%20Native-0.80.x-61DAFB?logo=react&logoColor=000)
![Android](https://img.shields.io/badge/Android-Supported-3DDC84?logo=android&logoColor=fff)
![iOS](https://img.shields.io/badge/iOS-Supported-000000?logo=apple&logoColor=fff)
![Node](https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js&logoColor=fff)
![License](https://img.shields.io/badge/License-MIT-blue)

Foodingo is a modern food delivery mobile app built with **React Native CLI**. It includes a customer experience (browse, cart, checkout), an owner experience (restaurant + menu management), and admin-style management screens.

---

## ✨ Highlights

- 🔐 Auth + session persistence (AsyncStorage)
- 🏪 Restaurant onboarding (owner flow)
- 🧾 Cart + checkout (COD + Razorpay online payments)
- 🖼️ Image upload + crop (Cloudinary)
- 🧭 Stack + Drawer navigation
- 🎬 Smooth animations (Reanimated) + custom loader

---

## 🚀 Features

### 👤 Customer

- Login / Register
- Browse restaurants, categories, menus
- Add to cart, update quantities
- Checkout flow
- Profile
- Orders (screen included; backend support may vary)

### 🏪 Restaurant Owner

- Register restaurant + upload banner
- Add menu items + upload item images
- Set categories, discounts, veg/non-veg

### 🎨 UI/UX

- Clean, modern UI
- Toast notifications
- Animated loader + pleasant empty/error states

---

## 🧰 Tech Stack

| Tool / Library | Why it's used |
|---|---|
| React Native CLI | Native mobile app framework |
| React Navigation | Stack + Drawer navigation |
| Axios | API requests |
| AsyncStorage | Token/session storage |
| Reanimated | Animations |
| react-native-vector-icons | Icons |
| react-native-image-crop-picker | Image picking + cropping |
| Cloudinary | Image hosting |
| Razorpay | Online payments |

---

## 🖼️ Screenshots

### 👤 Customer

| Home                                       | Cart                               | Profile                                  |
| ------------------------------------------ | ---------------------------------- | ---------------------------------------- |
| ![Home](docs/screenshots/customerHome.jpg) | ![Cart](docs/screenshots/cart.jpg) | ![Profile](docs/screenshots/profile.jpg) |

| Payment                                  | Checkout                                   | Order Details                                       |
| ---------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| ![Payment](docs/screenshots/payment.jpg) | ![Checkout](docs/screenshots/checkout.jpg) | ![Order Details](docs/screenshots/orderDetails.jpg) |

---

### 🏪 Owner

| Owner Home                                         | Add New Item                                       | Manage Items                                      |
| -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| ![Owner Home](docs/screenshots/ownerDashboard.jpg) | ![Add New Items](docs/screenshots/addNewItems.jpg) | ![Manage Items](docs/screenshots/manageItems.jpg) |

| Edit Restaurant                                                | Add Restaurant                                         | Restaurant Orders                                           |
| -------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| ![Edit Restaurant](docs/screenshots/editRestaurantDetails.jpg) | ![Add Restaurant](docs/screenshots/addRestaurant.jpg) | ![Restaurant Orders](docs/screenshots/restaurantOrders.jpg) |

---

### 🛠️ Admin

| Admin Dashboard                                         | All Users                                            | All Restaurants                                                  |
| ------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| ![Admin Dashboard](docs/screenshots/adminDashboard.jpg) | ![Admin Users](docs/screenshots/adminPanelUsers.jpg) | ![Admin Restaurants](docs/screenshots/adminPanelRestaurants.jpg) |

---

## 🏗️ Project Structure

```text
src/
  auth components/
    Login.jsx
    Register.jsx
  components/
    Cart.jsx
    CategoryItem.jsx
    Profile.jsx
    RestaurantItems.jsx
    ...
  navigators/
    HomewithDrawer.jsx
  screens/
    Checkout.jsx
    MyOrders.jsx
    OrderDetails.jsx
    OrderSuccess.jsx
    RestaurantOrders.jsx
    Settings.jsx
  utils/
    api.jsx
    userContext.jsx
    ImagePicker.jsx
    Loader.jsx
```

---

## 🔌 Backend / API

Default base URL is set in `src/utils/api.jsx`:

```txt
https://foodingo-backend-8ay1.onrender.com/api
```

If you're running your own backend, update the `baseURL` in `src/utils/api.jsx`.

Note: there is a `.env` with `BASE_URL`, but the app currently uses the hardcoded `baseURL` above (keep them in sync if you use both).

### 💤 Cold-start note (Render)

If the backend is sleeping, the app may show a "kitchen is warming up" screen for a few seconds. Just hit **Retry**.

---

## 🖼️ Image Upload (Cloudinary)

Cloudinary config is currently hardcoded in `src/utils/ImagePicker.jsx`:

- `cloudName`
- `uploadPreset`

Replace these with your own Cloudinary details for production.

---

## 💳 Payments (Razorpay)

Checkout supports **COD** and **Online (Razorpay)**. Online payments depend on backend endpoints to create and verify Razorpay orders.

---

## ⚙️ Setup & Run

### Prerequisites

- Node.js `>= 18`
- React Native CLI environment set up (Android Studio / Xcode)
- CocoaPods (iOS): `sudo gem install cocoapods` (if needed)

### Install

```bash
npm install
```

### iOS pods

```bash
cd ios && pod install && cd ..
```

### Run

```bash
# Android
npm run android

# iOS
npm run ios
```

### Useful scripts

```bash
npm run start
npm run lint
npm test
```

---

## 🗺️ Roadmap

- ⭐ Favorites + ratings/reviews
- 🔔 Push notifications
- 📍 Live order tracking
- 🌙 Dark mode
- 📊 Admin analytics

---

## 👨‍💻 Author

Built with ❤️ by **Ritik Chauhan**

---

## 📄 License

MIT
