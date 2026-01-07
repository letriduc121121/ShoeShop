package com.bitis.shoeshop.service;

import com.bitis.shoeshop.dto.AddToCartRequest;
import com.bitis.shoeshop.dto.CartItemDto;
import com.bitis.shoeshop.entity.CartItem;
import com.bitis.shoeshop.entity.Product;
import com.bitis.shoeshop.entity.User;
import com.bitis.shoeshop.repository.CartItemRepository;
import com.bitis.shoeshop.repository.ProductRepository;
import com.bitis.shoeshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<CartItemDto> getCartItems(Long userId) {
        System.out.println("📦 Fetching cart for user: " + userId);
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        System.out.println("✅ Found " + cartItems.size() + " items");
        return cartItems.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public CartItemDto addToCart(Long userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId())
                .orElse(new CartItem());

        if (cartItem.getId() == null) {
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            System.out.println("✅ Created new cart item for user " + userId);
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            System.out.println("✅ Updated existing cart item for user " + userId);
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return convertToDto(saved);
    }

    // ✅ FIXED: Now verifies ownership before updating
    @Transactional
    public CartItemDto updateCartItem(Long userId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // ✅ CRITICAL SECURITY CHECK: Verify this cart item belongs to this user
        if (!cartItem.getUser().getId().equals(userId)) {
            System.err.println("❌ SECURITY VIOLATION: User " + userId +
                    " attempted to update cart item " + cartItemId +
                    " belonging to user " + cartItem.getUser().getId());
            throw new RuntimeException("Unauthorized: This cart item does not belong to you");
        }

        if (cartItem.getProduct().getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        cartItem.setQuantity(quantity);
        CartItem updated = cartItemRepository.save(cartItem);
        System.out.println("✅ User " + userId + " updated cart item " + cartItemId);
        return convertToDto(updated);
    }

    // ✅ FIXED: Now verifies ownership before deleting
    @Transactional
    public void removeCartItem(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // ✅ CRITICAL SECURITY CHECK: Verify this cart item belongs to this user
        if (!cartItem.getUser().getId().equals(userId)) {
            System.err.println("❌ SECURITY VIOLATION: User " + userId +
                    " attempted to delete cart item " + cartItemId +
                    " belonging to user " + cartItem.getUser().getId());
            throw new RuntimeException("Unauthorized: This cart item does not belong to you");
        }

        cartItemRepository.delete(cartItem);
        System.out.println("✅ User " + userId + " removed cart item " + cartItemId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
        System.out.println("✅ Cleared cart for user " + userId);
    }

    private CartItemDto convertToDto(CartItem cartItem) {
        BigDecimal subtotal = cartItem.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return new CartItemDto(
                cartItem.getId(),
                cartItem.getProduct().getId(),
                cartItem.getProduct().getName(),
                cartItem.getProduct().getPrice(),
                cartItem.getProduct().getImageUrl(),
                cartItem.getQuantity(),
                subtotal
        );
    }
}