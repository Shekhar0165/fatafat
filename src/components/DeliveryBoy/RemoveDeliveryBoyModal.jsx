import React from 'react';
import { Trash2 } from 'lucide-react';

const RemoveDeliveryBoyModal = ({ showRemoveModal, setShowRemoveModal, boyToRemove, confirmRemoval }) => {
  if (!showRemoveModal || !boyToRemove) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <div className="text-center">
          <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Remove Delivery Boy</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to remove <strong>{boyToRemove.name}</strong> from your shop? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowRemoveModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmRemoval}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveDeliveryBoyModal; 