package com.example.expense_tracker.service;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
public class TokenBlacklistService {

    // Thread-safe Set to store blacklisted tokens
    private final Set<String> blacklistedTokens = Collections.synchronizedSet(new HashSet<>());

    /**
     * Adds a token to the blacklist.
     * @param token The JWT token to blacklist
     */
    public void blacklistToken(String token) {
        blacklistedTokens.add(token);
    }

    /**
     * Checks if a token is blacklisted.
     * @param token The JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    /**
     * Removes a token from the blacklist (optional, e.g., for cleanup).
     * @param token The JWT token to remove
     */
    public void removeToken(String token) {
        blacklistedTokens.remove(token);
    }

    /**
     * Clears all blacklisted tokens (optional, e.g., for testing or maintenance).
     */
    public void clearBlacklist() {
        blacklistedTokens.clear();
    }
}