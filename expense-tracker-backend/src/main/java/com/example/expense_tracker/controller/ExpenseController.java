package com.example.expense_tracker.controller;

import com.example.expense_tracker.model.Expense;
import com.example.expense_tracker.model.User;
import com.example.expense_tracker.repository.UserRepository;
import com.example.expense_tracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expense")
public class ExpenseController {
    @Autowired
    private ExpenseService expenseService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public Expense addExpense(@RequestBody Expense expense, @AuthenticationPrincipal User user) {
        expense.setUser(user);
        return expenseService.addExpense(expense);
    }

    @GetMapping("/all")
    public List<Expense> getAllExpenses(@AuthenticationPrincipal User user) {
        return expenseService.getExpensesByUser(user);
    }

    @GetMapping("/total")
    public double getTotalExpense(@AuthenticationPrincipal User user) {
        return expenseService.getTotalExpenseByUser(user);
    }

    @GetMapping("/filter")
    public List<Expense> filterExpenses(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Long categoryId,
            @AuthenticationPrincipal User user) {
        return expenseService.filterExpenses(user, start, end, categoryId);
    }

    @GetMapping("/recurring")
    public List<Expense> getRecurringExpenses(@AuthenticationPrincipal User user) {
        return expenseService.getRecurringExpenses(user);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Expense expense = expenseService.getExpensesByUser(user).stream().filter(e -> e.getId().equals(id)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Expense not found or not authorized"));
        expenseService.deleteExpense(expense);
    }
} 