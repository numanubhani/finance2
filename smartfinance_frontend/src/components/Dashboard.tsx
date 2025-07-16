import React from "react";
import { TrendingUp, TrendingDown, CreditCard, DollarSign } from "lucide-react";
import { useData } from "../contexts/DataContext";

const Dashboard: React.FC = () => {
  const { banks, transactions } = useData();

  const totalBalance = banks.reduce(
    (sum, bank) =>
      sum + bank.accounts.reduce((acc, account) => acc + account.balance, 0),
    0,
  );

  const totalIncome = transactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "withdrawal" || t.type === "external_transfer")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-['DM_Sans']">
          Dashboard
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Balance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                Rs. {totalBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Income
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Rs. {totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                Rs. {totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Accounts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {banks.reduce((sum, bank) => sum + bank.accounts.length, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentTransactions.map((transaction) => {
              const bank = banks.find((b) => b.id === transaction.bankId);
              const account = bank?.accounts.find(
                (a) => a.id === transaction.accountId,
              );

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "deposit"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : transaction.type === "withdrawal"
                            ? "bg-red-100 dark:bg-red-900/20"
                            : "bg-blue-100 dark:bg-blue-900/20"
                      }`}
                    >
                      {transaction.type === "deposit" ? (
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : transaction.type === "withdrawal" ? (
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {bank?.name} - {account?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}Rs.{" "}
                      {Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
