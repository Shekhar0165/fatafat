import React from 'react';
import { QrCode, Power, Phone, Mail, MapPin, Calendar, CheckCircle, Clock, AlertCircle, Star, Package } from 'lucide-react';

const DeliveryBoyDetails = ({
  selectedDeliveryBoy,
  activeTab,
  setActiveTab,
  mockOrders,
  getOrderStatusColor,
  toggleOnlineStatus,
  setShowBarcode
}) => {
  if (!selectedDeliveryBoy) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Delivery Boy</h3>
        <p className="text-gray-600">Choose a delivery boy from the list to view their details and manage their status.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={selectedDeliveryBoy.avatar}
                alt={selectedDeliveryBoy.name}
                className="w-16 h-16 rounded-full"
              />
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${selectedDeliveryBoy.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedDeliveryBoy.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedDeliveryBoy.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {selectedDeliveryBoy.isOnline ? 'Online' : 'Offline'}
                </span>
                <span className="text-sm text-gray-500">⭐ {selectedDeliveryBoy.rating}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBarcode(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <QrCode size={16} />
              <span>Generate QR Code</span>
            </button>
            <button
              onClick={() => toggleOnlineStatus(selectedDeliveryBoy.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${selectedDeliveryBoy.isOnline ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              <Power size={16} />
              <span>{selectedDeliveryBoy.isOnline ? 'Set Offline' : 'Set Online'}</span>
            </button>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Orders
          </button>
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mobile</p>
                    <p className="text-sm text-gray-600">{selectedDeliveryBoy.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{selectedDeliveryBoy.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Shop</p>
                    <p className="text-sm text-gray-600">{selectedDeliveryBoy.shop}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Joined Date</p>
                    <p className="text-sm text-gray-600">{selectedDeliveryBoy.createdAt}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{selectedDeliveryBoy.totalDeliveries}</p>
                    <p className="text-sm text-green-700 font-medium">Total Deliveries</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">{selectedDeliveryBoy.pendingDeliveries}</p>
                    <p className="text-sm text-yellow-700 font-medium">Pending</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-red-600">{selectedDeliveryBoy.lateDeliveries}</p>
                    <p className="text-sm text-red-700 font-medium">Late</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                      <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoyDetails; 