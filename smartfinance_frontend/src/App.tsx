import React, { useState, useEffect } from "react";

import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import { ToastProvider } from "./contexts/ToastContext";

import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import FloatingChatAssistant from "./components/FloatingChatAssistant";
import Dashboard from "./components/Dashboard";
import TransactionManager from "./components/TransactionManager";
import BanksAccounts from "./components/BanksAccounts";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Board from "./components/Board";
import BankAccountSetup from "./components/BankAccountSetup";
import BankDataInitializer from "./components/BankDataInitializer";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showBankSetup, setShowBankSetup] = useState(false);
  const [pendingBanksData, setPendingBanksData] = useState<
    | {
        bankName: string;
        accounts: { title: string; number: string; balance: number }[];
      }[]
    | null
  >(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Check for token on load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    setShowBankSetup(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setShowBankSetup(false);
    setCurrentPage("dashboard");
  };

  const handleBankSetupComplete = (
    banksData: {
      bankName: string;
      accounts: { title: string; number: string; balance: number }[];
    }[],
  ) => {
    setPendingBanksData(banksData);
    setShowBankSetup(false);
    setIsAuthenticated(true);
  };

  const handleSkipBankSetup = () => {
    setPendingBanksData(null);
    setShowBankSetup(false);
    setIsAuthenticated(true);
  };

  const handleDataProcessed = () => {
    setPendingBanksData(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <TransactionManager />;
      case "banks-accounts":
        return <BanksAccounts />;
      case "reports":
        return <Reports />;
      case "board":
        return <Board />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <ThemeProvider>
        {showBankSetup ? (
          <BankAccountSetup
            onComplete={handleBankSetupComplete}
            onSkip={handleSkipBankSetup}
          />
        ) : !isAuthenticated ? (
          authMode === "login" ? (
            <Login
              onLogin={handleLogin}
              onSwitchToRegister={() => setAuthMode("register")}
            />
          ) : (
            <Register
              onRegister={handleRegister}
              onSwitchToLogin={() => setAuthMode("login")}
            />
          )
        ) : (
          <DataProvider>
            <BankDataInitializer
              pendingBanksData={pendingBanksData}
              onDataProcessed={handleDataProcessed}
            >
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <Navbar
                  onLogout={handleLogout}
                  onNavigate={setCurrentPage}
                  sidebarVisible={sidebarVisible}
                  onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
                />
                <div className="flex">
                  <Sidebar
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    visible={sidebarVisible}
                    onToggle={() => setSidebarVisible(!sidebarVisible)}
                  />
                  <main
                    className={`flex-1 pt-16 transition-all duration-300 ${sidebarVisible ? "lg:ml-64" : "lg:ml-16"}`}
                  >
                    <div className="p-4 md:p-6 lg:p-8">{renderPage()}</div>
                  </main>
                </div>
                <FloatingChatAssistant />
              </div>
            </BankDataInitializer>
          </DataProvider>
        )}
      </ThemeProvider>
    </ToastProvider>
  );
}

export default App;
