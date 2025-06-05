package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.DashboardResponse;
import com.example.expense_tracker.model.Budget;
import com.example.expense_tracker.model.Expense;
import com.example.expense_tracker.model.User;
import com.example.expense_tracker.repository.BudgetRepository;
import com.example.expense_tracker.repository.ExpenseRepository;
import com.example.expense_tracker.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final IncomeService incomeService;

    public DashboardResponse getDashboardData(User user) {
        // Validate user
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        // Fetch expenses and budgets for the user
        List<Expense> expenses = expenseRepository.findByUser(user);
        List<Budget> budgets = budgetRepository.findByUser(user);

        // Calculate total expenses
        double totalExpense = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        // Use IncomeService to get total income
        double totalIncome = incomeService.getTotalIncomeByUser(user);
        double balance = totalIncome - totalExpense;

        // Group expenses by category, handling null categories
        Map<String, Double> expensesByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> expense.getCategory() != null ? expense.getCategory().getName() : "Uncategorized",
                        Collectors.summingDouble(Expense::getAmount)
                ));

        // Calculate budget vs. actual spending per category
        Map<String, Double> budgetVsActual = new HashMap<>();
        for (Budget budget : budgets) {
            String categoryName = budget.getCategory() != null ? budget.getCategory().getName() : "Uncategorized";
            double actualSpending = expenses.stream()
                    .filter(expense -> expense.getCategory() != null &&
                            expense.getCategory().getId().equals(budget.getCategory().getId()))
                    .mapToDouble(Expense::getAmount)
                    .sum();
            // Positive: under budget; Negative: over budget
            budgetVsActual.put(categoryName, budget.getAmount() - actualSpending);
        }

        // Return dashboard response with all fields
        return new DashboardResponse(totalIncome, totalExpense, balance, expensesByCategory, budgetVsActual);
    }

    public List<String> getBudgetAlerts(User user) {
        List<String> alerts = new java.util.ArrayList<>();
        List<Expense> expenses = expenseRepository.findByUser(user);
        List<Budget> budgets = budgetRepository.findByUser(user);
        for (Budget budget : budgets) {
            String categoryName = budget.getCategory() != null ? budget.getCategory().getName() : "Uncategorized";
            double actualSpending = expenses.stream()
                    .filter(expense -> expense.getCategory() != null && expense.getCategory().getId().equals(budget.getCategory().getId()))
                    .mapToDouble(Expense::getAmount)
                    .sum();
            double threshold = budget.getAmount() * 0.9; // 90% of budget
            if (actualSpending >= budget.getAmount()) {
                alerts.add("You have exceeded your budget for category '" + categoryName + "'.");
            } else if (actualSpending >= threshold) {
                alerts.add("You are close to exceeding your budget for category '" + categoryName + "'.");
            }
        }
        return alerts;
    }

    public Map<String, Double> getMonthlyExpenseTrends(User user) {
        List<Expense> expenses = expenseRepository.findByUser(user);
        return expenses.stream()
                .filter(e -> e.getDate() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        e -> e.getDate().getYear() + "-" + String.format("%02d", e.getDate().getMonthValue()),
                        java.util.stream.Collectors.summingDouble(Expense::getAmount)
                ));
    }

    public Map<String, Double> getMonthlyIncomeTrends(User user) {
        // You may need to inject IncomeRepository or IncomeService if not already present
        List<com.example.expense_tracker.model.Income> incomes = incomeService.getIncomesByUser(user);
        return incomes.stream()
                .filter(i -> i.getDate() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        i -> i.getDate().getYear() + "-" + String.format("%02d", i.getDate().getMonthValue()),
                        java.util.stream.Collectors.summingDouble(com.example.expense_tracker.model.Income::getAmount)
                ));
    }

    public Map<String, Double> getWeeklyExpenseTrends(User user) {
        List<Expense> expenses = expenseRepository.findByUser(user);
        return expenses.stream()
                .filter(e -> e.getDate() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        e -> {
                            java.time.temporal.WeekFields weekFields = java.time.temporal.WeekFields.ISO;
                            int week = e.getDate().get(weekFields.weekOfWeekBasedYear());
                            int year = e.getDate().getYear();
                            return year + "-W" + String.format("%02d", week);
                        },
                        java.util.stream.Collectors.summingDouble(Expense::getAmount)
                ));
    }

    public Map<String, Double> getWeeklyIncomeTrends(User user) {
        List<com.example.expense_tracker.model.Income> incomes = incomeService.getIncomesByUser(user);
        return incomes.stream()
                .filter(i -> i.getDate() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        i -> {
                            java.time.temporal.WeekFields weekFields = java.time.temporal.WeekFields.ISO;
                            int week = i.getDate().get(weekFields.weekOfWeekBasedYear());
                            int year = i.getDate().getYear();
                            return year + "-W" + String.format("%02d", week);
                        },
                        java.util.stream.Collectors.summingDouble(com.example.expense_tracker.model.Income::getAmount)
                ));
    }

    public Map.Entry<String, Double> getHighestSpendingCategory(User user) {
        List<Expense> expenses = expenseRepository.findByUser(user);
        Map<String, Double> byCategory = expenses.stream()
                .filter(e -> e.getCategory() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        java.util.stream.Collectors.summingDouble(Expense::getAmount)
                ));
        return byCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);
    }

    public Map.Entry<String, Double> getLowestSpendingCategory(User user) {
        List<Expense> expenses = expenseRepository.findByUser(user);
        Map<String, Double> byCategory = expenses.stream()
                .filter(e -> e.getCategory() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        java.util.stream.Collectors.summingDouble(Expense::getAmount)
                ));
        return byCategory.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .orElse(null);
    }

    public double getAverageMonthlyExpense(User user) {
        Map<String, Double> monthly = getMonthlyExpenseTrends(user);
        if (monthly.isEmpty()) return 0.0;
        return monthly.values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    public double getAverageMonthlyIncome(User user) {
        Map<String, Double> monthly = getMonthlyIncomeTrends(user);
        if (monthly.isEmpty()) return 0.0;
        return monthly.values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    public IncomeService getIncomeService() {
        return incomeService;
    }
}