package com.zaritalk.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.zaritalk.api", "com.zaritalk.core"})
public class ChecklistApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChecklistApplication.class, args);
    }
}
