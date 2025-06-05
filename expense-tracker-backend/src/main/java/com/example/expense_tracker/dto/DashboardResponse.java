package com.example.expense_tracker.dto;

import lombok.Data;
import java.util.Map;

@Data
public class DashboardResponse {
    private Double totalIncome;
    private Double totalExpense;
    private Double balance;
    private Map<String, Double> expensesByCategory;
    private Map<String, Double> budgetVsActual;

    public DashboardResponse(Double totalIncome, Double totalExpense, Double balance, Map<String, Double> expensesByCategory, Map<String, Double> budgetVsActual) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.balance = balance;
        this.expensesByCategory = expensesByCategory;
        this.budgetVsActual = budgetVsActual;
    }
}