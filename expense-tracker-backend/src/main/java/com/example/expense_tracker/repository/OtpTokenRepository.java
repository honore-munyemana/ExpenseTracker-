package com.example.expense_tracker.repository;

import com.example.expense_tracker.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByOtp(String otp);
    
    Optional<OtpToken> findByOtpAndUserId(String otp, Long userId);
    
    @Transactional
    void deleteByUserId(Long userId);
}