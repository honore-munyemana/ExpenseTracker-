package com.example.expense_tracker.repository;

import com.example.expense_tracker.model.Expense;
import com.example.expense_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);

    // Add this method to fix the error
    List<Expense> findByUser(User user);
}
