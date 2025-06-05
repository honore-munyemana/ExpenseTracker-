package com.example.expense_tracker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String token) {
        System.out.println("Sending password reset email to: " + to);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom("honoremushya@gmail.com"); // Set the from address explicitly
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, click the link: http://localhost:3000/reset-password?token=" + token);
        try {
            mailSender.send(message);
            System.out.println("Password reset email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendOtpEmail(String to, String otp) {
        System.out.println("Preparing to send OTP email to: " + to);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom("honoremushya@gmail.com"); // Set the from address explicitly
        message.setSubject("Your Password Reset Code");
        message.setText("Your verification code is: " + otp + "\n\nThis code is valid for 15 minutes. If you didn't request a password reset, please ignore this email.");
        
        try {
            System.out.println("About to send email with JavaMailSender...");
            mailSender.send(message);
            System.out.println("OTP email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}