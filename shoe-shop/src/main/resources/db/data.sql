-- Insert Users (password: 123456 - đã mã hóa BCrypt)
INSERT INTO users (username, password, full_name, email, phone, address, role) VALUES
('admin', '$2a$10$67oPMoBWuF4Fsc7uRcM2SOxAm4jYtloKLcOFnJqDUI0qOqm.rOUUS', 'Administrator', 'admin@bitis.com', '0901234567', '123 Lê Lợi, Q1, TP.HCM', 'ADMIN'),
('user1', '$2a$10$67oPMoBWuF4Fsc7uRcM2SOxAm4jYtloKLcOFnJqDUI0qOqm.rOUUS', 'Nguyễn Văn A', 'user1@gmail.com', '0912345678', '456 Nguyễn Huệ, Q1, TP.HCM', 'USER'),
('user2', '$2a$10$67oPMoBWuF4Fsc7uRcM2SOxAm4jYtloKLcOFnJqDUI0qOqm.rOUUS', 'Trần Thị B', 'user2@gmail.com', '0923456789', '789 Trần Hưng Đạo, Q5, TP.HCM', 'USER');

-- Insert Products
INSERT INTO products (name, description, price, image_url, category, size, stock) VALUES
('Giày Thể Thao Nam Hunter 2024', 'Giày thể thao phong cách năng động, phù hợp với giới trẻ', 599000, '/assets/shoes/hunter-nam.jpg', 'NAM', '42', 100),
('Giày Chạy Bộ Nữ Hunter X', 'Giày chạy bộ nhẹ, thoáng khí dành cho nữ', 549000, '/assets/shoes/hunter-nu.jpg', 'NỮ', '37', 80),
('Giày Sneaker Biti''s Hunter Street', 'Giày sneaker phong cách đường phố', 649000, '/assets/shoes/hunter-street.jpg', 'UNISEX', '40', 120),
('Giày Thể Thao Nam Hunter Core', 'Thiết kế cơ bản, bền bỉ cho hoạt động hàng ngày', 499000, '/assets/shoes/hunter-core.jpg', 'NAM', '41', 90),
('Giày Nữ Hunter Liteknit', 'Công nghệ đan lưới thoáng khí, siêu nhẹ', 699000, '/assets/shoes/hunter-liteknit.jpg', 'NỮ', '38', 70),
('Giày Cao Cổ Hunter Street', 'Phong cách cá tính, độc đáo', 749000, '/assets/shoes/hunter-high.jpg', 'NAM', '42', 60),
('Giày Hunter Festa', 'Dòng sản phẩm đặc biệt cho các dịp lễ hội', 799000, '/assets/shoes/hunter-festa.jpg', 'NỮ', '36', 50),
('Giày Chạy Bộ Hunter Speed', 'Tối ưu cho tốc độ và hiệu suất', 899000, '/assets/shoes/hunter-speed.jpg', 'NAM', '43', 85),
('Giày Slip-on Hunter Easy', 'Dễ dàng xỏ chân, tiện lợi', 449000, '/assets/shoes/hunter-easy.jpg', 'UNISEX', '39', 110),
('Giày Hunter Nameless', 'Phiên bản giới hạn, thiết kế độc quyền', 1299000, '/assets/shoes/hunter-nameless.jpg', 'UNISEX', '41', 30);

-- Insert sample cart items
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(2, 1, 2),
(2, 3, 1),
(3, 2, 1);

-- Insert sample orders
INSERT INTO orders (user_id, total_amount, payment_method, payment_status, delivery_address, delivery_phone, status) VALUES
(2, 1248000, 'COD', 'PENDING', '456 Nguyễn Huệ, Q1, TP.HCM', '0912345678', 'PENDING'),
(3, 549000, 'QR_CODE', 'PAID', '789 Trần Hưng Đạo, Q5, TP.HCM', '0923456789', 'PROCESSING');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES
(1, 1, 'Giày Thể Thao Nam Hunter 2024', 599000, 2, 1198000),
(1, 9, 'Giày Slip-on Hunter Easy', 449000, 1, 449000),
(2, 2, 'Giày Chạy Bộ Nữ Hunter X', 549000, 1, 549000);