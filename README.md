# Vanilla JavaScript E-Commerce Platform

A fully-integrated e-commerce platform built with pure JavaScript, HTML, and CSS. This project demonstrates a complete online shopping experience without relying on any frameworks.

##  Features

### Core Features
-  User Authentication (Registration & Login)
-  Responsive Product Catalog
-  Shopping Cart Management
-  Order Processing
-  Admin Dashboard
-  Local Storage Persistence

### Extra Mile Features
-  Version Control with Git Flow
-  Unit & Integration Tests
-  Cross-Browser Compatibility
-  Metrics & Analytics
-  CI/CD Pipeline

##  Project Structure

```
├── auth/
│   ├── auth.html
│   ├── auth.css
│   └── auth.js
├── products/
│   ├── products.html
│   ├── products.css
│   └── products.js
├── cart/
│   ├── cart.html
│   ├── cart.css
│   └── cart.js
├── orders/
│   ├── orders.js
│   └── thankyou.html
├── admin/
│   ├── admin.html
│   ├── admin.css
│   └── admin.js
├── utils/
│   ├── storage.js
│   ├── promo.js
│   ├── payment.js
│   └── email.js
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
└── README.md
```

##  Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Local development server (e.g., Live Server VS Code extension)

### Installation
1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```
2. Navigate to the project directory:
   ```bash
   cd vanilla-js-ecommerce
   ```
3. Open index.html in your browser or use a local development server

##  Full Integration & Visual Presentation

The platform offers a complete, integrated shopping experience:

-  Seamless module integration (auth, products, cart, orders, admin)
-  Visual product catalog with images
-  Connected navigation across all pages
-  Complete product cards with:
  - Product name
  - Description
  - Price
  - Image
  - "Add to Cart" button
-  Order confirmation with purchase summary
-  Responsive header and footer
-  Professional transitions and UI/UX

##  Testing

Run unit tests:
```bash
npm run test
```

Run integration tests:
```bash
npm run test:integration
```

##  Metrics & Monitoring

The platform collects:
- Actions per minute
- Filter usage statistics
- Performance metrics
- Error logs

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the LICENSE file for details. 