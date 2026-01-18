---

# 🍔 Foodingo — Food Delivery Mobile App (React Native)

Foodingo is a modern food delivery mobile application built using **React Native CLI** with a complete customer and restaurant-owner experience. It supports restaurant onboarding, menu management, cart, checkout, user authentication, and a clean admin-style dashboard.

---

## 🚀 Features

### 👤 User Features

* User authentication (Login & Register)
* Browse restaurants
* Browse food categories
* View restaurant menus
* Add items to cart
* Update item quantities
* View cart summary
* Checkout flow
* Profile management
* Order history (coming soon)

### 🏪 Restaurant Owner Features

* Register restaurant
* Upload restaurant banner
* Add menu items
* Upload item images (Cloudinary)
* Assign categories
* Set discounts
* Veg / Non-Veg classification
* Admin dashboard

### 🎨 UI & UX

* Clean modern UI
* Reanimated animations
* Drawer navigation
* Premium admin layout
* Image picker & cropper
* Responsive grid layout
* Beautiful cart UI
* Toast notifications
* Smooth splash screen

---

## 🛠 Tech Stack

| Tech              | Description               |
| ----------------- | ------------------------- |
| React Native CLI  | Mobile framework          |
| React Navigation  | Stack & Drawer navigation |
| Reanimated        | Animations                |
| Axios             | API calls                 |
| AsyncStorage      | Local storage             |
| Cloudinary        | Image hosting             |
| Image Crop Picker | Image upload              |
| Context API       | Global state              |
| Toast Message     | Notifications             |

---

## 📱 Screens

* Splash Loader
* Login
* Register
* Home (Offers + Categories + Restaurants)
* Restaurant Menu
* Category Items
* Cart
* Profile
* Add Restaurant (Owner)
* Add Items (Owner)
* Add Categories (Admin)
* Drawer Menu

---

## 🏗 Folder Structure

```
src/
 ├── auth components/
 │    ├── Login.jsx
 │    └── Register.jsx
 ├── components/
 │    ├── Cart.jsx
 │    ├── Profile.jsx
 │    ├── RestaurantItems.jsx
 │    ├── CategoryItem.jsx
 │    └── ...
 ├── additionComponents/
 │    ├── AddRestaurant.jsx
 │    ├── AddItem.jsx
 │    └── AddCategory.jsx
 ├── navigators/
 │    └── HomewithDrawer.jsx
 ├── utils/
 │    ├── api.js
 │    ├── userContext.js
 │    ├── GenericForm.jsx
 │    ├── ImagePicker.jsx
 │    ├── Loader.jsx
 │    └── counter.jsx
 └── App.js
```

---

## 🔐 Authentication

* JWT based authentication
* Token stored securely in AsyncStorage
* Auto-login using saved session
* Secure API interceptor

---

## 🌐 API Integration

Backend API:

```
https://foodingo-backend-8ay1.onrender.com/api
```

Main endpoints:

* `/login-user`
* `/register`
* `/restaurants`
* `/items/:restaurantId`
* `/items/category/:category`
* `/cart`
* `/cart/add`
* `/cart/increment`
* `/cart/decrement`
* `/categories`

---

## 🖼 Image Upload

* Cloudinary integration
* Image cropping
* Banner & square image support
* Automatic upload & preview

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/ritikch027/foodingo-.git
cd foodingo
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Install pods (iOS)

```bash
cd ios && pod install && cd ..
```

### 4️⃣ Run the app

#### Android

```bash
npx react-native run-android
```

#### iOS

```bash
npx react-native run-ios
```

---

## 🔑 Environment Setup

Make sure you have:

* Node.js >= 16
* Android Studio
* Xcode (for iOS)
* React Native CLI
* Emulator or real device

---

## 🧠 Architecture

* Global state using Context API
* Central API service
* Reusable GenericForm system
* Modular component design
* Scalable navigation system
* Optimized API requests

---

## ✨ Future Enhancements

* Online payments (Razorpay / Stripe)
* Order tracking
* Push notifications
* Live delivery tracking
* Dark mode
* Admin analytics dashboard
* Reviews & ratings
* Favorites

---

## 👨‍💻 Author

Built with ❤️ by **Ritik Chauhan**

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you like this project, give it a star ⭐
It helps a lot!

---

## 📸 App Preview
(to be added)

---

