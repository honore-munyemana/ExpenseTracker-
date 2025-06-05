package com.example.expense_tracker.service;

import com.example.expense_tracker.model.Expense;
import com.example.expense_tracker.model.User;
import com.example.expense_tracker.repository.ExpenseRepository;
import com.example.expense_tracker.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private AuditLogService auditLogService;

    public Expense addExpense(Expense expense) {
        boolean isNew = (expense.getId() == null);
        Expense saved = expenseRepository.save(expense);
        auditLogService.logAction(expense.getUser(), isNew ? "CREATE" : "UPDATE", "EXPENSE", saved.getId(), "Amount: " + saved.getAmount());
        return saved;
    }

    public List<Expense> getExpensesByUser(User user) {
        return expenseRepository.findByUser(user);
    }

    public double getTotalExpenseByUser(User user) {
        return expenseRepository.findByUser(user)
                .stream()
                .mapToDouble(Expense::getAmount)
                .sum();
    }

    public List<Expense> filterExpenses(User user, String start, String end, Long categoryId) {
        List<Expense> expenses = expenseRepository.findByUser(user);
        return expenses.stream()
                .filter(e -> {
                    boolean matches = true;
                    if (start != null && end != null) {
                        java.time.LocalDate startDate = java.time.LocalDate.parse(start);
                        java.time.LocalDate endDate = java.time.LocalDate.parse(end);
                        matches = matches && (e.getDate() != null && !e.getDate().isBefore(startDate) && !e.getDate().isAfter(endDate));
                    }
                    if (categoryId != null) {
                        matches = matches && (e.getCategory() != null && e.getCategory().getId().equals(categoryId));
                    }
                    return matches;
                })
                .toList();
    }

    public List<Expense> getRecurringExpenses(User user) {
        return expenseRepository.findByUser(user).stream()
                .filter(Expense::isRecurring)
                .toList();
    }

    public void deleteExpense(Expense expense) {
        expenseRepository.delete(expense);
        auditLogService.logAction(expense.getUser(), "DELETE", "EXPENSE", expense.getId(), "Amount: " + expense.getAmount());
    }
} 