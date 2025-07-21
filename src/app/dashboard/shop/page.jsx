'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, User, Package, Plus, Phone, MapPin, Timer, AlertCircle, Star, ImageIcon, DollarSign, Archive, CheckCircle, XCircle, RefreshCw, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [liveOrders, setLiveOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [cancelledOrders, setCancelledOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('live')

  // Pagination states
  const [livePagination, setLivePagination] = useState({ page: 1, limit: 10 })
  const [completedPagination, setCompletedPagination] = useState({ page: 1, limit: 10 })
  const [cancelledPagination, setCancelledPagination] = useState({ page: 1, limit: 10 })

  // Loading states for each tab
  const [liveLoading, setLiveLoading] = useState(false)
  const [completedLoading, setCompletedLoading] = useState(false)
  const [cancelledLoading, setCancelledLoading] = useState(false)

  const [deliveryBoys, setDeliveryBoys] = useState([
    { id: 1, name: 'Mike Johnson', phone: '+91 9876543210', status: 'active', orders: 1 },
    { id: 2, name: 'Sarah Davis', phone: '+91 9876543211', status: 'active', orders: 1 },
    { id: 3, name: 'Tom Brown', phone: '+91 9876543212', status: 'offline', orders: 0 }
  ])

  const [newDeliveryBoy, setNewDeliveryBoy] = useState({ name: '', phone: '' })
  const [isAddingDeliveryBoy, setIsAddingDeliveryBoy] = useState(false)
  const router = useRouter()

  // Get API URL from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch orders from backend
  const fetchOrders = async (status = null, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${API_URL}/order/admin/get?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT token
        'Content-Type': 'application/json',
      },
    });

    console.log(response.data)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};


  // Fetch live orders (current status)
  const fetchLiveOrders = async (page = 1) => {
    setLiveLoading(true)
    try {
      const data = await fetchOrders('prepare', page, livePagination.limit)
      if (data.success) {
        setLiveOrders(data.orders)
        setLivePagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      setError('Failed to fetch live orders')
    } finally {
      setLiveLoading(false)
    }
  }

  // Fetch completed orders
  const fetchCompletedOrders = async (page = 1) => {
    setCompletedLoading(true)
    try {
      const data = await fetchOrders('current', page, completedPagination.limit)
      if (data.success) {
        setCompletedOrders(data.orders)
        setCompletedPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      setError('Failed to fetch completed orders')
    } finally {
      setCompletedLoading(false)
    }
  }

  // Fetch cancelled orders
  const fetchCancelledOrders = async (page = 1) => {
    setCancelledLoading(true)
    try {
      const data = await fetchOrders('cancel', page, cancelledPagination.limit)
      if (data.success) {
        setCancelledOrders(data.orders)
        setCancelledPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      setError('Failed to fetch cancelled orders')
    } finally {
      setCancelledLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true)
      try {
        // Fetch all order types initially
        await Promise.all([
          fetchLiveOrders(),
          fetchCompletedOrders(),
          fetchCancelledOrders()
        ])
      } catch (error) {
        setError('Failed to initialize dashboard')
      } finally {
        setLoading(false)
      }
    }

    initializeDashboard()
  }, [])

  // Socket integration for real-time updates
  // Socket integration for real-time updates (UPDATED WITH DEBUGGING)
  // Socket integration for real-time updates (UPDATED WITH DEBUGGING)
  useEffect(() => {
    if (!window.socket) {
      console.warn('Socket not available yet. Real-time updates will not work.')
      return
    }

    window.socket.on('send-order', (newOrderData) => {
      // Add new order to live orders if it's current status
      console.log('newOrderData',newOrderData)
      if (newOrderData.Status === 'prepare') {
        setLiveOrders(prevOrders => [newOrderData, ...prevOrders])
      }
    })

    window.socket.on('shop-notification', (notification) => {
      console.log('Shop notification received:', notification)
      // Remove the order from liveOrders and add to cancelledOrders atomically
      if (notification && notification.orderId) {
        setLiveOrders(prevLiveOrders => {
          const removedOrder = prevLiveOrders.find(order => order._id === notification.orderId);
          if (removedOrder) {
            setCancelledOrders(prev => [
              { ...removedOrder, Status: 'cancel' },
              ...prev
            ]);
          }
          return prevLiveOrders.filter(order => order._id !== notification.orderId);
        });
      }
    })

    // Listen for order status updates
    window.socket.on('order-status-update', (updatedOrder) => {
      console.log('Order status updated:', updatedOrder)

      // ✅ DEBUG: Log the updated order structure
      console.log('Updated order structure:', {
        _id: updatedOrder._id,
        OrderBy: updatedOrder.OrderBy,
        address: updatedOrder.OrderBy?.address,
        addressType: typeof updatedOrder.OrderBy?.address,
        Status: updatedOrder.Status
      });

      // Remove from current lists and add to appropriate list
      const removeFromAllLists = (orderId) => {
        setLiveOrders(prev => prev.filter(order => order._id !== orderId))
        setCompletedOrders(prev => prev.filter(order => order._id !== orderId))
        setCancelledOrders(prev => prev.filter(order => order._id !== orderId))
      }

      removeFromAllLists(updatedOrder._id)

      if (updatedOrder.Status === 'current') {
        setLiveOrders(prev => [updatedOrder, ...prev])
      } else if (updatedOrder.Status === 'completed') {
        setCompletedOrders(prev => [updatedOrder, ...prev])
      } else if (updatedOrder.Status === 'cancel') {
        setCancelledOrders(prev => [updatedOrder, ...prev])
      }
    })

    return () => {
      if (window.socket) {
        window.socket.off('get-order')
        window.socket.off('order-status-update')
        window.socket.off('shop-notification')
      }
    }
  }, [])

  // Refresh functions
  const refreshLiveOrders = () => fetchLiveOrders(livePagination.page)
  const refreshCompletedOrders = () => fetchCompletedOrders(completedPagination.page)
  const refreshCancelledOrders = () => fetchCancelledOrders(cancelledPagination.page)

  const addDeliveryBoy = () => {
    if (newDeliveryBoy.name && newDeliveryBoy.phone) {
      setDeliveryBoys([...deliveryBoys, {
        id: deliveryBoys.length + 1,
        name: newDeliveryBoy.name,
        phone: newDeliveryBoy.phone,
        status: 'active',
        orders: 0
      }])
      setNewDeliveryBoy({ name: '', phone: '' })
      setIsAddingDeliveryBoy(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'prepare': return 'bg-yellow-500'
      case 'current': return 'bg-green-500'
      case 'completed': return 'bg-emerald-500'
      case 'cancel': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'current': return 'On Delivery'
       case 'prepare': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancel': return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'current': return <Timer className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancel': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`
  }

  const getTotalOrders = () => {
    return liveOrders.length + completedOrders.length + cancelledOrders.length
  }

  const getActiveOrders = () => {
    return liveOrders.length
  }

  const getCompletedOrdersCount = () => {
    return completedOrders.length
  }

  const getCancelledOrdersCount = () => {
    return cancelledOrders.length
  }


  //  Helper function to safely render address
  const renderAddress = (address) => {
    if (!address) return 'Address not available';
    
    // If address is an object with location and formatted properties
    if (typeof address === 'object' && address.formatted) {
      return address.formatted;
    }
    
    // If address is an object with location property
    if (typeof address === 'object' && address.location) {
      return address.location;
    }
    
    // If address is a string
    if (typeof address === 'string') {
      return address;
    }
    
    // If address is an object but doesn't have expected properties
    if (typeof address === 'object') {
      return JSON.stringify(address);
    }
    
    return 'Address not available';
  };

  // Helper function to safely render phone
  const renderPhone = (phone) => {
    if (!phone) return 'N/A';
    
    // If phone is an object (shouldn't happen but just in case)
    if (typeof phone === 'object') {
      return phone.number || phone.mobile || JSON.stringify(phone);
    }
    
    return phone;
  };


  // Render order card
  const renderOrderCard = (order) => (
    <div key={order._id} className={`border rounded-lg p-4 transition-all duration-200 bg-white hover:shadow-md ${order.Status === 'cancel' ? 'opacity-60 border-red-200' : ''
      }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(order.Status)}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{order._id}</h3>
              <Badge className={`${getStatusColor(order.Status)} text-white flex items-center gap-1`}>
                {getStatusIcon(order.Status)}
                {getStatusText(order.Status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{order.OrderBy?.name || 'Unknown User'}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {renderPhone(order.OrderBy.mobile)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{renderAddress(order.OrderBy.address)}</span>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
              {order.Product?.map((product, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <img 
                    src={product.ProductId?.Images || '/placeholder-image.jpg'} 
                    alt={product.ProductId?.name || 'Product'} 
                    className="w-10 h-10 bg-gray-200 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.ProductId?.name || 'Product'}
                    </p>
                    <p className="text-xs text-gray-600">{product.units} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* <div className="text-center">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4 text-gray-500" />
              <span className={`font-mono font-semibold ${getTimeColor(order.DeliveryTime, order.Status)}`}>
                {order.DeliveryTime ? getTimeRemaining(order.DeliveryTime) : 'N/A'}
              </span>
            </div>
            <p className="text-xs text-gray-500">Time Left</p>
          </div> */}

          <div className="text-center">
            <p className="font-semibold text-lg">{formatPrice(order.totalAmount || 0)}</p>
            <p className="text-xs text-gray-500">{order.Product?.length || 0} items</p>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-blue-600">{order.DeliveryBy?.name || 'Unassigned'}</p>
            <p className="text-xs text-gray-500">Delivery Boy</p>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium">{order.createdAt ? formatTime(order.createdAt) : 'N/A'}</p>
            <p className="text-xs text-gray-500">Order Time</p>
          </div>

          <Button
            onClick={() => router.push(`/dashboard/shop/order/${order._id}`)}
            className="bg-green-600 hover:bg-green-700"
            disabled={order.Status === 'cancel'}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  )

  // Render pagination
  const renderPagination = (pagination, onPageChange, loading) => (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-600">
        Showing {pagination.totalOrders} orders
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev || loading}
        >
          Previous
        </Button>
        <span className="px-3 py-1 text-sm bg-gray-100 rounded">
          {pagination.currentPage} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext || loading}
        >
          Next
        </Button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time order tracking and delivery management</p>
          </div>
          <div className="flex gap-4">
            <Dialog open={isAddingDeliveryBoy} onOpenChange={setIsAddingDeliveryBoy}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Delivery Boy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Delivery Boy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newDeliveryBoy.name}
                      onChange={(e) => setNewDeliveryBoy({ ...newDeliveryBoy, name: e.target.value })}
                      placeholder="Enter delivery boy name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newDeliveryBoy.phone}
                      onChange={(e) => setNewDeliveryBoy({ ...newDeliveryBoy, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={addDeliveryBoy} className="flex-1">Add</Button>
                    <Button variant="outline" onClick={() => setIsAddingDeliveryBoy(false)} className="flex-1">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalOrders()}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Live Orders</p>
                  <p className="text-2xl font-bold text-orange-600">{getActiveOrders()}</p>
                </div>
                <Timer className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Delivery</p>
                  <p className="text-2xl font-bold text-green-600">{getCompletedOrdersCount()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{getCancelledOrdersCount()}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Live Orders ({liveOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Panding Delivery ({completedOrders.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Cancelled ({cancelledOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Live Orders</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshLiveOrders}
                    disabled={liveLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${liveLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-4">
                  {liveLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Loading live orders...</p>
                    </div>
                  ) : liveOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <Timer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No live orders at the moment</p>
                    </div>
                  ) : (
                    liveOrders.map(renderOrderCard)
                  )}
                </div>
                {liveOrders.length > 0 && renderPagination(livePagination, fetchLiveOrders, liveLoading)}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Completed Orders</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshCompletedOrders}
                    disabled={completedLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${completedLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-4">
                  {completedLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Loading completed orders...</p>
                    </div>
                  ) : completedOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No completed orders yet</p>
                    </div>
                  ) : (
                    completedOrders.map(renderOrderCard)
                  )}
                </div>
                {completedOrders.length > 0 && renderPagination(completedPagination, fetchCompletedOrders, completedLoading)}
              </TabsContent>

              <TabsContent value="cancelled" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Cancelled Orders</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshCancelledOrders}
                    disabled={cancelledLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${cancelledLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-4">
                  {cancelledLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Loading cancelled orders...</p>
                    </div>
                  ) : cancelledOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No cancelled orders</p>
                    </div>
                  ) : (
                    cancelledOrders.map(renderOrderCard)
                  )}
                </div>
                {cancelledOrders.length > 0 && renderPagination(cancelledPagination, fetchCancelledOrders, cancelledLoading)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {/* Delivery Boys */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Delivery Team ({deliveryBoys.filter(d => d.status === 'active').length} active)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryBoys.map((boy) => (
                <div key={boy.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{boy.name}</h3>
                    <Badge className={boy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {boy.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {boy.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {boy.orders} active orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}