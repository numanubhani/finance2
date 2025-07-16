import React, { useState } from "react";
import { Building2, Plus, ArrowRight, CheckCircle2 } from "lucide-react";

type Account = {
  title: string;
  number: string;
  balance: number;
};

type BankData = {
  bankName: string;
  accounts: Account[];
};

type BankAccountSetupProps = {
  onComplete: (banksData: BankData[]) => void;
  onSkip?: () => void;
};

const BankAccountSetup: React.FC<BankAccountSetupProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState<
    "bank-name" | "account-count" | "account-details" | "add-another"
  >("bank-name");
  const [banksData, setBanksData] = useState<BankData[]>([]);
  const [currentBank, setCurrentBank] = useState<BankData>({
    bankName: "",
    accounts: [],
  });
  const [accountCount, setAccountCount] = useState<number>(1);
  const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(0);
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountBalance, setAccountBalance] = useState("");

  const handleBankNameSubmit = () => {
    if (currentBank.bankName.trim()) {
      setCurrentStep("account-count");
    }
  };

  const handleAccountCountSubmit = () => {
    if (accountCount > 0) {
      setCurrentBank((prev) => ({
        ...prev,
        accounts: Array(accountCount)
          .fill(null)
          .map(() => ({ title: "", number: "", balance: 0 })),
      }));
      setCurrentAccountIndex(0);
      setCurrentStep("account-details");
    }
  };

  const handleAccountDetailsSubmit = () => {
    if (accountTitle.trim() && accountNumber.trim() && accountBalance.trim()) {
      const updatedAccounts = [...currentBank.accounts];
      updatedAccounts[currentAccountIndex] = {
        title: accountTitle.trim(),
        number: accountNumber.trim(),
        balance: parseFloat(accountBalance) || 0,
      };

      setCurrentBank((prev) => ({ ...prev, accounts: updatedAccounts }));
      setAccountTitle("");
      setAccountNumber("");
      setAccountBalance("");

      if (currentAccountIndex < accountCount - 1) {
        setCurrentAccountIndex((prev) => prev + 1);
      } else {
        setBanksData((prev) => [
          ...prev,
          { ...currentBank, accounts: updatedAccounts },
        ]);
        setCurrentStep("add-another");
      }
    }
  };

  const handleAddAnotherBank = (addAnother: boolean) => {
    if (addAnother) {
      setCurrentBank({ bankName: "", accounts: [] });
      setAccountCount(1);
      setCurrentAccountIndex(0);
      setAccountTitle("");
      setAccountNumber("");
      setAccountBalance("");
      setCurrentStep("bank-name");
    } else {
      onComplete(banksData);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-all duration-300">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-['DM_Sans'] mb-2">
            Set Up Your Bank Accounts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's connect your banking information to get started
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {banksData.map((_, index) => (
              <CheckCircle2 key={index} className="h-6 w-6 text-green-600" />
            ))}
            <div
              className={`h-6 w-6 rounded-full border-2 ${
                currentStep !== "add-another"
                  ? "border-green-600 bg-green-600"
                  : "border-gray-300 dark:border-gray-600"
              } flex items-center justify-center`}
            >
              {currentStep !== "add-another" && (
                <div className="h-2 w-2 bg-white rounded-full" />
              )}
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {banksData.length > 0
                ? `${banksData.length} bank${banksData.length > 1 ? "s" : ""} added`
                : "Getting started"}
            </p>
          </div>
        </div>

        {/* Setup Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300">
          {currentStep === "bank-name" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Which bank do you have an account with?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the name of your bank
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={currentBank.bankName}
                  onChange={(e) =>
                    setCurrentBank((prev) => ({
                      ...prev,
                      bankName: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => handleKeyPress(e, handleBankNameSubmit)}
                  placeholder="e.g., Meezan Bank, HBL, UBL..."
                  className="w-full p-4 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  autoFocus
                />
              </div>

              <button
                onClick={handleBankNameSubmit}
                disabled={!currentBank.bankName.trim()}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {currentStep === "account-count" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  How many accounts do you have in {currentBank.bankName}?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select the number of accounts
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => setAccountCount(count)}
                    className={`p-4 border-2 rounded-lg text-center font-medium transition-all ${
                      accountCount === count
                        ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-400"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep("bank-name")}
                  className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleAccountCountSubmit}
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === "account-details" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Account {currentAccountIndex + 1} of {accountCount}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the details for this account
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    placeholder="e.g., Savings Account, Current Account"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter your account number"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Balance (Rs.)
                  </label>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    onKeyPress={(e) =>
                      handleKeyPress(e, handleAccountDetailsSubmit)
                    }
                    placeholder="Enter current balance"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (currentAccountIndex > 0) {
                      setCurrentAccountIndex((prev) => prev - 1);
                      const prevAccount =
                        currentBank.accounts[currentAccountIndex - 1];
                      setAccountTitle(prevAccount?.title || "");
                      setAccountNumber(prevAccount?.number || "");
                      setAccountBalance(prevAccount?.balance?.toString() || "");
                    } else {
                      setCurrentStep("account-count");
                    }
                  }}
                  className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleAccountDetailsSubmit}
                  disabled={
                    !accountTitle.trim() ||
                    !accountNumber.trim() ||
                    !accountBalance.trim()
                  }
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>
                    {currentAccountIndex < accountCount - 1
                      ? "Next Account"
                      : "Complete Bank"}
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === "add-another" && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {currentBank.bankName} Added Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Do you have accounts with any other banks?
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleAddAnotherBank(true)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Another Bank</span>
                </button>

                <button
                  onClick={() => handleAddAnotherBank(false)}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              {banksData.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banks Added ({banksData.length})
                  </h3>
                  <div className="space-y-2">
                    {banksData.map((bank, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>{bank.bankName}</span>
                        <span className="text-xs">
                          ({bank.accounts.length} account
                          {bank.accounts.length > 1 ? "s" : ""})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skip Option */}
          {onSkip && (
            <div className="mt-6 text-center">
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccountSetup;
