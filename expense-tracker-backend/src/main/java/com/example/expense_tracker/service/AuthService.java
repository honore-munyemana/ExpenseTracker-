// src/main/java/com/example/expense_tracker/service/AuthService.java
package com.example.expense_tracker.service;

import com.example.expense_tracker.model.Role;
import com.example.expense_tracker.model.User;
import com.example.expense_tracker.repository.RoleRepository;
import com.example.expense_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public User registerUser(String name, String email, String rawPassword) throws MessagingException {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRoles(Collections.singleton(userRole));
        user.setEmailVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());

        User savedUser = userRepository.save(user);

        sendVerificationEmail(savedUser);

        return savedUser;
    }

    private void sendVerificationEmail(User user) throws MessagingException {
        // Updated port to 5173
        String verificationLink = "http://localhost:5173/verify-email?token=" + user.getVerificationToken();
        String subject = "Verify Your Email - Expense Tracker";
        String content = "<h1>Welcome to Expense Tracker!</h1>" +
                        "<p>Please verify your email by clicking the link below:</p>" +
                        "<a href=\"" + verificationLink + "\">Verify Email</a>" +
                        "<p>This link will expire in 24 hours.</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(user.getEmail());
        helper.setSubject(subject);
        helper.setText(content, true);
        mailSender.send(message);
    }

    public boolean verifyEmail(String token) {
        Optional<User> userOptional = userRepository.findByVerificationToken(token);
        if (userOptional.isEmpty()) {
            return false;
        }
        User user = userOptional.get();
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        return true;
    }
}