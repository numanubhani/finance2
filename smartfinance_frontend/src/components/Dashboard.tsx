import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  Eye,
  Edit,
  X,
  Trash2,
} from "lucide-react";
import { useData, Transaction } from "../contexts/DataContext";
import { useToast } from "../contexts/ToastContext";
import { format } from "date-fns";

const Dashboard: React.FC = () => {
  const { banks, transactions, updateTransaction, deleteTransaction } =
    useData();
  const { showToast } = useToast();
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    description: string;
    amount: string;
    date: string;
  }>({ description: "", amount: "", date: "" });

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gold font-['DM_Sans']">
          Dashboard
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Balance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white break-all">
                Rs. {totalBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-gold/20 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-gold" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Income
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 break-all">
                Rs. {totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 break-all">
                Rs. {totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
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
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p
                        className={`font-semibold break-all ${
                          transaction.type === "external_transfer" ||
                          transaction.type === "withdrawal" ||
                          (transaction.type === "transfer" &&
                            transaction.amount > 0)
                            ? "text-red-600 dark:text-red-400"
                            : transaction.amount > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "external_transfer" ||
                        transaction.type === "withdrawal" ||
                        (transaction.type === "transfer" &&
                          transaction.amount > 0)
                          ? "-"
                          : transaction.amount > 0
                            ? "+"
                            : ""}
                        Rs. {Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setEditForm({
                          description: transaction.description,
                          amount: Math.abs(transaction.amount).toString(),
                          date: transaction.date,
                        });
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border dark:border-gold/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Transaction Details
                </h2>
                <button
                  onClick={() => {
                    setSelectedTransaction(null);
                    setIsEditing(false);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white capitalize">
                      {selectedTransaction.type.replace("_", " ")}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {selectedTransaction.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </label>
                    <p
                      className={`mt-1 font-semibold ${
                        selectedTransaction.type === "external_transfer" ||
                        selectedTransaction.type === "withdrawal" ||
                        (selectedTransaction.type === "transfer" &&
                          selectedTransaction.amount > 0)
                          ? "text-red-600 dark:text-red-400"
                          : selectedTransaction.amount > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {selectedTransaction.type === "external_transfer" ||
                      selectedTransaction.type === "withdrawal" ||
                      (selectedTransaction.type === "transfer" &&
                        selectedTransaction.amount > 0)
                        ? "-"
                        : selectedTransaction.amount > 0
                          ? "+"
                          : ""}
                      Rs.{" "}
                      {Math.abs(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date & Time
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {format(
                        new Date(selectedTransaction.date),
                        "MMM dd, yyyy 'at' h:mm a",
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      From Account
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {
                        banks.find((b) => b.id === selectedTransaction.bankId)
                          ?.name
                      }{" "}
                      -{" "}
                      {
                        banks
                          .find((b) => b.id === selectedTransaction.bankId)
                          ?.accounts.find(
                            (a) => a.id === selectedTransaction.accountId,
                          )?.name
                      }
                    </p>
                  </div>

                  {selectedTransaction.type === "transfer" &&
                    selectedTransaction.toBankId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          To Account
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {
                            banks.find(
                              (b) => b.id === selectedTransaction.toBankId,
                            )?.name
                          }{" "}
                          -{" "}
                          {
                            banks
                              .find(
                                (b) => b.id === selectedTransaction.toBankId,
                              )
                              ?.accounts.find(
                                (a) => a.id === selectedTransaction.toAccountId,
                              )?.name
                          }
                        </p>
                      </div>
                    )}

                  {selectedTransaction.type === "external_transfer" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Recipient
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedTransaction.recipientName}
                        {selectedTransaction.recipientDetails && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            ({selectedTransaction.recipientDetails})
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this transaction?",
                          )
                        ) {
                          deleteTransaction(selectedTransaction.id);
                          showToast(
                            "success",
                            "Transaction deleted successfully",
                          );
                          setSelectedTransaction(null);
                          setIsEditing(false);
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTransaction(null);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    try {
                      const amount = parseFloat(editForm.amount);
                      let finalAmount = amount;

                      if (selectedTransaction.type === "withdrawal") {
                        finalAmount = -Math.abs(amount);
                      } else if (
                        selectedTransaction.type === "transfer" ||
                        selectedTransaction.type === "external_transfer"
                      ) {
                        finalAmount = Math.abs(amount);
                      }

                      updateTransaction(selectedTransaction.id, {
                        description: editForm.description,
                        amount: finalAmount,
                        date: editForm.date,
                      });

                      showToast("success", "Transaction updated successfully");
                      setSelectedTransaction(null);
                      setIsEditing(false);
                    } catch (error) {
                      showToast(
                        "error",
                        error instanceof Error
                          ? error.message
                          : "Failed to update transaction",
                      );
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
