package com.example.expense_tracker.model;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;  // ROLE_USER, ROLE_ADMIN

}
