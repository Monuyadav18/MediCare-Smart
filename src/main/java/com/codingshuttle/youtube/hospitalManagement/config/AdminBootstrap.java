package com.codingshuttle.youtube.hospitalManagement.config;

import com.codingshuttle.youtube.hospitalManagement.entity.User;
import com.codingshuttle.youtube.hospitalManagement.entity.type.AuthProviderType;
import com.codingshuttle.youtube.hospitalManagement.entity.type.RoleType;
import com.codingshuttle.youtube.hospitalManagement.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap.enabled:false}")
    private boolean enabled;

    @Value("${app.admin.bootstrap.username:}")
    private String adminUsername;

    @Value("${app.admin.bootstrap.password:}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {

        if (!enabled) {
            return;
        }

        if (adminUsername == null || adminUsername.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            throw new IllegalStateException(
                    "Admin bootstrap username/password missing"
            );
        }

        if (userRepository.findByUsername(adminUsername).isPresent()) {
            throw new IllegalStateException(
                    "Admin bootstrap username already exists"
            );
        }

        User admin = User.builder()
                .username(adminUsername)
                .password(passwordEncoder.encode(adminPassword))
                .providerType(AuthProviderType.EMAIL)
                .roles(Set.of(RoleType.ADMIN))
                .build();

        userRepository.save(admin);

        System.out.println("Initial admin account created successfully");
    }
}