// src/main/java/com/example/expense_tracker/controller/AuthController.java
package com.example.expense_tracker.controller;

import com.example.expense_tracker.config.JwtUtils;
import com.example.expense_tracker.dto.*;
import com.example.expense_tracker.model.*;
import com.example.expense_tracker.repository.*;
import com.example.expense_tracker.service.AuthService; // Add this import
import com.example.expense_tracker.service.EmailService;
import com.example.expense_tracker.service.TokenBlacklistService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final OtpTokenRepository otpTokenRepository;
    private final AuthService authService; // Add this dependency

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest request) {
        try {
            authService.registerUser(request.getName(), request.getEmail(), request.getPassword());
            return ResponseEntity.ok("User registered successfully. Please check your email to verify.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login attempt for email: " + loginRequest.getEmail());
        
        try {
            // Check if email is verified
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            if (!user.isEmailVerified()) {
                return ResponseEntity.badRequest().body("Please verify your email before logging in.");
            }

            // Authenticate user with username and password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken((UserDetails) authentication.getPrincipal());
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                    .collect(Collectors.toList());
            
            // Generate and send OTP
            System.out.println("Generating OTP for user: " + user.getEmail() + " (ID: " + user.getId() + ")");
            
            String otp = String.format("%06d", new Random().nextInt(999999));
            
            // Delete any existing OTPs for this user
            otpTokenRepository.deleteByUserId(user.getId());
            
            // Save new OTP
            OtpToken otpToken = new OtpToken();
            otpToken.setOtp(otp);
            otpToken.setUser(user);
            otpToken.setExpiryDate(LocalDateTime.now().plusMinutes(5));
            otpTokenRepository.save(otpToken);
            
            // Send OTP via email
            emailService.sendOtpEmail(user.getEmail(), otp);
            
            System.out.println("Login successful for: " + user.getEmail());
            
            // Return JWT but with a flag indicating OTP verification is required
            return ResponseEntity.ok(new AuthResponse(jwt, roles, false));
        } catch (Exception e) {
            System.err.println("Login error for " + loginRequest.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        boolean isVerified = authService.verifyEmail(token);
        if (isVerified) {
            return ResponseEntity.ok("Email verified successfully. You can now log in.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired verification token.");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Invalid or missing token");
        }

        String token = authHeader.substring(7);
        tokenBlacklistService.blacklistToken(token);
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/password-reset-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(email, token);
        return ResponseEntity.ok("Password reset email sent");
    }

    @PostMapping("/password-reset")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestBody String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expired");
        }
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody EmailRequest emailRequest) {
        User user = userRepository.findByEmail(emailRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Delete any existing OTPs for this user
        otpTokenRepository.deleteByUserId(user.getId());
        
        OtpToken otpToken = new OtpToken();
        otpToken.setOtp(otp);
        otpToken.setUser(user);
        otpToken.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        otpTokenRepository.save(otpToken);
        emailService.sendOtpEmail(emailRequest.getEmail(), otp);
        return ResponseEntity.ok("OTP sent to email");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerificationRequest request) {
        try {
            System.out.println("OTP verification request: email=" + request.getEmail() + ", otp=" + request.getOtp());
            
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));
                    
            OtpToken otpToken = otpTokenRepository.findByOtpAndUserId(request.getOtp(), user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid OTP for user: " + request.getEmail()));
    
            if (otpToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                otpTokenRepository.delete(otpToken);
                return ResponseEntity.badRequest().body("OTP expired");
            }
    
            otpTokenRepository.delete(otpToken);
            
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword())
                    .authorities(user.getRoles().stream()
                            .map(role -> "ROLE_" + role.getName())
                            .collect(Collectors.toList())
                            .toArray(new String[0]))
                    .build();
                    
            String jwt = jwtUtils.generateJwtToken(userDetails);
            
            List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            
            System.out.println("OTP verification successful for user: " + request.getEmail());
                    
            return ResponseEntity.ok(new AuthResponse(jwt, roles, true));
        } catch (Exception e) {
            System.err.println("OTP verification error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody EmailRequest emailRequest) {
        try {
            System.out.println("Received password reset request for email: " + emailRequest.getEmail());
            
            User user = userRepository.findByEmail(emailRequest.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("No account found with this email address"));
            
            String otp = String.format("%06d", new Random().nextInt(999999));
            
            otpTokenRepository.deleteByUserId(user.getId());
            
            OtpToken otpToken = new OtpToken();
            otpToken.setOtp(otp);
            otpToken.setUser(user);
            otpToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
            otpTokenRepository.save(otpToken);
            
            emailService.sendOtpEmail(user.getEmail(), otp);
            
            System.out.println("Password reset OTP sent to: " + user.getEmail());
            
            return ResponseEntity.ok("Password reset OTP sent to your email");
        } catch (Exception e) {
            System.err.println("Password reset request error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok("If an account with this email exists, we've sent password reset instructions.");
        }
    }
    
    @PostMapping("/reset-password-with-otp")
    public ResponseEntity<?> resetPasswordWithOtp(@RequestBody PasswordResetWithOtpRequest request) {
        try {
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.badRequest().body("Passwords do not match");
            }
            
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            OtpToken otpToken = otpTokenRepository.findByOtpAndUserId(request.getOtp(), user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid OTP"));
                    
            if (otpToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                otpTokenRepository.delete(otpToken);
                return ResponseEntity.badRequest().body("OTP expired");
            }
            
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            otpTokenRepository.delete(otpToken);
            
            System.out.println("Password reset successful for: " + user.getEmail());
            
            return ResponseEntity.ok("Password reset successful");
        } catch (Exception e) {
            System.err.println("Password reset error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

class AuthResponse {
    private String token;
    private List<String> roles;
    private boolean verified;

    public AuthResponse(String token, List<String> roles, boolean verified) {
        this.token = token;
        this.roles = roles;
        this.verified = verified;
    }

    public String getToken() {
        return token;
    }

    public List<String> getRoles() {
        return roles;
    }
    
    public boolean isVerified() {
        return verified;
    }
}

class PasswordResetWithOtpRequest {
    private String email;
    private String otp;
    private String newPassword;
    private String confirmPassword;
    
    public String getEmail() {
        return email;
    }
    
    public String getOtp() {
        return otp;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public String getConfirmPassword() {
        return confirmPassword;
    }
}

class SignupRequest {
    private String name;
    private String email;
    private String password;

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}