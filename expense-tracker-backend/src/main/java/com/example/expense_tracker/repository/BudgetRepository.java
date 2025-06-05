package com.example.expense_tracker.repository;

import com.example.expense_tracker.model.Budget;
import com.example.expense_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
}