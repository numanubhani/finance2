import React, { useState } from "react";
import {
  LayoutDashboard,
  Plus,
  Building2,
  BarChart3,
  Settings,
  Menu,
  X,
  Clipboard,
} from "lucide-react";

type SidebarProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  visible: boolean;
  onToggle: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  visible,
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: Plus },
    { id: "banks-accounts", label: "Banks & Accounts", icon: Building2 },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "board", label: "Board", icon: Clipboard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${visible ? "w-64" : "w-16"}`}
      >
        <div className="p-4">
          {/* Sidebar Toggle Button */}
          <div className="hidden lg:flex justify-end mb-4">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              title={visible ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {visible ? (
                <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsOpen(false);
                    if (!visible) onToggle(); // Expand sidebar when clicking icon in collapsed mode
                  }}
                  className={`w-full flex items-center rounded-lg transition-colors group relative ${
                    visible ? "space-x-3 px-4 py-3" : "justify-center px-2 py-3"
                  } ${
                    currentPage === item.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={!visible ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {visible && <span className="font-medium">{item.label}</span>}
                  {/* Tooltip for collapsed state */}
                  {!visible && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
