import React, { createContext, useContext, useState } from "react";

export type Bank = {
  id: string;
  name: string;
  accounts: Account[];
};

export type Account = {
  id: string;
  name: string;
  number: string;
  balance: number;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "deposit" | "withdrawal" | "transfer" | "external_transfer";
  bankId: string;
  accountId: string;
  // For internal transfers only
  toBankId?: string;
  toAccountId?: string;
  // For external transfers only
  recipientName?: string;
  recipientDetails?: string;
};

type DataContextType = {
  banks: Bank[];
  transactions: Transaction[];
  addBank: (bank: Omit<Bank, "id">) => void;
  addAccount: (bankId: string, account: Omit<Account, "id">) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateBank: (id: string, updates: Partial<Bank>) => void;
  updateAccount: (
    bankId: string,
    accountId: string,
    updates: Partial<Account>,
  ) => void;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, "id">>,
  ) => void;
  deleteBank: (id: string) => void;
  deleteAccount: (bankId: string, accountId: string) => void;
  deleteTransaction: (id: string) => void;
  setupUserBanks: (
    banksData: {
      bankName: string;
      accounts: { title: string; number: string; balance: number }[];
    }[],
  ) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addBank = (bank: Omit<Bank, "id">) => {
    const newBank = { ...bank, id: Date.now().toString() };
    setBanks((prev) => [...prev, newBank]);
  };

  const addAccount = (bankId: string, account: Omit<Account, "id">) => {
    const newAccount = { ...account, id: Date.now().toString() };
    setBanks((prev) =>
      prev.map((bank) =>
        bank.id === bankId
          ? { ...bank, accounts: [...bank.accounts, newAccount] }
          : bank,
      ),
    );
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };

    if (transaction.type === "transfer") {
      // For transfers, validate that both source and destination are specified
      if (!transaction.toBankId || !transaction.toAccountId) {
        throw new Error("Transfer requires destination bank and account");
      }

      // Find source account to check balance
      const sourceBank = banks.find((b) => b.id === transaction.bankId);
      const sourceAccount = sourceBank?.accounts.find(
        (a) => a.id === transaction.accountId,
      );

      if (!sourceAccount) {
        throw new Error("Source account not found");
      }

      // Check if source account has sufficient balance
      if (sourceAccount.balance < transaction.amount) {
        throw new Error(
          `Insufficient balance in ${sourceBank?.name}. Available: Rs. ${sourceAccount.balance.toLocaleString()}`,
        );
      }

      // Add transaction record
      setTransactions((prev) => [...prev, newTransaction]);

      // Update balances for transfer: subtract from source, add to destination
      setBanks((prev) =>
        prev.map((bank) => {
          if (bank.id === transaction.bankId) {
            // Source bank - subtract amount
            return {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === transaction.accountId
                  ? {
                      ...account,
                      balance: account.balance - transaction.amount,
                    }
                  : account,
              ),
            };
          } else if (bank.id === transaction.toBankId) {
            // Destination bank - add amount
            return {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === transaction.toAccountId
                  ? {
                      ...account,
                      balance: account.balance + transaction.amount,
                    }
                  : account,
              ),
            };
          }
          return bank;
        }),
      );
    } else if (transaction.type === "external_transfer") {
      // For external transfers, validate recipient information
      if (!transaction.recipientName?.trim()) {
        throw new Error("External transfer requires recipient name");
      }

      // Find source account to check balance
      const sourceBank = banks.find((b) => b.id === transaction.bankId);
      const sourceAccount = sourceBank?.accounts.find(
        (a) => a.id === transaction.accountId,
      );

      if (!sourceAccount) {
        throw new Error("Source account not found");
      }

      // Check if source account has sufficient balance
      if (sourceAccount.balance < transaction.amount) {
        throw new Error(
          `Insufficient balance in ${sourceBank?.name}. Available: Rs. ${sourceAccount.balance.toLocaleString()}`,
        );
      }

      // Add transaction record
      setTransactions((prev) => [...prev, newTransaction]);

      // Update balance for external transfer: only subtract from source (recipient is external)
      setBanks((prev) =>
        prev.map((bank) =>
          bank.id === transaction.bankId
            ? {
                ...bank,
                accounts: bank.accounts.map((account) =>
                  account.id === transaction.accountId
                    ? {
                        ...account,
                        balance: account.balance - transaction.amount,
                      }
                    : account,
                ),
              }
            : bank,
        ),
      );
    } else {
      // For deposits and withdrawals, use the existing logic
      setTransactions((prev) => [...prev, newTransaction]);

      setBanks((prev) =>
        prev.map((bank) =>
          bank.id === transaction.bankId
            ? {
                ...bank,
                accounts: bank.accounts.map((account) =>
                  account.id === transaction.accountId
                    ? {
                        ...account,
                        balance: account.balance + transaction.amount,
                      }
                    : account,
                ),
              }
            : bank,
        ),
      );
    }
  };

  const updateTransaction = (
    id: string,
    updates: Partial<Omit<Transaction, "id">>,
  ) => {
    // Find the old transaction to revert its balance effect
    const oldTransaction = transactions.find((t) => t.id === id);
    if (!oldTransaction) return;

    // Revert the old transaction balance effects
    if (oldTransaction.type === "transfer") {
      setBanks((prev) =>
        prev.map((bank) => {
          if (bank.id === oldTransaction.bankId) {
            // Revert source account (add back the amount that was subtracted)
            return {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === oldTransaction.accountId
                  ? {
                      ...account,
                      balance: account.balance + oldTransaction.amount,
                    }
                  : account,
              ),
            };
          } else if (bank.id === oldTransaction.toBankId) {
            // Revert destination account (subtract the amount that was added)
            return {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === oldTransaction.toAccountId
                  ? {
                      ...account,
                      balance: account.balance - oldTransaction.amount,
                    }
                  : account,
              ),
            };
          }
          return bank;
        }),
      );
    } else if (oldTransaction.type === "external_transfer") {
      // Revert external transfer (add back the amount that was subtracted from source)
      setBanks((prev) =>
        prev.map((bank) =>
          bank.id === oldTransaction.bankId
            ? {
                ...bank,
                accounts: bank.accounts.map((account) =>
                  account.id === oldTransaction.accountId
                    ? {
                        ...account,
                        balance: account.balance + oldTransaction.amount,
                      }
                    : account,
                ),
              }
            : bank,
        ),
      );
    } else {
      // Revert normal transaction
      setBanks((prev) =>
        prev.map((bank) =>
          bank.id === oldTransaction.bankId
            ? {
                ...bank,
                accounts: bank.accounts.map((account) =>
                  account.id === oldTransaction.accountId
                    ? {
                        ...account,
                        balance: account.balance - oldTransaction.amount,
                      }
                    : account,
                ),
              }
            : bank,
        ),
      );
    }

    // Update the transaction
    const newTransaction = { ...oldTransaction, ...updates };
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id ? newTransaction : transaction,
      ),
    );

    // Apply the new transaction balance effects
    if (newTransaction.type === "transfer") {
      // Validate transfer requirements
      if (!newTransaction.toBankId || !newTransaction.toAccountId) {
        throw new Error("Transfer requires destination bank and account");
      }

      // Check source account balance
      const sourceBank = banks.find((b) => b.id === newTransaction.bankId);
      const sourceAccount = sourceBank?.accounts.find(
        (a) => a.id === newTransaction.accountId,
      );

      if (sourceAccount && sourceAccount.balance < newTransaction.amount) {
        throw new Error(
          `Insufficient balance in ${sourceBank?.name}. Available: Rs. ${sourceAccount.balance.toLocaleString()}`,
        );
      }

      setBanks((prev) =>
        prev.map((bank) => {
          if (bank.id === newTransaction.bankId) {
            // Source account - subtract amount
            return {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === newTransaction.accountId
                  ? {
                      ...account,
                      balance: account.balance - newTransaction.amount,
                    }
                  : account,
              ),
            };
          } else if (bank.id === newTransaction.toBankId) {
            // Destination account - add amount
            return {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === newTransaction.toAccountId
                  ? {
                      ...account,
                      balance: account.balance + newTransaction.amount,
                    }
                  : account,
              ),
            };
          }
          return bank;
        }),
      );
    } else if (newTransaction.type === "external_transfer") {
      // Validate external transfer requirements
      if (!newTransaction.recipientName?.trim()) {
        throw new Error("External transfer requires recipient name");
      }

      // Check source account balance
      const sourceBank = banks.find((b) => b.id === newTransaction.bankId);
      const sourceAccount = sourceBank?.accounts.find(
        (a) => a.id === newTransaction.accountId,
      );

      if (sourceAccount && sourceAccount.balance < newTransaction.amount) {
        throw new Error(
          `Insufficient balance in ${sourceBank?.name}. Available: Rs. ${sourceAccount.balance.toLocaleString()}`,
        );
      }

      // Apply external transfer: only subtract from source
      setBanks((prev) =>
        prev.map((bank) =>
          bank.id === newTransaction.bankId
            ? {
                ...bank,
                accounts: bank.accounts.map((account) =>
                  account.id === newTransaction.accountId
                    ? {
                        ...account,
                        balance: account.balance - newTransaction.amount,
                      }
                    : account,
                ),
              }
            : bank,
        ),
      );
    } else {
      // Apply normal transaction
      setBanks((prev) =>
        prev.map((bank) =>
          bank.id === newTransaction.bankId
            ? {
                ...bank,
                accounts: bank.accounts.map((account) =>
                  account.id === newTransaction.accountId
                    ? {
                        ...account,
                        balance: account.balance + newTransaction.amount,
                      }
                    : account,
                ),
              }
            : bank,
        ),
      );
    }
  };

  const deleteTransaction = (id: string) => {
    // Find the transaction to revert its balance effect
    const transactionToDelete = transactions.find((t) => t.id === id);
    if (!transactionToDelete) return;

    // Revert the transaction balance effects
    if (transactionToDelete.type === "transfer") {
      setBanks((prev) =>
        prev.map((bank) => {
          if (bank.id === transactionToDelete.bankId) {
            // Revert source account (add back the amount that was subtracted)
            return {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === transactionToDelete.accountId
                  ? {
                      ...account,
                      balance: account.balance + transactionToDelete.amount,
                    }
                  : account,
              ),
            };
          } else if (bank.id === transactionToDelete.toBankId) {
            // Revert destination account (subtract the amount that was added)
            return {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === transactionToDelete.toAccountId
                  ? {
                      ...account,
                      balance: account.balance - transactionToDelete.amount,
                    }
                  : account,
              ),
            };
          }
          return bank;
        }),
      );
    } else if (transactionToDelete.type === "external_transfer") {
      // Revert external transfer (add back the amount that was subtracted from source)
      setBanks((prev) =>
        prev.map((bank) =>
          bank.id === transactionToDelete.bankId
            ? {
                ...bank,
                accounts: bank.accounts.map((account) =>
                  account.id === transactionToDelete.accountId
                    ? {
                        ...account,
                        balance: account.balance + transactionToDelete.amount,
                      }
                    : account,
                ),
              }
            : bank,
        ),
      );
    } else {
      // Revert normal transaction
      setBanks((prev) =>
        prev.map((bank) =>
          bank.id === transactionToDelete.bankId
            ? {
                ...bank,
                accounts: bank.accounts.map((account) =>
                  account.id === transactionToDelete.accountId
                    ? {
                        ...account,
                        balance: account.balance - transactionToDelete.amount,
                      }
                    : account,
                ),
              }
            : bank,
        ),
      );
    }

    // Delete the transaction
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id),
    );
  };

  const updateBank = (id: string, updates: Partial<Bank>) => {
    setBanks((prev) =>
      prev.map((bank) => (bank.id === id ? { ...bank, ...updates } : bank)),
    );
  };

  const updateAccount = (
    bankId: string,
    accountId: string,
    updates: Partial<Account>,
  ) => {
    setBanks((prev) =>
      prev.map((bank) =>
        bank.id === bankId
          ? {
              ...bank,
              accounts: bank.accounts.map((account) =>
                account.id === accountId ? { ...account, ...updates } : account,
              ),
            }
          : bank,
      ),
    );
  };

  const deleteBank = (id: string) => {
    setBanks((prev) => prev.filter((bank) => bank.id !== id));
  };

  const deleteAccount = (bankId: string, accountId: string) => {
    setBanks((prev) =>
      prev.map((bank) =>
        bank.id === bankId
          ? {
              ...bank,
              accounts: bank.accounts.filter(
                (account) => account.id !== accountId,
              ),
            }
          : bank,
      ),
    );
  };

  const setupUserBanks = (
    banksData: {
      bankName: string;
      accounts: { title: string; number: string; balance: number }[];
    }[],
  ) => {
    // Clear existing banks and add new ones from setup
    const newBanks: Bank[] = banksData.map((bankData, bankIndex) => ({
      id: (Date.now() + bankIndex).toString(),
      name: bankData.bankName,
      accounts: bankData.accounts.map((accountData, accountIndex) => ({
        id: (Date.now() + bankIndex * 1000 + accountIndex).toString(),
        name: accountData.title,
        number: accountData.number,
        balance: accountData.balance,
      })),
    }));

    setBanks(newBanks);
  };

  return (
    <DataContext.Provider
      value={{
        banks,
        transactions,
        addBank,
        addAccount,
        addTransaction,
        updateBank,
        updateAccount,
        updateTransaction,
        deleteBank,
        deleteAccount,
        deleteTransaction,
        setupUserBanks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
