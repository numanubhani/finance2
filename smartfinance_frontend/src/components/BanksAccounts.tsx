import React, { useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Building2,
  CreditCard,
} from "lucide-react";
import { useData } from "../contexts/DataContext";

const BanksAccounts: React.FC = () => {
  const {
    banks,
    addBank,
    addAccount,
    updateBank,
    updateAccount,
    deleteBank,
    deleteAccount,
  } = useData();
  const [expandedBanks, setExpandedBanks] = useState<Set<string>>(new Set());
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState<string | null>(null);
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<{
    bankId: string;
    accountId: string;
  } | null>(null);
  const [newBankName, setNewBankName] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("");

  const toggleBank = (bankId: string) => {
    const newExpanded = new Set(expandedBanks);
    if (newExpanded.has(bankId)) {
      newExpanded.delete(bankId);
    } else {
      newExpanded.add(bankId);
    }
    setExpandedBanks(newExpanded);
  };

  const handleAddBank = () => {
    if (newBankName.trim()) {
      addBank({ name: newBankName.trim(), accounts: [] });
      setNewBankName("");
      setShowAddBank(false);
    }
  };

  const handleAddAccount = (bankId: string) => {
    if (newAccountName.trim() && newAccountNumber.trim()) {
      addAccount(bankId, {
        name: newAccountName.trim(),
        number: newAccountNumber.trim(),
        balance: parseFloat(newAccountBalance) || 0,
      });
      setNewAccountName("");
      setNewAccountNumber("");
      setNewAccountBalance("");
      setShowAddAccount(null);
    } else {
      alert("Please enter both account title and account number");
    }
  };

  const handleUpdateBank = (bankId: string) => {
    if (newBankName.trim()) {
      updateBank(bankId, { name: newBankName.trim() });
      setEditingBank(null);
      setNewBankName("");
    }
  };

  const handleUpdateAccount = (bankId: string, accountId: string) => {
    if (newAccountName.trim() && newAccountNumber.trim()) {
      updateAccount(bankId, accountId, {
        name: newAccountName.trim(),
        number: newAccountNumber.trim(),
        balance: parseFloat(newAccountBalance) || 0,
      });
      setEditingAccount(null);
      setNewAccountName("");
      setNewAccountNumber("");
      setNewAccountBalance("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-['DM_Sans']">
          Banks & Accounts
        </h1>
        <button
          onClick={() => setShowAddBank(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Bank</span>
        </button>
      </div>

      {/* Add Bank Form */}
      {showAddBank && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add New Bank
          </h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={newBankName}
              onChange={(e) => setNewBankName(e.target.value)}
              placeholder="Bank name"
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleAddBank}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddBank(false)}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Banks List */}
      <div className="space-y-4">
        {banks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  {editingBank === bank.id ? (
                    <input
                      type="text"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="text-lg font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded"
                      onBlur={() => handleUpdateBank(bank.id)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleUpdateBank(bank.id)
                      }
                      autoFocus
                    />
                  ) : (
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {bank.name}
                    </h2>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingBank(bank.id);
                      setNewBankName(bank.name);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteBank(bank.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleBank(bank.id)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {expandedBanks.has(bank.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {expandedBanks.has(bank.id) && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    Accounts ({bank.accounts.length})
                  </h3>
                  <button
                    onClick={() => setShowAddAccount(bank.id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Account</span>
                  </button>
                </div>

                {/* Add Account Form */}
                {showAddAccount === bank.id && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <input
                        type="text"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        placeholder="Account Title"
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={newAccountNumber}
                        onChange={(e) => setNewAccountNumber(e.target.value)}
                        placeholder="Account Number"
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        type="number"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        placeholder="Initial balance"
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddAccount(bank.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddAccount(null)}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Accounts List */}
                <div className="space-y-2">
                  {bank.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                          <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        {editingAccount?.bankId === bank.id &&
                        editingAccount?.accountId === account.id ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newAccountName}
                              onChange={(e) =>
                                setNewAccountName(e.target.value)
                              }
                              placeholder="Account Title"
                              className="bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white px-2 py-1 rounded text-sm"
                              onBlur={() =>
                                handleUpdateAccount(bank.id, account.id)
                              }
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                handleUpdateAccount(bank.id, account.id)
                              }
                            />
                            <input
                              type="text"
                              value={newAccountNumber}
                              onChange={(e) =>
                                setNewAccountNumber(e.target.value)
                              }
                              placeholder="Account Number"
                              className="bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white px-2 py-1 rounded text-sm"
                              onBlur={() =>
                                handleUpdateAccount(bank.id, account.id)
                              }
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                handleUpdateAccount(bank.id, account.id)
                              }
                            />
                            <input
                              type="number"
                              value={newAccountBalance}
                              onChange={(e) =>
                                setNewAccountBalance(e.target.value)
                              }
                              className="bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white px-2 py-1 rounded text-sm w-24"
                              onBlur={() =>
                                handleUpdateAccount(bank.id, account.id)
                              }
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                handleUpdateAccount(bank.id, account.id)
                              }
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {account.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Account: {account.number || "Not specified"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Balance: Rs. {account.balance.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingAccount({
                              bankId: bank.id,
                              accountId: account.id,
                            });
                            setNewAccountName(account.name);
                            setNewAccountNumber(account.number || "");
                            setNewAccountBalance(account.balance.toString());
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAccount(bank.id, account.id)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BanksAccounts;
