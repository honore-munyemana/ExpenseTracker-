import React, { createContext, useState } from 'react';

const BudgetContext = createContext();

const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);

  return (
    <BudgetContext.Provider value={{ budgets, setBudgets }}>
      {children}
    </BudgetContext.Provider>
  );
};

export { BudgetContext, BudgetProvider };