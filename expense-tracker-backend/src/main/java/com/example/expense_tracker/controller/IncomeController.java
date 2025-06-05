package com.example.expense_tracker.controller;

import com.example.expense_tracker.model.Income;
import com.example.expense_tracker.model.User;
import com.example.expense_tracker.repository.UserRepository;
import com.example.expense_tracker.service.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/income")
public class IncomeController {
    @Autowired
    private IncomeService incomeService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public Income addIncome(@RequestBody Income income, @AuthenticationPrincipal User user) {
        income.setUser(user);
        return incomeService.addIncome(income);
    }

    @GetMapping("/all")
    public List<Income> getAllIncomes(@AuthenticationPrincipal User user) {
        return incomeService.getIncomesByUser(user);
    }

    @GetMapping("/total")
    public double getTotalIncome(@AuthenticationPrincipal User user) {
        return incomeService.getTotalIncomeByUser(user);
    }

    @GetMapping("/{id}")
    public Income getIncomeById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Income income = incomeService.getIncomeById(id);
        if (!income.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Income not found or not authorized");
        }
        return income;
    }

    @PutMapping("/{id}")
    public Income updateIncome(@PathVariable Long id, @RequestBody Income updatedIncome, @AuthenticationPrincipal User user) {
        Income income = incomeService.getIncomeById(id);
        if (!income.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Income not found or not authorized");
        }
        income.setAmount(updatedIncome.getAmount());
        income.setDescription(updatedIncome.getDescription());
        income.setDate(updatedIncome.getDate());
        income.setCategory(updatedIncome.getCategory());
        return incomeService.addIncome(income);
    }

    @DeleteMapping("/{id}")
    public void deleteIncome(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Income income = incomeService.getIncomeById(id);
        if (!income.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Income not found or not authorized");
        }
        incomeService.deleteIncome(id);
    }

    @GetMapping("/filter")
    public List<Income> filterIncomes(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Long categoryId,
            @AuthenticationPrincipal User user) {
        return incomeService.filterIncomes(user, start, end, categoryId);
    }

    @GetMapping("/recurring")
    public List<Income> getRecurringIncomes(@AuthenticationPrincipal User user) {
        return incomeService.getRecurringIncomes(user);
    }
} 