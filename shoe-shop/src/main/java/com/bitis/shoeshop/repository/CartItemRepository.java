package com.bitis.shoeshop.repository;

import com.bitis.shoeshop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * ✅ Find all cart items for a SPECIFIC user
     * CRITICAL: Must filter by userId to separate carts!
     */
    List<CartItem> findByUserId(Long userId);

    /**
     * ✅ Find specific product in SPECIFIC user's cart
     */
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    /**
     * ✅ Delete all cart items for SPECIFIC user
     */
    void deleteByUserId(Long userId);

    /**
     * ✅ Count items in SPECIFIC user's cart
     */
    long countByUserId(Long userId);
}