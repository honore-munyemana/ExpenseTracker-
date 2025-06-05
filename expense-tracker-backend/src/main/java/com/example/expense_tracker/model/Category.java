package com.example.expense_tracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private Set<Expense> expenses;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private Set<Income> incomes;
}
