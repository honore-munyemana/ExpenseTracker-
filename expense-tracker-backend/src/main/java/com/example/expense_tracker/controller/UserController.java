package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.DashboardResponse;
import com.example.expense_tracker.dto.ExpenseDTO;
import com.example.expense_tracker.model.Budget;
import com.example.expense_tracker.model.Category;
import com.example.expense_tracker.model.Expense;
import com.example.expense_tracker.model.User;
import com.example.expense_tracker.repository.BudgetRepository;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.ExpenseRepository;
import com.example.expense_tracker.repository.UserRepository;
import com.example.expense_tracker.repository.IncomeRepository;
import com.example.expense_tracker.repository.RoleRepository;
import com.example.expense_tracker.service.DashboardService;
import com.example.expense_tracker.service.UserService;
import com.example.expense_tracker.service.AuditLogService;
import com.example.expense_tracker.model.AuditLog;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final IncomeRepository incomeRepository;
    private final AuditLogService auditLogService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Admin: Add new user
    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUserAsAdmin(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(java.util.Collections.singleton(
            roleRepository.findByName("ROLE_USER").orElseThrow(() -> new RuntimeException("ROLE_USER not found"))
        ));
        user.setEmailVerified(true); // Admin-created users are verified by default
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    // Admin: Edit user
    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserAsAdmin(@PathVariable Long id, @RequestBody User updatedUser) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setCurrency(updatedUser.getCurrency());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    // Admin: Delete user
    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserAsAdmin(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public DashboardResponse getDashboard(@AuthenticationPrincipal User user) {
        return dashboardService.getDashboardData(user);
    }

    @GetMapping("/test")
    public ResponseEntity<String> testUserAccess() {
        return ResponseEntity.ok("You have access to the protected USER endpoint!");
    }

    // Expense CRUD
    @PostMapping("/expenses")
    public ResponseEntity<ExpenseDTO> createExpense(@RequestBody ExpenseDTO expenseDTO) {
        User user = userService.getCurrentUser();
        Category category = categoryRepository.findById(expenseDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + expenseDTO.getCategoryId()));

        Expense expense = new Expense();
        expense.setAmount(expenseDTO.getAmount());
        expense.setUser(user);
        expense.setCategory(category);
        // Set date to today if not provided
        expense.setDate(expenseDTO.getDate() != null ? expenseDTO.getDate() : java.time.LocalDate.now());

        Expense savedExpense = expenseRepository.save(expense);

        ExpenseDTO responseDTO = new ExpenseDTO();
        responseDTO.setId(savedExpense.getId());
        responseDTO.setAmount(savedExpense.getAmount());
        responseDTO.setCategoryId(savedExpense.getCategory().getId());
        responseDTO.setCategoryName(savedExpense.getCategory().getName());
        responseDTO.setDate(savedExpense.getDate());

        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses() {
        User user = userService.getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUser(user);
        List<ExpenseDTO> expenseDTOs = expenses.stream().map(expense -> {
            ExpenseDTO dto = new ExpenseDTO();
            dto.setId(expense.getId());
            dto.setAmount(expense.getAmount());
            dto.setCategoryId(expense.getCategory().getId());
            dto.setCategoryName(expense.getCategory().getName());
            dto.setDate(expense.getDate());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(expenseDTOs);
    }

    @GetMapping("/expenses/{id}")
    public ResponseEntity<ExpenseDTO> getExpenseById(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Expense not found or not authorized"));
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setAmount(expense.getAmount());
        dto.setCategoryId(expense.getCategory().getId());
        dto.setCategoryName(expense.getCategory().getName());
        dto.setDate(expense.getDate());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/expenses/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable Long id, @RequestBody ExpenseDTO expenseDTO) {
        User user = userService.getCurrentUser();
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Expense not found or not authorized"));

        Category category = categoryRepository.findById(expenseDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + expenseDTO.getCategoryId()));

        expense.setAmount(expenseDTO.getAmount());
        expense.setCategory(category);
        // Update date if provided
        if (expenseDTO.getDate() != null) {
            expense.setDate(expenseDTO.getDate());
        }

        Expense updatedExpense = expenseRepository.save(expense);

        ExpenseDTO responseDTO = new ExpenseDTO();
        responseDTO.setId(updatedExpense.getId());
        responseDTO.setAmount(updatedExpense.getAmount());
        responseDTO.setCategoryId(updatedExpense.getCategory().getId());
        responseDTO.setCategoryName(updatedExpense.getCategory().getName());
        responseDTO.setDate(updatedExpense.getDate());

        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Expense not found or not authorized"));
        expenseRepository.delete(expense);
        return ResponseEntity.noContent().build();
    }

    // Category Endpoints
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new IllegalArgumentException("Category already exists: " + category.getName());
        }
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category updatedCategory) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
        category.setName(updatedCategory.getName());
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
        categoryRepository.delete(category);
        return ResponseEntity.noContent().build();
    }

    // Budget CRUD
    @PostMapping("/budgets")
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        User user = userService.getCurrentUser();
        Category category = categoryRepository.findById(budget.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + budget.getCategory().getId()));
        budget.setUser(user);
        budget.setCategory(category);
        return ResponseEntity.ok(budgetRepository.save(budget));
    }

    @GetMapping("/budgets")
    public ResponseEntity<List<Budget>> getBudgets() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(budgetRepository.findByUser(user));
    }

    @PutMapping("/budgets/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        User user = userService.getCurrentUser();
        Budget existingBudget = budgetRepository.findById(id)
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Budget not found or not authorized"));
        Category category = categoryRepository.findById(budget.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + budget.getCategory().getId()));
        existingBudget.setAmount(budget.getAmount());
        existingBudget.setCategory(category);
        existingBudget.setPeriod(budget.getPeriod());
        return ResponseEntity.ok(budgetRepository.save(existingBudget));
    }

    @DeleteMapping("/budgets/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        Budget budget = budgetRepository.findById(id)
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Budget not found or not authorized"));
        budgetRepository.delete(budget);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> globalSearch(@RequestParam String query) {
        User user = userService.getCurrentUser();
        String q = query.toLowerCase();
        List<Map<String, Object>> results = new ArrayList<>();

        // Debug log
        System.out.println("Search query: " + q);
        System.out.println("User ID: " + user.getId());

        // Expenses
        List<Expense> userExpenses = expenseRepository.findByUser(user);
        System.out.println("Total user expenses: " + userExpenses.size());
        
        userExpenses.stream()
            .filter(e -> {
                boolean matches = false;
                // Check description
                if (e.getDescription() != null && e.getDescription().toLowerCase().contains(q)) {
                    matches = true;
                }
                // Check category name
                if (e.getCategory() != null && e.getCategory().getName().toLowerCase().contains(q)) {
                    matches = true;
                }
                // Check amount as string
                if (String.valueOf(e.getAmount()).contains(q)) {
                    matches = true;
                }
                // Check date
                if (e.getDate() != null && e.getDate().toString().contains(q)) {
                    matches = true;
                }
                return matches;
            })
            .forEach(e -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", e.getId());
                map.put("type", "Expense");
                map.put("amount", e.getAmount());
                map.put("description", e.getDescription());
                map.put("categoryName", e.getCategory() != null ? e.getCategory().getName() : null);
                map.put("categoryId", e.getCategory() != null ? e.getCategory().getId() : null);
                map.put("date", e.getDate() != null ? e.getDate().toString() : null);
                map.put("recurring", e.isRecurring());
                results.add(map);
            });

        // Incomes
        List<com.example.expense_tracker.model.Income> userIncomes = incomeRepository.findByUser(user);
        System.out.println("Total user incomes: " + userIncomes.size());
        
        userIncomes.stream()
            .filter(i -> {
                boolean matches = false;
                // Check description
                if (i.getDescription() != null && i.getDescription().toLowerCase().contains(q)) {
                    matches = true;
                }
                // Check category name
                if (i.getCategory() != null && i.getCategory().getName().toLowerCase().contains(q)) {
                    matches = true;
                }
                // Check amount as string
                if (String.valueOf(i.getAmount()).contains(q)) {
                    matches = true;
                }
                // Check date
                if (i.getDate() != null && i.getDate().toString().contains(q)) {
                    matches = true;
                }
                return matches;
            })
            .forEach(i -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", i.getId());
                map.put("type", "Income");
                map.put("amount", i.getAmount());
                map.put("description", i.getDescription());
                map.put("categoryName", i.getCategory() != null ? i.getCategory().getName() : null);
                map.put("categoryId", i.getCategory() != null ? i.getCategory().getId() : null);
                map.put("date", i.getDate() != null ? i.getDate().toString() : null);
                map.put("recurring", i.isRecurring());
                results.add(map);
            });

        // Budgets
        List<Budget> userBudgets = budgetRepository.findByUser(user);
        System.out.println("Total user budgets: " + userBudgets.size());
        
        userBudgets.stream()
            .filter(b -> {
                boolean matches = false;
                // Check category name
                if (b.getCategory() != null && b.getCategory().getName().toLowerCase().contains(q)) {
                    matches = true;
                }
                // Check amount as string
                if (String.valueOf(b.getAmount()).contains(q)) {
                    matches = true;
                }
                // Check period
                if (b.getPeriod() != null && b.getPeriod().toLowerCase().contains(q)) {
                    matches = true;
                }
                return matches;
            })
            .forEach(b -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", b.getId());
                map.put("type", "Budget");
                map.put("amount", b.getAmount());
                map.put("categoryName", b.getCategory() != null ? b.getCategory().getName() : null);
                map.put("categoryId", b.getCategory() != null ? b.getCategory().getId() : null);
                map.put("period", b.getPeriod());
                map.put("description", null);
                map.put("date", null);
                results.add(map);
            });

        System.out.println("Total search results: " + results.size());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/budget-alerts")
    public List<String> getBudgetAlerts(@AuthenticationPrincipal User user) {
        return dashboardService.getBudgetAlerts(user);
    }

    @GetMapping("/analytics/monthly-expense")
    public Map<String, Double> getMonthlyExpenseTrends(@AuthenticationPrincipal User user) {
        return dashboardService.getMonthlyExpenseTrends(user);
    }

    @GetMapping("/analytics/monthly-income")
    public Map<String, Double> getMonthlyIncomeTrends(@AuthenticationPrincipal User user) {
        return dashboardService.getMonthlyIncomeTrends(user);
    }

    @GetMapping("/analytics/weekly-expense")
    public Map<String, Double> getWeeklyExpenseTrends(@AuthenticationPrincipal User user) {
        return dashboardService.getWeeklyExpenseTrends(user);
    }

    @GetMapping("/analytics/weekly-income")
    public Map<String, Double> getWeeklyIncomeTrends(@AuthenticationPrincipal User user) {
        return dashboardService.getWeeklyIncomeTrends(user);
    }

    @GetMapping("/analytics/highest-category")
    public Map.Entry<String, Double> getHighestSpendingCategory(@AuthenticationPrincipal User user) {
        return dashboardService.getHighestSpendingCategory(user);
    }

    @GetMapping("/analytics/lowest-category")
    public Map.Entry<String, Double> getLowestSpendingCategory(@AuthenticationPrincipal User user) {
        return dashboardService.getLowestSpendingCategory(user);
    }

    @GetMapping("/analytics/average-monthly-expense")
    public double getAverageMonthlyExpense(@AuthenticationPrincipal User user) {
        return dashboardService.getAverageMonthlyExpense(user);
    }

    @GetMapping("/analytics/average-monthly-income")
    public double getAverageMonthlyIncome(@AuthenticationPrincipal User user) {
        return dashboardService.getAverageMonthlyIncome(user);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(@AuthenticationPrincipal User user) {
        List<Expense> expenses = expenseRepository.findByUser(user);
        List<com.example.expense_tracker.model.Income> incomes = dashboardService.getIncomeService().getIncomesByUser(user);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);
        // Write expenses
        writer.println("Type,ID,Amount,Description,Date,Category,Recurring");
        for (Expense e : expenses) {
            writer.printf("Expense,%d,%.2f,%s,%s,%s,%s\n",
                    e.getId(), e.getAmount(),
                    e.getDescription() != null ? e.getDescription().replace(",", " ") : "",
                    e.getDate() != null ? e.getDate().toString() : "",
                    e.getCategory() != null ? e.getCategory().getName() : "",
                    e.isRecurring() ? "Yes" : "No");
        }
        // Write incomes
        for (com.example.expense_tracker.model.Income i : incomes) {
            writer.printf("Income,%d,%.2f,%s,%s,%s,%s\n",
                    i.getId(), i.getAmount(),
                    i.getDescription() != null ? i.getDescription().replace(",", " ") : "",
                    i.getDate() != null ? i.getDate().toString() : "",
                    i.getCategory() != null ? i.getCategory().getName() : "",
                    i.isRecurring() ? "Yes" : "No");
        }
        writer.flush();
        byte[] csvBytes = out.toByteArray();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses_incomes.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping("/currency")
    public ResponseEntity<String> getCurrency(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user.getCurrency());
    }

    @PutMapping("/currency")
    public ResponseEntity<String> updateCurrency(@AuthenticationPrincipal User user, @RequestBody String currency) {
        user.setCurrency(currency.replaceAll("\"", "")); // Remove quotes if sent as JSON string
        userRepository.save(user);
        return ResponseEntity.ok(user.getCurrency());
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal User user, @RequestBody User updatedUser) {
        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/audit-log")
    public List<AuditLog> getAuditLog(@AuthenticationPrincipal User user) {
        return auditLogService.getLogsByUser(user);
    }
}