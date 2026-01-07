<div align="center">

# 👟 ShoeVerse - Nền Tảng Bán Giày Trực Tuyến

### *Kết Hợp Thương Mại Điện Tử & Chat Thời Gian Thực*

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=EF4444&center=true&vCenter=true&width=600&lines=Nền+Tảng+Bán+Giày+Full-Stack;Chat+Thời+Gian+Thực+WebSocket;Xác+Thực+JWT+Bảo+Mật;Spring+Boot+%26+React" alt="Typing SVG" />

---

### 🚀 Công Nghệ Sử Dụng

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.1-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

</div>

---

## 🌟 Giới Thiệu

**ShoeVerse** là nền tảng thương mại điện tử bán giày được xây dựng với kiến trúc full-stack hiện đại. Dự án kết hợp chức năng mua sắm trực tuyến với tính năng chat thời gian thực, mang đến trải nghiệm mua sắm tương tác và tiện lợi.

### 🎯 Mục Đích Dự Án
- Học tập và thực hành phát triển ứng dụng full-stack
- Áp dụng kiến trúc 3 lớp (Controller-Service-Repository)
- Triển khai xác thực JWT với HttpOnly Cookies
- Tích hợp WebSocket cho chat thời gian thực

---

## ✨ Tính Năng Đã Triển Khai

### 🔐 Xác Thực & Phân Quyền
- ✅ Đăng ký và đăng nhập người dùng
- ✅ JWT Authentication với HttpOnly Cookies
- ✅ Phân quyền ADMIN/USER
- ✅ Protected Routes trên frontend

### 🛍️ Quản Lý Sản Phẩm
- ✅ Xem danh sách sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Tìm kiếm sản phẩm theo từ khóa
- ✅ Lọc sản phẩm theo danh mục
- ✅ CRUD sản phẩm (chỉ Admin)

### 🛒 Giỏ Hàng
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Cập nhật số lượng sản phẩm
- ✅ Xóa sản phẩm khỏi giỏ hàng
- ✅ Xóa toàn bộ giỏ hàng
- ✅ Tính tổng tiền tự động

### 📦 Quản Lý Đơn Hàng
- ✅ Tạo đơn hàng từ giỏ hàng
- ✅ Xem lịch sử đơn hàng
- ✅ Xem chi tiết đơn hàng
- ✅ Cập nhật trạng thái đơn hàng (Admin)
- ✅ Hỗ trợ thanh toán COD và QR Code
- ✅ Theo dõi trạng thái: PENDING → PROCESSING → SHIPPING → DELIVERED

### 💬 Chat Thời Gian Thực
- ✅ Chat 1-1 giữa người dùng
- ✅ WebSocket (STOMP) cho real-time messaging
- ✅ Lịch sử tin nhắn
- ✅ Trạng thái đã đọc/chưa đọc

### 👨‍💼 Admin Dashboard
- ✅ Quản lý sản phẩm (thêm, sửa, xóa)
- ✅ Quản lý đơn hàng
- ✅ Cập nhật trạng thái đơn hàng

---

## �️ Kiến Trúc Hệ Thống

```mermaid
graph TB
    subgraph Frontend
        A[React 19 + Vite]
        B[React Query]
        C[Zustand Store]
        D[TailwindCSS]
    end
    
    subgraph Backend
        E[Spring Boot 4.0.1]
        F[Spring Security + JWT]
        G[WebSocket STOMP]
        H[JPA/Hibernate]
    end
    
    subgraph Database
        I[(MySQL 8.0)]
    end
    
    A --> E
    B --> E
    A --> G
    E --> F
    E --> H
    H --> I
```

### Backend Architecture (3-Layer)

```
Controller Layer (REST API)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (MySQL)
```

---

## 🔧 Chi Tiết Công Nghệ

### Backend 🎯

| Thành Phần | Công Nghệ | Mô Tả |
|-----------|-----------|-------|
| **Framework** | Spring Boot 4.0.1 | Framework chính |
| **Ngôn Ngữ** | Java 21 | JDK version |
| **Bảo Mật** | Spring Security + JWT | Xác thực & phân quyền |
| **Database** | MySQL 8.0 | Cơ sở dữ liệu quan hệ |
| **ORM** | Spring Data JPA + Hibernate | Object-Relational Mapping |
| **Real-time** | WebSocket (STOMP) | Chat thời gian thực |
| **Build Tool** | Maven | Quản lý dependencies |

**Entities:**
- `User` - Thông tin người dùng (username, email, role)
- `Product` - Sản phẩm (name, price, category, size, stock)
- `CartItem` - Sản phẩm trong giỏ hàng
- `Order` - Đơn hàng (totalAmount, status, paymentMethod)
- `OrderItem` - Chi tiết sản phẩm trong đơn hàng
- `ChatMessage` - Tin nhắn chat

**API Endpoints:**
- `/api/auth/*` - Đăng ký, đăng nhập, đăng xuất
- `/api/products/*` - CRUD sản phẩm, tìm kiếm, lọc
- `/api/cart/*` - Quản lý giỏ hàng
- `/api/orders/*` - Tạo và quản lý đơn hàng
- `/api/chat/*` - Lấy lịch sử chat
- `/ws/*` - WebSocket endpoint cho chat

### Frontend 🎨

| Thành Phần | Công Nghệ | Mô Tả |
|-----------|-----------|-------|
| **Framework** | React 19 | UI framework |
| **Build Tool** | Vite 7.x | Fast build tool |
| **Styling** | TailwindCSS 3.x | Utility-first CSS |
| **State Management** | Zustand | Client state (auth) |
| **Server State** | React Query (TanStack) | API data caching |
| **Routing** | React Router v7 | Client-side routing |
| **HTTP Client** | Axios | API requests |
| **Icons** | Lucide React | Icon library |

**Pages:**
- `Home` - Trang chủ
- `Products` - Danh sách sản phẩm
- `ProductDetail` - Chi tiết sản phẩm
- `Cart` - Giỏ hàng
- `Orders` - Lịch sử đơn hàng
- `Chat` - Chat thời gian thực
- `Admin/Dashboard` - Quản trị viên

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

```bash
Java 21
Node.js 18+
MySQL 8.0+
Maven 3.x
```

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Vivuatroidanh/Social-Commerce-Platform.git
cd Social-Commerce-Platform
```

### 2️⃣ Cài Đặt Backend

```bash
cd shoe-shop

# Tạo database MySQL
mysql -u root -p
CREATE DATABASE Bitis;
exit;

# Cấu hình database trong application.properties
# File: src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/Bitis
spring.datasource.username=root
spring.datasource.password=your_password

# Chạy ứng dụng
./mvnw spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### 3️⃣ Cài Đặt Frontend

```bash
cd bitis-frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## � Database Schema

### Bảng Chính

**users**
- id, username, password, full_name, email, phone, address, role, created_at, updated_at

**products**
- id, name, description, price, image_url, category, size, stock, created_at, updated_at

**cart_items**
- id, user_id, product_id, quantity, created_at

**orders**
- id, user_id, total_amount, payment_method, payment_status, delivery_address, delivery_phone, status, notes, created_at, updated_at

**order_items**
- id, order_id, product_id, quantity, price

**chat_messages**
- id, sender_id, receiver_id, message, is_read, created_at

---

## 🔐 Bảo Mật

- ✅ **JWT Authentication** với HttpOnly Cookies (chống XSS)
- ✅ **Password Encryption** với BCrypt
- ✅ **CORS Configuration** cho cross-origin requests
- ✅ **Role-Based Access Control** (ADMIN/USER)
- ✅ **SQL Injection Prevention** thông qua JPA
- ✅ **CSRF Protection** với SameSite cookies

---

## �️ Lộ Trình Phát Triển

### Đang Phát Triển 🚧
- [ ] Upload hình ảnh sản phẩm
- [ ] Đánh giá và bình luận sản phẩm
- [ ] Thông báo real-time

### Kế Hoạch Tương Lai 📋
- [ ] Tích hợp cổng thanh toán (VNPay, MoMo)
- [ ] Hệ thống voucher và khuyến mãi
- [ ] Theo dõi vận chuyển
- [ ] Dashboard analytics cho Admin
- [ ] Email notifications
- [ ] Docker containerization
- [ ] Progressive Web App (PWA)

---

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/TinhNangMoi`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng mới'`)
4. Push lên branch (`git push origin feature/TinhNangMoi`)
5. Tạo Pull Request

---

## � License

Dự án được phân phối theo giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 👨‍💻 Tác Giả

**ToiTuLamHet**

[![GitHub](https://img.shields.io/badge/GitHub-ToiTuLamHet-181717?style=for-the-badge&logo=github)](https://github.com/ToiTuLamHet)
[![Email](https://img.shields.io/badge/Email-zzznszzz19@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:zzzNszzz19@gmail.com)

---

## 🙏 Lời Cảm Ơn

Dự án được xây dựng với mục đích học tập và thực hành. Cảm ơn cộng đồng open-source đã cung cấp các công cụ tuyệt vời!

---

<div align="center">

**[⬆ Về Đầu Trang](#-shoeverse---nền-tảng-bán-giày-trực-tuyến)**

Made with ❤️ using Spring Boot & React

</div>
