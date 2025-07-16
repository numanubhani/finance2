import React, { useState, useEffect } from "react";
import { Moon, Sun, User, Settings, LogOut } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type NavbarProps = {
  onLogout: () => void;
  onNavigate: (page: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({ onLogout, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    onLogout();
  };

  const handleTransfer = () => {
    if (!selectedAccount || !selectedNotification) return;

    // In a real app, you would transfer the amount to the selected account
    toast.success(`Amount transferred to ${selectedAccount}`);
    setShowTransferModal(false);
    setSelectedNotification(null);
    setSelectedAccount("");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between min-h-[64px] py-2">
          {/* Brand */}
          <div className="flex items-center min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gold font-['DM_Sans'] truncate mr-2">
              SmartFinance AI
            </h1>
          </div>

          {/* Welcome Text */}
          <div className="hidden lg:block flex-shrink-0 mx-4">
            <p className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
              Welcome back, {username || "User"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                          !notification.read
                            ? "bg-blue-50 dark:bg-blue-900/10"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.projectName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => {
                                  markAsRead(notification.id);
                                  setSelectedNotification(notification);
                                  setShowTransferModal(true);
                                  setShowNotifications(false);
                                }}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              >
                                Transfer
                              </button>
                            )}
                            <button
                              onClick={() => clearNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 dark:bg-gold rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                  {username || "User"}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button
                    onClick={() => {
                      onNavigate("settings");
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full border dark:border-gold/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Transfer Project Amount
                </h2>
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setSelectedNotification(null);
                    setSelectedAccount("");
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Project:{" "}
                    <span className="font-medium">
                      {selectedNotification.projectName}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedNotification.message}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Account to Transfer Amount
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose an account...</option>
                    {banks.map((bank) =>
                      bank.accounts.map((account) => (
                        <option
                          key={`${bank.id}-${account.id}`}
                          value={`${bank.name} - ${account.name}`}
                        >
                          {bank.name} - {account.name}
                        </option>
                      )),
                    )}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleTransfer}
                    disabled={!selectedAccount}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    Transfer Amount
                  </button>
                  <button
                    onClick={() => {
                      setShowTransferModal(false);
                      setSelectedNotification(null);
                      setSelectedAccount("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
