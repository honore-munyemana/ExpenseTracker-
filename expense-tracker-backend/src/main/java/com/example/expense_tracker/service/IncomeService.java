package com.example.expense_tracker.service;

import com.example.expense_tracker.model.Income;
import com.example.expense_tracker.model.User;
import com.example.expense_tracker.repository.IncomeRepository;
import com.example.expense_tracker.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeService {
    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private AuditLogService auditLogService;

    public Income addIncome(Income income) {
        boolean isNew = (income.getId() == null);
        Income saved = incomeRepository.save(income);
        auditLogService.logAction(income.getUser(), isNew ? "CREATE" : "UPDATE", "INCOME", saved.getId(), "Amount: " + saved.getAmount());
        return saved;
    }

    public List<Income> getIncomesByUser(User user) {
        return incomeRepository.findByUser(user);
    }

    public double getTotalIncomeByUser(User user) {
        return incomeRepository.findByUser(user)
                .stream()
                .mapToDouble(Income::getAmount)
                .sum();
    }

    public Income getIncomeById(Long id) {
        return incomeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Income not found with ID: " + id));
    }

    public void deleteIncome(Long id) {
        Income income = getIncomeById(id);
        incomeRepository.deleteById(id);
        auditLogService.logAction(income.getUser(), "DELETE", "INCOME", income.getId(), "Amount: " + income.getAmount());
    }

    public List<Income> filterIncomes(User user, String start, String end, Long categoryId) {
        List<Income> incomes = incomeRepository.findByUser(user);
        return incomes.stream()
                .filter(i -> {
                    boolean matches = true;
                    if (start != null && end != null) {
                        java.time.LocalDate startDate = java.time.LocalDate.parse(start);
                        java.time.LocalDate endDate = java.time.LocalDate.parse(end);
                        matches = matches && (i.getDate() != null && !i.getDate().isBefore(startDate) && !i.getDate().isAfter(endDate));
                    }
                    if (categoryId != null) {
                        matches = matches && (i.getCategory() != null && i.getCategory().getId().equals(categoryId));
                    }
                    return matches;
                })
                .toList();
    }

    public List<Income> getRecurringIncomes(User user) {
        return incomeRepository.findByUser(user).stream()
                .filter(Income::isRecurring)
                .toList();
    }
} 