package com.example.expense_tracker.service;

import com.example.expense_tracker.model.AuditLog;
import com.example.expense_tracker.model.User;
import com.example.expense_tracker.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(User user, String action, String entityType, Long entityId, String details) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getLogsByUser(User user) {
        return auditLogRepository.findByUser(user);
    }
} 