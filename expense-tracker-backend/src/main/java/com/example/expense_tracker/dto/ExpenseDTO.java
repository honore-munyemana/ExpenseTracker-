package com.example.expense_tracker.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ExpenseDTO {
    private Long id;
    private Double amount;
    private Long categoryId;
    private String categoryName;
    private LocalDate date;
}