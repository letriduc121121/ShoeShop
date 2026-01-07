// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';
let currentUser = null;

// Load user from sessionStorage (survives page refresh)
try {
    const userData = sessionStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
} catch (e) {
    console.warn('Invalid currentUser in sessionStorage');
}

// API Helper Functions
const apiCall = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include' // Send cookies with request
    });

    console.log(`ðŸ“¡ ${options.method || 'GET'} ${endpoint} - Status: ${response.status}`);

    if (response.status === 401) {
        console.error('âŒ Unauthorized - logging out');
        logout();
        return null;
    }

    if (response.status === 403) {
        console.error('âŒ Forbidden - insufficient permissions');
        showToast('Báº¡n khÃ´ng cÃ³ quyá»n thá»±c hiá»‡n thao tÃ¡c nÃ y', 'error');
        throw new Error('Forbidden');
    }

    if (response.status === 204) return null;

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

// Format Currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Show Toast Notification
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#00C853' : '#FF1744'};
        color: white;
        border-radius: 8px;
        font-weight: 600;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Navigation
const navigateTo = (page) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const pageElement = document.getElementById(`${page}Page`);
    const navLink = document.querySelector(`[data-page="${page}"]`);

    if (pageElement) {
        pageElement.classList.add('active');
        if (navLink) navLink.classList.add('active');

        // Load page data ONLY when navigating to it
        switch(page) {
            case 'home':
                loadFeaturedProducts();
                break;
            case 'products':
                loadAllProducts();
                break;
            case 'cart':
                if (currentUser) loadCart();
                else openModal('authModal');
                break;
            case 'orders':
                if (currentUser) loadOrders();
                else openModal('authModal');
                break;
            case 'chat':
                if (currentUser) loadChat();
                else openModal('authModal');
                break;
            case 'admin':
                if (isAdmin()) {
                    loadAdminProducts();
                    loadAdminOrders();
                    loadAdminStats();
                } else {
                    showToast('Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p', 'error');
                    navigateTo('home');
                }
                break;
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Modal Functions
const openModal = (modalId) => {
    document.getElementById(modalId).classList.add('active');
};

const closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('active');
};

// Auth Functions
const checkAuth = () => {
    if (!currentUser) {
        openModal('authModal');
        return false;
    }
    return true;
};

const updateUserUI = () => {
    const userInfo = document.getElementById('userInfo');

    if (currentUser) {
        userInfo.innerHTML = `
            <strong>${currentUser.fullName}</strong>
            <small>${currentUser.username}${currentUser.role === 'ADMIN' ? ' (Admin)' : ''}</small>
        `;
        updateAdminUI();
    }
};

const login = async (username, password) => {
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response) {
            currentUser = {
                id: response.id,
                username: response.username,
                fullName: response.fullName,
                email: response.email,
                role: response.role
            };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

            updateUserUI();
            closeModal('authModal');
            showToast('ÄÄƒng nháº­p thÃ nh cÃ´ng!');

            // Load cart after login
            loadCart();

            if (currentUser.role === 'ADMIN') {
                navigateTo('admin');
            }
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
};

const register = async (data) => {
    try {
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response) {
            currentUser = {
                id: response.id,
                username: response.username,
                fullName: response.fullName,
                email: response.email,
                role: response.role
            };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

            updateUserUI();
            closeModal('authModal');
            showToast('ÄÄƒng kÃ½ thÃ nh cÃ´ng!');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
};

const logout = async () => {
    try {
        await apiCall('/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error('Logout error:', e);
    }

    currentUser = null;
    sessionStorage.removeItem('currentUser');

    document.getElementById('userMenu').classList.remove('active');
    updateUserUI();
    navigateTo('home');
    showToast('ÄÃ£ Ä‘Äƒng xuáº¥t');
};

// Product Functions
const loadFeaturedProducts = async () => {
    const container = document.getElementById('featuredProducts');
    container.innerHTML = '<div class="loading">Äang táº£i sáº£n pháº©m...</div>';

    try {
        const products = await apiCall('/products');
        const featured = products.slice(0, 6);

        container.innerHTML = featured.map(product => `
            <div class="product-card" onclick="showProductDetail(${product.id})">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}" onerror="this.style.display='none'">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                            THÃŠM VÃ€O GIá»Ž
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="empty-message">KhÃ´ng thá»ƒ táº£i sáº£n pháº©m</div>';
    }
};

const loadAllProducts = async (category = 'ALL') => {
    const container = document.getElementById('allProducts');
    container.innerHTML = '<div class="loading">Äang táº£i sáº£n pháº©m...</div>';

    try {
        let products;
        if (category === 'ALL') {
            products = await apiCall('/products');
        } else {
            products = await apiCall(`/products/category/${category}`);
        }

        if (products.length === 0) {
            container.innerHTML = '<div class="empty-message">KhÃ´ng cÃ³ sáº£n pháº©m nÃ o</div>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card" onclick="showProductDetail(${product.id})">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}" onerror="this.style.display='none'">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                            THÃŠM VÃ€O GIá»Ž
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="empty-message">KhÃ´ng thá»ƒ táº£i sáº£n pháº©m</div>';
    }
};

const showProductDetail = async (productId) => {
    try {
        const product = await apiCall(`/products/${productId}`);

        document.getElementById('productDetail').innerHTML = `
            <div class="product-detail-image">
                <img src="${product.imageUrl}" alt="${product.name}" onerror="this.style.display='none'">
            </div>
            <div class="product-detail-info">
                <span class="product-detail-category">${product.category}</span>
                <h2 class="product-detail-name">${product.name}</h2>
                <p class="product-detail-description">${product.description || 'GiÃ y thá»ƒ thao cháº¥t lÆ°á»£ng cao'}</p>
                <div class="product-detail-price">${formatCurrency(product.price)}</div>
                
                <div class="product-specs">
                    <div class="spec-item">
                        <span class="spec-label">Size</span>
                        <span class="spec-value">${product.size}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Danh má»¥c</span>
                        <span class="spec-value">${product.category}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Tá»“n kho</span>
                        <span class="spec-value">${product.stock} Ä‘Ã´i</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Tráº¡ng thÃ¡i</span>
                        <span class="spec-value">${product.stock > 0 ? 'CÃ²n hÃ ng' : 'Háº¿t hÃ ng'}</span>
                    </div>
                </div>
                
                <button class="btn-primary btn-full" onclick="addToCart(${product.id}); closeModal('productModal')">
                    THÃŠM VÃ€O GIá»Ž HÃ€NG
                </button>
            </div>
        `;

        openModal('productModal');
    } catch (error) {
        showToast('KhÃ´ng thá»ƒ táº£i thÃ´ng tin sáº£n pháº©m', 'error');
    }
};

const searchProducts = async (keyword) => {
    if (!keyword.trim()) {
        loadAllProducts();
        return;
    }

    const container = document.getElementById('allProducts');
    container.innerHTML = '<div class="loading">Äang tÃ¬m kiáº¿m...</div>';

    try {
        const products = await apiCall(`/products/search?keyword=${encodeURIComponent(keyword)}`);

        if (products.length === 0) {
            container.innerHTML = '<div class="empty-message">KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m nÃ o</div>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card" onclick="showProductDetail(${product.id})">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}" onerror="this.style.display='none'">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                            THÃŠM VÃ€O GIá»Ž
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="empty-message">KhÃ´ng thá»ƒ tÃ¬m kiáº¿m sáº£n pháº©m</div>';
    }
};

// Cart Functions
const loadCart = async () => {
    if (!checkAuth()) return;

    const container = document.getElementById('cartItems');
    container.innerHTML = '<div class="loading">Äang táº£i giá» hÃ ng...</div>';

    try {
        const cartItems = await apiCall('/cart');

        if (!cartItems || cartItems.length === 0) {
            container.innerHTML = `
                <div class="empty-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <h3>Giá» hÃ ng trá»‘ng</h3>
                    <p>HÃ£y thÃªm sáº£n pháº©m vÃ o giá» hÃ ng nhÃ©!</p>
                </div>
            `;
            updateCartBadge(0);
            updateCartSummary(0);
            return;
        }

        container.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.imageUrl || '/assets/default.jpg'}" alt="${item.productName}" onerror="this.style.display='none'">
                </div>
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.productName}</h3>
                    <p class="cart-item-details">GiÃ¡: ${formatCurrency(item.price)}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <span class="cart-item-price">${formatCurrency(item.subtotal)}</span>
                        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">XÃ³a</button>
                    </div>
                </div>
            </div>
        `).join('');

        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        updateCartBadge(cartItems.reduce((sum, item) => sum + item.quantity, 0));
        updateCartSummary(total);
    } catch (error) {
        console.error('Load cart error:', error);
        container.innerHTML = '<div class="empty-message">KhÃ´ng thá»ƒ táº£i giá» hÃ ng</div>';
    }
};

const addToCart = async (productId) => {
    if (!checkAuth()) return;

    try {
        await apiCall('/cart', {
            method: 'POST',
            body: JSON.stringify({
                productId,
                quantity: 1
            })
        });

        showToast('ÄÃ£ thÃªm vÃ o giá» hÃ ng!');

        // Update cart badge immediately
        if (document.getElementById('cartPage').classList.contains('active')) {
            loadCart();
        } else {
            // Just update badge count
            const cartItems = await apiCall('/cart');
            updateCartBadge(cartItems.reduce((sum, item) => sum + item.quantity, 0));
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
};

const updateCartQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) {
        removeFromCart(cartItemId);
        return;
    }

    try {
        await apiCall(`/cart/${cartItemId}?quantity=${quantity}`, {
            method: 'PUT'
        });

        loadCart();
    } catch (error) {
        showToast(error.message, 'error');
    }
};

const removeFromCart = async (cartItemId) => {
    if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a sáº£n pháº©m nÃ y?')) return;

    try {
        await apiCall(`/cart/${cartItemId}`, {
            method: 'DELETE'
        });

        showToast('ÄÃ£ xÃ³a khá»i giá» hÃ ng');
        loadCart();
    } catch (error) {
        showToast(error.message, 'error');
    }
};

const updateCartBadge = (count) => {
    document.getElementById('cartBadge').textContent = count;
};

const updateCartSummary = (total) => {
    document.getElementById('subtotal').textContent = formatCurrency(total);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
};

// Checkout Functions
const openCheckout = () => {
    if (!checkAuth()) return;

    // Pre-fill user info if available
    if (currentUser) {
        document.getElementById('deliveryAddress').value = currentUser.address || '';
        document.getElementById('deliveryPhone').value = currentUser.phone || '';
    }

    openModal('checkoutModal');
};

const processCheckout = async (e) => {
    e.preventDefault();

    const orderData = {
        paymentMethod: document.getElementById('paymentMethod').value,
        deliveryAddress: document.getElementById('deliveryAddress').value,
        deliveryPhone: document.getElementById('deliveryPhone').value,
        notes: document.getElementById('orderNotes').value
    };

    try {
        const order = await apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        closeModal('checkoutModal');
        showToast('Äáº·t hÃ ng thÃ nh cÃ´ng!');

        // Navigate to orders page
        navigateTo('orders');
    } catch (error) {
        showToast(error.message, 'error');
    }
};

// Orders Functions
const loadOrders = async () => {
    if (!checkAuth()) return;

    const container = document.getElementById('ordersList');
    container.innerHTML = '<div class="loading">Äang táº£i Ä‘Æ¡n hÃ ng...</div>';

    try {
        const orders = await apiCall('/orders');

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-message">
                    <h3>ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng nÃ o</h3>
                    <p>HÃ£y Ä‘áº·t hÃ ng ngay nhÃ©!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">ÄÆ¡n hÃ ng #${order.id}</span>
                    <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
                </div>
                <div class="order-items">
                    ${order.orderItems.map(item => `
                        <div class="order-item">
                            <div class="order-item-image"></div>
                            <div class="order-item-info">
                                <div class="order-item-name">${item.productName}</div>
                                <div class="order-item-quantity">Sá»‘ lÆ°á»£ng: ${item.quantity}</div>
                            </div>
                            <div class="order-item-price">${formatCurrency(item.subtotal)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span class="order-total">${formatCurrency(order.totalAmount)}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="empty-message">KhÃ´ng thá»ƒ táº£i Ä‘Æ¡n hÃ ng</div>';
    }
};

const getStatusText = (status) => {
    const statusMap = {
        'PENDING': 'Chá» xá»­ lÃ½',
        'PROCESSING': 'Äang xá»­ lÃ½',
        'SHIPPING': 'Äang giao',
        'DELIVERED': 'ÄÃ£ giao',
        'CANCELLED': 'ÄÃ£ há»§y'
    };
    return statusMap[status] || status;
};

// Chat Functions
const loadChat = async () => {
    if (!checkAuth()) return;

    const container = document.getElementById('chatMessages');
    container.innerHTML = '<div class="loading">Äang táº£i tin nháº¯n...</div>';

    try {
        // Admin ID = 1 (assumption)
        const adminId = 1;

        // If current user is admin, we need to implement a user list
        // For now, just show empty for admin
        if (currentUser.role === 'ADMIN') {
            container.innerHTML = `
                <div class="empty-message">
                    <p>Chá»©c nÄƒng chat admin Ä‘ang Ä‘Æ°á»£c phÃ¡t triá»ƒn</p>
                </div>
            `;
            return;
        }

        const messages = await apiCall(`/chat/history/${adminId}`);

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-message">
                    <p>ChÆ°a cÃ³ tin nháº¯n. HÃ£y báº¯t Ä‘áº§u trÃ² chuyá»‡n!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(msg => {
            const isSent = msg.senderId === currentUser.id;
            return `
                <div class="chat-message ${isSent ? 'sent' : 'received'}">
                    <div class="message-text">${msg.message}</div>
                    <div class="message-time">${new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    } catch (error) {
        container.innerHTML = '<div class="empty-message">KhÃ´ng thá»ƒ táº£i tin nháº¯n</div>';
    }
};

const sendMessage = async () => {
    if (!checkAuth()) return;

    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    try {
        // Send to admin (ID = 1)
        await apiCall('/chat/send', {
            method: 'POST',
            body: JSON.stringify({
                receiverId: 1,
                message
            })
        });

        input.value = '';
        loadChat();
    } catch (error) {
        showToast(error.message, 'error');
    }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

const isAdmin = () => {
    return currentUser && currentUser.role === 'ADMIN';
};

const updateAdminUI = () => {
    if (isAdmin()) {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    } else {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
};

const loadAdminProducts = async () => {
    const tbody = document.getElementById('adminProductsBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Äang táº£i...</td></tr>';

    try {
        const products = await apiCall('/products');

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td><span class="product-category">${product.category}</span></td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.size}</td>
                <td>${product.stock}</td>
                <td>
                    <div class="admin-actions">
                        <button class="btn-edit" onclick="editProduct(${product.id})">Sá»­a</button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">XÃ³a</button>
                    </div>
                </td>
            </tr>
        `).join('');

        document.getElementById('totalProducts').textContent = products.length;
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red">KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u</td></tr>';
    }
};

const loadAdminOrders = async (status = 'ALL') => {
    const tbody = document.getElementById('adminOrdersBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Äang táº£i...</td></tr>';

    try {
        // Admin uses special endpoint to get ALL orders
        const orders = await apiCall('/admin/orders');

        let filteredOrders = orders;
        if (status !== 'ALL') {
            filteredOrders = orders.filter(o => o.status === status);
        }

        tbody.innerHTML = filteredOrders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>User #${order.userId || 'N/A'}</td>
                <td>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>${formatCurrency(order.totalAmount)}</td>
                <td>${order.paymentMethod}</td>
                <td><span class="order-status ${order.status}">${getStatusText(order.status)}</span></td>
                <td>
                    <div class="admin-actions">
                        <button class="btn-update-status" onclick="openUpdateStatusModal(${order.id}, '${order.status}')">
                            Cáº­p nháº­t
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        document.getElementById('totalOrders').textContent = orders.length;

        // Calculate revenue
        const revenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        document.getElementById('totalRevenue').textContent = formatCurrency(revenue);
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red">KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u</td></tr>';
    }
};

const loadAdminStats = async () => {
    // Stats are loaded in loadAdminProducts and loadAdminOrders
    // Add customer count if needed (would need backend endpoint)
    document.getElementById('totalCustomers').textContent = '0';
};

const openAddProductModal = () => {
    document.getElementById('productFormTitle').textContent = 'THÃŠM Sáº¢N PHáº¨M Má»šI';
    document.getElementById('productForm').reset();
    document.getElementById('productFormId').value = '';
    openModal('productFormModal');
};

const editProduct = async (productId) => {
    try {
        const product = await apiCall(`/products/${productId}`);

        document.getElementById('productFormTitle').textContent = 'Sá»¬A Sáº¢N PHáº¨M';
        document.getElementById('productFormId').value = product.id;
        document.getElementById('productFormName').value = product.name;
        document.getElementById('productFormDescription').value = product.description || '';
        document.getElementById('productFormPrice').value = product.price;
        document.getElementById('productFormCategory').value = product.category;
        document.getElementById('productFormSize').value = product.size;
        document.getElementById('productFormStock').value = product.stock;
        document.getElementById('productFormImageUrl').value = product.imageUrl || '';

        openModal('productFormModal');
    } catch (error) {
        showToast('KhÃ´ng thá»ƒ táº£i thÃ´ng tin sáº£n pháº©m', 'error');
    }
};

const deleteProduct = async (productId) => {
    if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a sáº£n pháº©m nÃ y?')) return;

    try {
        await apiCall(`/products/${productId}`, {
            method: 'DELETE'
        });

        showToast('ÄÃ£ xÃ³a sáº£n pháº©m');
        loadAdminProducts();
    } catch (error) {
        showToast(error.message, 'error');
    }
};

const saveProduct = async (e) => {
    e.preventDefault();

    const productId = document.getElementById('productFormId').value;
    const productData = {
        name: document.getElementById('productFormName').value,
        description: document.getElementById('productFormDescription').value,
        price: parseFloat(document.getElementById('productFormPrice').value),
        category: document.getElementById('productFormCategory').value,
        size: document.getElementById('productFormSize').value,
        stock: parseInt(document.getElementById('productFormStock').value),
        imageUrl: document.getElementById('productFormImageUrl').value || '/assets/shoes/default.jpg'
    };

    try {
        if (productId) {
            // Update existing product
            await apiCall(`/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            showToast('ÄÃ£ cáº­p nháº­t sáº£n pháº©m');
        } else {
            // Create new product
            await apiCall('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            showToast('ÄÃ£ thÃªm sáº£n pháº©m má»›i');
        }

        closeModal('productFormModal');
        loadAdminProducts();
    } catch (error) {
        showToast(error.message, 'error');
    }
};

const openUpdateStatusModal = (orderId, currentStatus) => {
    document.getElementById('orderStatusId').value = orderId;
    document.getElementById('orderStatusCode').value = `#${orderId}`;
    document.getElementById('orderStatusValue').value = currentStatus;
    openModal('orderStatusModal');
};

const updateOrderStatus = async (e) => {
    e.preventDefault();

    const orderId = document.getElementById('orderStatusId').value;
    const newStatus = document.getElementById('orderStatusValue').value;

    try {
        await apiCall(`/orders/${orderId}/status?status=${newStatus}`, {
            method: 'PUT'
        });

        showToast('ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng');
        closeModal('orderStatusModal');
        loadAdminOrders();
    } catch (error) {
        showToast(error.message, 'error');
    }
};

const filterAdminOrders = () => {
    const status = document.getElementById('adminOrderFilter').value;
    loadAdminOrders(status);
};

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    // Logo click
    document.querySelector('.nav-brand').addEventListener('click', () => {
        navigateTo('home');
    });

    // Search
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (document.getElementById('productsPage').classList.contains('active')) {
                searchProducts(e.target.value);
            }
        }, 500);
    });

    // User menu
    document.getElementById('userBtn').addEventListener('click', () => {
        const menu = document.getElementById('userMenu');
        if (currentUser) {
            menu.classList.toggle('active');
        } else {
            openModal('authModal');
        }
    });

    // Close user menu on outside click
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('userMenu');
        const btn = document.getElementById('userBtn');
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove('active');
        }
    });

    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}Form`).classList.add('active');
        });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        await login(username, password);
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            username: document.getElementById('registerUsername').value,
            fullName: document.getElementById('registerFullName').value,
            email: document.getElementById('registerEmail').value,
            phone: document.getElementById('registerPhone').value,
            address: document.getElementById('registerAddress').value,
            password: document.getElementById('registerPassword').value
        };
        await register(data);
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadAllProducts(btn.dataset.category);
        });
    });

    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
    document.getElementById('checkoutForm').addEventListener('submit', processCheckout);

    // Chat
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');

            // Load data when switching tabs
            if (tabName === 'products') {
                loadAdminProducts();
            } else if (tabName === 'orders') {
                loadAdminOrders();
            } else if (tabName === 'stats') {
                loadAdminStats();
            }
        });
    });

    // Product form submit
    document.getElementById('productForm').addEventListener('submit', saveProduct);

    // Order status form submit
    document.getElementById('orderStatusForm').addEventListener('submit', updateOrderStatus);

    // Modal close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Initialize UI
    updateUserUI();

    // DON'T auto-load products on page load
    // Only load cart if user is already logged in
    if (currentUser) {
        loadCart();
    }
});

// ============================================
// GLOBAL EXPORTS
// ============================================

// Make functions global for onclick handlers
window.navigateTo = navigateTo;
window.openModal = openModal;
window.closeModal = closeModal;
window.showProductDetail = showProductDetail;
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.openAddProductModal = openAddProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.openUpdateStatusModal = openUpdateStatusModal;
window.filterAdminOrders = filterAdminOrders;