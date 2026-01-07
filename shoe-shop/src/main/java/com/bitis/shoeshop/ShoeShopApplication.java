package com.bitis.shoeshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShoeShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShoeShopApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🚀 Bitis Shoe Shop Application Started!");
        System.out.println("📍 Server: http://localhost:8080");
        System.out.println("📚 API Docs: http://localhost:8080/api");
        System.out.println("=================================================");
        System.out.println("👤 Default Accounts:");
        System.out.println("   Admin - username: admin, password: 123456");
        System.out.println("   User  - username: user1, password: 123456");
        System.out.println("=================================================");
    }
}