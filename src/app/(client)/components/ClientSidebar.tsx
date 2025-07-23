"use client";

import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import Image from "next/image";

// Navigation item interface
interface NavItem {
  icon: React.ReactNode;
  name: string;
  path: string;
}

// Client navigation items
const clientNavItems: NavItem[] = [
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    name: "My Bookings",
    path: "/bookings",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
      </svg>
    ),
    name: "Payments",
    path: "/payments",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    ),
    name: "Account",
    path: "/account",
  },
];

const ClientSidebar: React.FC = () => {
  const { isExpanded, isHovered, setIsHovered, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();

  const sidebarWidth = isExpanded || isHovered ? "w-[290px]" : "w-[90px]";
  const isItemTextVisible = isExpanded || isHovered;

  const handleMouseEnter = () => {
    if (!isExpanded) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleLinkClick = () => {
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out lg:block ${sidebarWidth}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800 px-4">
            <Link href="/dashboard" className="flex items-center">
              {isItemTextVisible ? (
                <Image
                  width={120}
                  height={30}
                  className="dark:hidden"
                  src="/images/logo/logo.png"
                  alt="Logo"
                />
              ) : (
                <Image
                  width={32}
                  height={32}
                  className="dark:hidden"
                  src="/images/logo/logo-icon.svg"
                  alt="Logo"
                />
              )}
              {isItemTextVisible ? (
                <Image
                  width={120}
                  height={30}
                  className="hidden dark:block"
                  src="/images/logo/logo.png"
                  alt="Logo"
                />
              ) : (
                <Image
                  width={32}
                  height={32}
                  className="hidden dark:block"
                  src="/images/logo/logo-icon.svg"
                  alt="Logo"
                />
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {clientNavItems.map((item) => {
              const isActive = pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? "text-blue-700 dark:text-blue-400" : ""}`}>
                    {item.icon}
                  </span>
                  {isItemTextVisible && (
                    <span className="ml-3 transition-opacity duration-200">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info Section */}
          {isItemTextVisible && (
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    JD
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    John Doe
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Client
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          isMobileOpen ? "block" : "hidden"
        }`}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={toggleMobileSidebar}
        />
        
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl">
          <div className="flex h-full flex-col">
            {/* Logo Section */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  width={120}
                  height={30}
                  className="dark:hidden"
                  src="/images/logo/logo.png"
                  alt="Logo"
                />
                <Image
                  width={120}
                  height={30}
                  className="hidden dark:block"
                  src="/images/logo/logo.png"
                  alt="Logo"
                />
              </Link>
              <button
                onClick={toggleMobileSidebar}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {clientNavItems.map((item) => {
                const isActive = pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? "text-blue-700 dark:text-blue-400" : ""}`}>
                      {item.icon}
                    </span>
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info Section */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    JD
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    John Doe
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Client Account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default ClientSidebar; 