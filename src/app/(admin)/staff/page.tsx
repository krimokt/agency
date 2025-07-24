"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useTranslation } from "@/hooks/useTranslation";

// Define types
interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
  joinDate: string;
  status: 'Active' | 'Pending';
  salary: number;
}

const StaffPage = () => {
  const { t } = useTranslation();
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: 'Employee',
  });

  // Sample staff data
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@agency.com',
      role: 'Manager',
      joinDate: '2023-07-01',
      status: 'Active',
      salary: 12000,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@agency.com',
      role: 'Admin',
      joinDate: '2023-05-15',
      status: 'Active',
      salary: 15000,
    },
    {
      id: '3',
      name: 'Ahmed Hassan',
      email: 'ahmed@agency.com',
      role: 'Employee',
      joinDate: '2023-08-10',
      status: 'Active',
      salary: 8000,
    },
    {
      id: '4',
      name: 'Maria Garcia',
      email: 'maria@agency.com',
      role: 'Employee',
      joinDate: '2023-09-22',
      status: 'Pending',
      salary: 8000,
    },
    {
      id: '5',
      name: 'Youssef Alami',
      email: 'youssef@agency.com',
      role: 'Manager',
      joinDate: '2023-06-15',
      status: 'Active',
      salary: 12000,
    },
  ]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new staff member
    const newStaffMember: StaffMember = {
      id: Date.now().toString(),
      name: formData.email.split('@')[0], // Temporary name from email
      email: formData.email,
      role: formData.role as StaffMember['role'],
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      salary: formData.role === 'Admin' ? 15000 : formData.role === 'Manager' ? 12000 : 8000,
    };
    
    // Add to staff members array
    setStaffMembers([newStaffMember, ...staffMembers]);
    
    // Reset form and close modal
    setFormData({
      email: '',
      role: 'Employee',
    });
    setIsModalOpen(false);
    
    // Show success message (in a real app, this would send an email)
    alert(`${t("staff.invitationSent")} ${formData.email}`);
  };

  // Handle remove staff member
  const handleRemoveStaff = (id: string) => {
    if (confirm(t("staff.removeConfirmation"))) {
      setStaffMembers(staffMembers.filter(staff => staff.id !== id));
    }
  };

  // Filter staff members
  const filteredStaff = staffMembers.filter(staff => {
    // Search term filter
    const searchMatch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Role filter
    const roleMatch = roleFilter ? staff.role === roleFilter : true;
    
    // Status filter
    const statusMatch = statusFilter ? staff.status === statusFilter : true;
    
    return searchMatch && roleMatch && statusMatch;
  });

  // Calculate total salary
  const totalSalary = staffMembers.reduce((total, staff) => total + staff.salary, 0);

  return (
    <>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t("staff.title")}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("staff.subtitle")}
              </p>
            </div>
            <div className="mt-4 flex sm:mt-0">
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {t("buttons.addStaff")}
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              {t("staff.search")}
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("staff.searchByNameEmail")}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 pl-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="roleFilter" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              {t("staff.filterByRole")}
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("staff.allRoles")}</option>
              <option value="Admin">{t("staff.admin")}</option>
              <option value="Manager">{t("staff.manager")}</option>
              <option value="Employee">{t("staff.employee")}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              {t("staff.filterByStatus")}
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("staff.allStatus")}</option>
              <option value="Active">{t("staff.active")}</option>
              <option value="Pending">{t("staff.pending")}</option>
            </select>
          </div>

          {/* Total Salary Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("staff.totalMonthlySalary")}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(totalSalary)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t("staff.nameEmail")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t("forms.role")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t("staff.joinedDate")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t("forms.status")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t("staff.salary")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{t("staff.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/25">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{staff.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{staff.email}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        staff.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                          : staff.role === 'Manager'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {t(`staff.${staff.role.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{staff.joinDate}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        staff.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {staff.status === 'Active' && (
                          <svg className="mr-1 h-2 w-2 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                        )}
                        {staff.status === 'Pending' && (
                          <svg className="mr-1 h-2 w-2 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                        )}
                        {t(`staff.${staff.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(staff.salary)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                          title={t("staff.edit")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveStaff(staff.id)}
                          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-red-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
                          title={t("staff.remove")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStaff.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              {t("staff.noStaffFound")}
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md">
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            {t("staff.addNewStaff")}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t("forms.emailAddress")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder={t("staff.enterStaffEmail")}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t("forms.role")} <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Admin">{t("staff.admin")}</option>
                <option value="Manager">{t("staff.manager")}</option>
                <option value="Employee">{t("staff.employee")}</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t("buttons.sendInvitation")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default StaffPage; 