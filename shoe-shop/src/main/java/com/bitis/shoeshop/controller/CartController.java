package com.bitis.shoeshop.controller;

import com.bitis.shoeshop.dto.AddToCartRequest;
import com.bitis.shoeshop.dto.CartItemDto;
import com.bitis.shoeshop.dto.MessageResponse;
import com.bitis.shoeshop.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.bitis.shoeshop.repository.UserRepository;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping
    public ResponseEntity<List<CartItemDto>> getCart(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        System.out.println("🛒 User " + userId + " fetching cart");
        return ResponseEntity.ok(cartService.getCartItems(userId));
    }

    @PostMapping
    public ResponseEntity<CartItemDto> addToCart(
            @RequestBody AddToCartRequest request,
            Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        System.out.println("➕ User " + userId + " adding product " + request.getProductId());
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    // ✅ FIXED: Now takes Authentication and passes userId to service
    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItemDto> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity,
            Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        System.out.println("🔄 User " + userId + " updating cart item " + cartItemId + " to quantity " + quantity);
        return ResponseEntity.ok(cartService.updateCartItem(userId, cartItemId, quantity));
    }

    // ✅ FIXED: Now takes Authentication and passes userId to service
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<MessageResponse> removeCartItem(
            @PathVariable Long cartItemId,
            Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        System.out.println("🗑️ User " + userId + " removing cart item " + cartItemId);
        cartService.removeCartItem(userId, cartItemId);
        return ResponseEntity.ok(new MessageResponse("Item removed from cart"));
    }

    @DeleteMapping
    public ResponseEntity<MessageResponse> clearCart(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        System.out.println("🧹 User " + userId + " clearing cart");
        cartService.clearCart(userId);
        return ResponseEntity.ok(new MessageResponse("Cart cleared"));
    }
}