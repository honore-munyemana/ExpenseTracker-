package com.example.expense_tracker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String action; // CREATE, UPDATE, DELETE
    private String entityType; // EXPENSE, INCOME
    private Long entityId;
    private LocalDateTime timestamp;
    private String details;
} 