import React, { useState } from "react";
import {
  Send,
  Brain,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  DollarSign,
} from "lucide-react";
import { useData, Transaction } from "../contexts/DataContext";
import { useToast } from "../contexts/ToastContext";
import { format } from "date-fns";

type TransactionForm = {
  date: string;
  description: string;
  amount: string;
  type: "deposit" | "withdrawal" | "transfer" | "external_transfer";
  bankId: string;
  accountId: string;
  toBankId: string;
  toAccountId: string;
  recipientName: string;
  recipientDetails: string;
};

const TransactionManager: React.FC = () => {
  const {
    banks,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionForm>({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "deposit",
    bankId: "",
    accountId: "",
    toBankId: "",
    toAccountId: "",
    recipientName: "",
    recipientDetails: "",
  });

  // AI functionality
  const [aiInput, setAiInput] = useState("");
  const [interpretation, setInterpretation] = useState<{
    action: string;
    amount: number;
    bank: string;
    account: string;
    description: string;
  } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const parseNaturalLanguage = (text: string) => {
    const lowercaseText = text.toLowerCase();

    // Extract amount
    const amountMatch = text.match(/(\d+)/);
    const amount = amountMatch ? parseInt(amountMatch[1]) : 0;

    // Determine action
    let action = "deposit";
    if (
      lowercaseText.includes("lia hai") ||
      lowercaseText.includes("withdraw") ||
      lowercaseText.includes("nikala")
    ) {
      action = "withdrawal";
    } else if (
      lowercaseText.includes("deposit") ||
      lowercaseText.includes("dala")
    ) {
      action = "deposit";
    } else if (lowercaseText.includes("transfer")) {
      action = "transfer";
    }

    // Extract bank name
    let bankName = "";
    let accountName = "";

    banks.forEach((bank) => {
      if (lowercaseText.includes(bank.name.toLowerCase())) {
        bankName = bank.name;
        // Try to find account name
        bank.accounts.forEach((account) => {
          if (lowercaseText.includes(account.name.toLowerCase())) {
            accountName = account.name;
          }
        });
      }
    });

    const needsMoreInfo = !bankName || !accountName;

    return {
      action,
      amount,
      bank: bankName,
      account: accountName,
      description: text,
      needsConfirmation: needsMoreInfo,
    };
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const parsed = parseNaturalLanguage(aiInput);
    setInterpretation(parsed);
    setNeedsConfirmation(parsed.needsConfirmation);
    setShowConfirmation(true);
  };

  const handleAiConfirm = () => {
    if (!interpretation) return;

    const bank = banks.find((b) => b.name === interpretation.bank);
    const account = bank?.accounts.find(
      (a) => a.name === interpretation.account,
    );

    if (!bank || !account) {
      alert("Please select a valid bank and account");
      return;
    }

    if (editingId) {
      updateTransaction(editingId, {
        date: new Date().toISOString().split("T")[0],
        description: interpretation.description,
        amount:
          interpretation.action === "withdrawal"
            ? -interpretation.amount
            : interpretation.amount,
        type: interpretation.action as "deposit" | "withdrawal" | "transfer",
        bankId: bank.id,
        accountId: account.id,
      });
      setEditingId(null);
    } else {
      addTransaction({
        date: new Date().toISOString().split("T")[0],
        description: interpretation.description,
        amount:
          interpretation.action === "withdrawal"
            ? -interpretation.amount
            : interpretation.amount,
        type: interpretation.action as "deposit" | "withdrawal" | "transfer",
        bankId: bank.id,
        accountId: account.id,
      });
    }

    setAiInput("");
    setInterpretation(null);
    setShowConfirmation(false);
    setNeedsConfirmation(false);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      type: "deposit",
      bankId: "",
      accountId: "",
      toBankId: "",
      toAccountId: "",
      recipientName: "",
      recipientDetails: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.description.trim() ||
      !formData.amount ||
      !formData.bankId ||
      !formData.accountId
    ) {
      showToast("error", "Please fill in all required fields");
      return;
    }

    // Transfer-specific validation
    if (formData.type === "transfer") {
      if (!formData.toBankId || !formData.toAccountId) {
        showToast(
          "error",
          "Please select destination bank and account for transfer",
        );
        return;
      }
      if (
        formData.bankId === formData.toBankId &&
        formData.accountId === formData.toAccountId
      ) {
        showToast(
          "error",
          "Source and destination accounts cannot be the same",
        );
        return;
      }
    }

    // External transfer validation
    if (formData.type === "external_transfer") {
      if (!formData.recipientName.trim()) {
        showToast("error", "Please enter recipient name for external transfer");
        return;
      }
    }

    const amount = parseFloat(formData.amount);
    let finalAmount: number;

    if (formData.type === "withdrawal") {
      finalAmount = -Math.abs(amount);
    } else if (
      formData.type === "transfer" ||
      formData.type === "external_transfer"
    ) {
      finalAmount = Math.abs(amount); // For transfers, amount is always positive
    } else {
      finalAmount = Math.abs(amount); // For deposits
    }

    try {
      const transactionData = {
        date: formData.date,
        description: formData.description,
        amount: finalAmount,
        type: formData.type,
        bankId: formData.bankId,
        accountId: formData.accountId,
        ...(formData.type === "transfer" && {
          toBankId: formData.toBankId,
          toAccountId: formData.toAccountId,
        }),
        ...(formData.type === "external_transfer" && {
          recipientName: formData.recipientName,
          recipientDetails: formData.recipientDetails,
        }),
      };

      if (editingId) {
        updateTransaction(editingId, transactionData);
        showToast("success", "Transaction updated successfully");
      } else {
        addTransaction(transactionData);
        showToast("success", "Transaction added successfully");
      }

      resetForm();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      date: transaction.date,
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.type,
      bankId: transaction.bankId,
      accountId: transaction.accountId,
      toBankId: transaction.toBankId || "",
      toAccountId: transaction.toAccountId || "",
      recipientName: transaction.recipientName || "",
      recipientDetails: transaction.recipientDetails || "",
    });
    setEditingId(transaction.id);
    setShowForm(true);
    setActiveTab("manual");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
    }
  };

  const getBankName = (bankId: string) => {
    return banks.find((b) => b.id === bankId)?.name || "Unknown Bank";
  };

  const getAccountName = (bankId: string, accountId: string) => {
    const bank = banks.find((b) => b.id === bankId);
    return (
      bank?.accounts.find((a) => a.id === accountId)?.name || "Unknown Account"
    );
  };

  const selectedBank = banks.find((b) => b.id === formData.bankId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-['DM_Sans']">
          Transaction Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? "Edit Transaction" : "Add New Transaction"}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === "manual"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === "ai"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Brain className="h-4 w-4" />
              <span>AI Assistant</span>
            </button>
          </div>

          {activeTab === "manual" ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as
                          | "deposit"
                          | "withdrawal"
                          | "transfer",
                      }))
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="transfer">Internal Transfer</option>
                    <option value="external_transfer">External Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter transaction description"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="Enter amount"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank
                  </label>
                  <select
                    value={formData.bankId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bankId: e.target.value,
                        accountId: "",
                      }))
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Bank</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account
                  </label>
                  <select
                    value={formData.accountId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        accountId: e.target.value,
                      }))
                    }
                    disabled={!formData.bankId}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select Account</option>
                    {selectedBank?.accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transfer Destination Fields */}
              {formData.type === "transfer" && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Transfer To
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Destination Bank
                        </label>
                        <select
                          value={formData.toBankId}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              toBankId: e.target.value,
                              toAccountId: "",
                            }))
                          }
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select Destination Bank</option>
                          {banks.map((bank) => (
                            <option key={bank.id} value={bank.id}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Destination Account
                        </label>
                        <select
                          value={formData.toAccountId}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              toAccountId: e.target.value,
                            }))
                          }
                          disabled={!formData.toBankId}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="">Select Destination Account</option>
                          {banks
                            .find((b) => b.id === formData.toBankId)
                            ?.accounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* External Transfer Fields */}
              {formData.type === "external_transfer" && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Transfer To External Recipient
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recipient Name *
                        </label>
                        <input
                          type="text"
                          value={formData.recipientName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              recipientName: e.target.value,
                            }))
                          }
                          placeholder="Enter recipient's name"
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Additional Details (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.recipientDetails}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              recipientDetails: e.target.value,
                            }))
                          }
                          placeholder="e.g., Phone number, account details, purpose"
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>
                    {editingId ? "Update Transaction" : "Add Transaction"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleAiSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Natural Language Input
                  </label>
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Type your transaction in natural language... e.g., 'Meh nay Next Gen sy 2000 lia hai' or 'Deposited 5000 in Meezan Bank Numan account'"
                    className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!aiInput.trim()}
                  className="mt-4 w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  <Send className="h-5 w-5" />
                  <span>Process with AI</span>
                </button>
              </form>

              {/* AI Interpretation */}
              {showConfirmation && interpretation && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI Interpretation
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Action
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {interpretation.action}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Amount
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Rs. {interpretation.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bank
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {interpretation.bank || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Account
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {interpretation.account || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {needsConfirmation && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                          Need more information
                        </p>
                      </div>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                        Please specify the bank and account clearly.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={handleAiConfirm}
                      disabled={needsConfirmation}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No transactions yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Add your first transaction to get started
              </p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === "deposit"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : transaction.type === "withdrawal"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : transaction.type === "external_transfer"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}
                      >
                        {transaction.type === "external_transfer"
                          ? "External Transfer"
                          : transaction.type === "transfer"
                            ? "Internal Transfer"
                            : transaction.type.charAt(0).toUpperCase() +
                              transaction.type.slice(1)}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {transaction.description}
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.type === "external_transfer"
                        ? `From: ${getBankName(transaction.bankId)} • ${getAccountName(transaction.bankId, transaction.accountId)} → To: ${transaction.recipientName}${transaction.recipientDetails ? ` (${transaction.recipientDetails})` : ""}`
                        : `${getBankName(transaction.bankId)} • ${getAccountName(transaction.bankId, transaction.accountId)}`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      className={`font-semibold ${
                        transaction.type === "external_transfer" ||
                        transaction.type === "withdrawal" ||
                        (transaction.type === "transfer" &&
                          transaction.amount > 0)
                          ? "text-red-600 dark:text-red-400"
                          : transaction.amount >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "external_transfer" ||
                      transaction.type === "withdrawal" ||
                      (transaction.type === "transfer" &&
                        transaction.amount > 0)
                        ? "-"
                        : transaction.amount >= 0
                          ? "+"
                          : ""}
                      Rs. {Math.abs(transaction.amount).toLocaleString()}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionManager;
