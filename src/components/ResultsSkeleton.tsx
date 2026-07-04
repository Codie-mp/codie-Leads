import React from 'react';
import { motion } from 'motion/react';

export function ResultsSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold w-1/3">Business Name</th>
              <th className="px-6 py-4 font-semibold w-1/6">Rating</th>
              <th className="px-6 py-4 font-semibold w-1/4">Contact</th>
              <th className="px-6 py-4 font-semibold w-1/4">Address</th>
              <th className="px-6 py-4 font-semibold w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-100 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="h-8 bg-gray-200 rounded-lg w-24 ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
