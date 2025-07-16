import React, { useState } from 'react';
import { Send, Brain, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const AddTransaction: React.FC = () => {
  const { banks, addTransaction } = useData();
  const [input, setInput] = useState('');
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
    let action = 'deposit';
    if (lowercaseText.includes('lia hai') || lowercaseText.includes('withdraw') || lowercaseText.includes('nikala')) {
      action = 'withdrawal';
    } else if (lowercaseText.includes('deposit') || lowercaseText.includes('dala')) {
      action = 'deposit';
    } else if (lowercaseText.includes('transfer')) {
      action = 'transfer';
    }
    
    // Extract bank name
    let bankName = '';
    let accountName = '';
    
    banks.forEach(bank => {
      if (lowercaseText.includes(bank.name.toLowerCase())) {
        bankName = bank.name;
        // Try to find account name
        bank.accounts.forEach(account => {
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
      needsConfirmation: needsMoreInfo
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const parsed = parseNaturalLanguage(input);
    setInterpretation(parsed);
    setNeedsConfirmation(parsed.needsConfirmation);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (!interpretation) return;
    
    const bank = banks.find(b => b.name === interpretation.bank);
    const account = bank?.accounts.find(a => a.name === interpretation.account);
    
    if (!bank || !account) {
      alert('Please select a valid bank and account');
      return;
    }
    
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      description: interpretation.description,
      amount: interpretation.action === 'withdrawal' ? -interpretation.amount : interpretation.amount,
      type: interpretation.action as 'deposit' | 'withdrawal' | 'transfer',
      bankId: bank.id,
      accountId: account.id
    });
    
    setInput('');
    setInterpretation(null);
    setShowConfirmation(false);
    setNeedsConfirmation(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-['DM_Sans']">
          Add Transaction
        </h1>
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <Brain className="h-5 w-5" />
          <span className="text-sm font-medium">AI Powered</span>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Natural Language Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your transaction in natural language... e.g., 'Meh nay Next Gen sy 2000 lia hai' or 'Deposited 5000 in Meezan Bank Numan account'"
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <Send className="h-5 w-5" />
            <span>Add Transaction</span>
          </button>
        </form>
      </div>

      {/* AI Interpretation */}
      {showConfirmation && interpretation && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Interpretation
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Action</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {interpretation.action}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p className="font-medium text-gray-900 dark:text-white">
                Rs. {interpretation.amount.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bank</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {interpretation.bank || 'Not specified'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Account</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {interpretation.account || 'Not specified'}
              </p>
            </div>
          </div>
          
          {needsConfirmation && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Need more information
                </p>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Konse bank se? Konsa account? Please specify the bank and account.
              </p>
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              onClick={handleConfirm}
              disabled={needsConfirmation}
              className="flex-1 sm:flex-none px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              Confirm Transaction
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 sm:flex-none px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTransaction;