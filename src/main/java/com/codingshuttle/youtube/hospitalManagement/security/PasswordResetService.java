
package com.codingshuttle.youtube.hospitalManagement.security;

import com.codingshuttle.youtube.hospitalManagement.dto.ForgotPasswordRequestDto;
import com.codingshuttle.youtube.hospitalManagement.dto.ResetPasswordRequestDto;
import com.codingshuttle.youtube.hospitalManagement.entity.PasswordResetToken;
import com.codingshuttle.youtube.hospitalManagement.entity.User;
import com.codingshuttle.youtube.hospitalManagement.entity.type.AuthProviderType;
import com.codingshuttle.youtube.hospitalManagement.repository.PasswordResetTokenRepository;
import com.codingshuttle.youtube.hospitalManagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void forgotPassword(ForgotPasswordRequestDto request) {
        User user = userRepository.findByUsername(
                request.email().trim().toLowerCase()
        ).orElse(null);

        // Do not reveal whether an email is registered.
        if (user == null || user.getProviderType() != AuthProviderType.EMAIL) {
            return;
        }

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(hashToken(rawToken))
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(user.getUsername());
        message.setSubject("MediCare - Reset Your Password");
        message.setText(
                "We received a request to reset your MediCare password.\n\n"
                        + "Reset your password using this link:\n"
                        + resetLink
                        + "\n\nThis link expires in 15 minutes.\n"
                        + "If you did not request this, ignore this email."
        );

        mailSender.send(message);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDto request) {
        String tokenHash = hashToken(request.token());

        PasswordResetToken resetToken = tokenRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid or expired reset link."
                        )
                );

        if (resetToken.isUsed()
                || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "Invalid or expired reset link."
            );
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));

        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }


    @Transactional(readOnly = true)
    public String validateResetToken(String rawToken) {

        if (rawToken == null || rawToken.isBlank()) {
            return "INVALID";
        }

        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = tokenRepository
                .findByTokenHash(tokenHash)
                .orElse(null);

        if (resetToken == null) {
            return "INVALID";
        }

        if (resetToken.isUsed()) {
            return "ALREADY_USED";
        }

        if (!resetToken.getExpiresAt().isAfter(LocalDateTime.now())) {
            return "EXPIRED";
        }

        return "VALID";
    }


    private String hashToken(String rawToken) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Token hashing failed", e);
        }
    }
}
