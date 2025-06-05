package com.example.expense_tracker.dto;

import lombok.Data;

@Data
public class PasswordResetWithOtpRequest {
    private String email;
    private String otp;
    private String newPassword;
    private String confirmPassword;
} 