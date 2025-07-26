'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { AlertCircle, CheckCircle, Clock, DollarSign, Eye, RefreshCw, Search, XCircle, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"



export default function page() {
  const [refunds, setRefunds] = useState([])
  const [selectedRefunds, setSelectedRefunds] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    status: 'pending',
    page: 1,
    limit: 10,
    search: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  })
  const [selectedRefund, setSelectedRefund] = useState(null)
  const [processDialog, setProcessDialog] = useState(false)
  const [bulkProcessDialog, setBulkProcessDialog] = useState(false)
  const [processForm, setProcessForm] = useState({
    status: 'completed',
    adminNotes: '',
    refundTransactionId: ''
  })




  const api = process.env.NEXT_PUBLIC_API_URL;

  // Fetch refunds
  const fetchRefunds = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        status: filters.status
      })
      
      const response = await fetch(`${api}/refunds/admin?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Assuming you store admin token
        }
      })


      const data = await response.json()
      console.log(data)
      
      if (data.success) {
        setRefunds(data.data.refunds)
        setPagination({
          currentPage: data.data.currentPage,
          totalPages: data.data.totalPages,
          totalCount: data.data.totalCount,
          hasNext: data.data.hasNext,
          hasPrev: data.data.hasPrev
        })
      } else {
        toast.error(data.message || "Failed to fetch refunds")
      }
    } catch (error) {
      console.error('Error fetching refunds:', error)
      toast.error("Failed to fetch refunds. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${api}/refunds/admin/statistics`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      const data = await response.json()
      console.log(data)
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // Get single refund details
  const fetchRefundDetails = async (refundId) => {
    try {
      const response = await fetch(`${api}/refunds/admin/${refundId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      const data = await response.json()
      console.log(data)
      
      if (data.success) {
        setSelectedRefund(data.data)
      } else {
        toast.error(data.message || "Failed to fetch refund details")
      }
    } catch (error) {
      console.error('Error fetching refund details:', error)
      toast.error("Failed to fetch refund details")
    }
  }

  // Process single refund
  const processRefund = async (refundId, formData) => {
    try {
      const response = await fetch(`${api}/refunds/admin/process/${refundId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      console.log(data)
      
      if (data.success) {
        toast.success(`Refund ${formData.status} successfully`)
        fetchRefunds()
        setProcessDialog(false)
        setSelectedRefund(null)
        resetProcessForm()
      } else {
        toast.error(data.message || "Failed to process refund")
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error("Failed to process refund")
    }
  }

  // Bulk process refunds
  const bulkProcessRefunds = async () => {
    try {
      const response = await fetch(`${api}/refunds/admin/bulk-process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          refundIds: selectedRefunds,
          ...processForm
        }),
      })
      
      const data = await response.json()
      console.log(data)
      
      if (data.success) {
        toast.success(data.message)
        fetchRefunds()
        setBulkProcessDialog(false)
        setSelectedRefunds([])
        resetProcessForm()
      } else {
        toast.error(data.message || "Failed to process refunds")
      }
    } catch (error) {
      console.error('Error bulk processing refunds:', error)
      toast.error("Failed to process refunds")
    }
  }

  const resetProcessForm = () => {
    setProcessForm({
      status: 'completed',
      adminNotes: '',
      refundTransactionId: ''
    })
  }

  useEffect(() => {
    fetchRefunds()
    fetchStats()
  }, [filters])

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
      completed: { variant: "default", icon: CheckCircle, color: "text-green-600" },
      failed: { variant: "destructive", icon: XCircle, color: "text-red-600" },
    }
    
    const config = variants[status] || variants.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetails = async (refund) => {
    setSelectedRefund(refund)
    // Optionally fetch more detailed data
    await fetchRefundDetails(refund._id)
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRefunds(refunds.map(r => r._id))
    } else {
      setSelectedRefunds([])
    }
  }

  const handleSelectRefund = (refundId, checked) => {
    if (checked) {
      setSelectedRefunds(prev => [...prev, refundId])
    } else {
      setSelectedRefunds(prev => prev.filter(id => id !== refundId))
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Refund Management</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchRefunds} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedRefunds.length > 0 && (
            <Button onClick={() => setBulkProcessDialog(true)} size="sm">
              Process Selected ({selectedRefunds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRefunds}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRefundAmount)}</div>
            </CardContent>
          </Card>
          {stats.statistics && stats.statistics.map((stat) => (
            <Card key={stat._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{stat._id} Refunds</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stat.totalAmount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by order ID, user name..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="limit">Per Page</Label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value), page: 1 }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>
            Showing {pagination.totalCount} total refunds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRefunds.length === refunds.length && refunds.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                      Loading refunds...
                    </TableCell>
                  </TableRow>
                ) : refunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No refunds found
                    </TableCell>
                  </TableRow>
                ) : (
                  refunds.map((refund) => (
                    <TableRow key={refund._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRefunds.includes(refund._id)}
                          onCheckedChange={(checked) => handleSelectRefund(refund._id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        #{refund.orderId._id.slice(-6)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{refund.userId.name}</div>
                          <div className="text-sm text-muted-foreground">{refund.userId.mobile}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(refund.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(refund.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(refund.requestedAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {refund.processedAt ? formatDate(refund.processedAt) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(refund)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {refund.status === 'pending' && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedRefund(refund)
                                setProcessDialog(true)
                              }}>
                                Process Refund
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Single Refund Dialog */}
      <Dialog open={processDialog} onOpenChange={setProcessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process refund for order #{selectedRefund?.orderId._id.slice(-6)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="process-status">Status</Label>
              <Select
                value={processForm.status}
                onValueChange={(value) => setProcessForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Complete Refund</SelectItem>
                  <SelectItem value="failed">Mark as Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {processForm.status === 'completed' && (
              <div>
                <Label htmlFor="transaction-id">Refund Transaction ID</Label>
                <Input
                  id="transaction-id"
                  placeholder="Enter transaction ID"
                  value={processForm.refundTransactionId}
                  onChange={(e) => setProcessForm(prev => ({ ...prev, refundTransactionId: e.target.value }))}
                />
              </div>
            )}
            <div>
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add notes about this refund..."
                value={processForm.adminNotes}
                onChange={(e) => setProcessForm(prev => ({ ...prev, adminNotes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setProcessDialog(false)
              resetProcessForm()
            }}>
              Cancel
            </Button>
            <Button onClick={() => selectedRefund && processRefund(selectedRefund._id, processForm)}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Process Dialog */}
      <Dialog open={bulkProcessDialog} onOpenChange={setBulkProcessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Process Refunds</DialogTitle>
            <DialogDescription>
              Process {selectedRefunds.length} selected refunds
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-status">Status</Label>
              <Select
                value={processForm.status}
                onValueChange={(value) => setProcessForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Complete All</SelectItem>
                  <SelectItem value="failed">Mark All as Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bulk-notes">Admin Notes</Label>
              <Textarea
                id="bulk-notes"
                placeholder="Add notes for all selected refunds..."
                value={processForm.adminNotes}
                onChange={(e) => setProcessForm(prev => ({ ...prev, adminNotes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setBulkProcessDialog(false)
              resetProcessForm()
            }}>
              Cancel
            </Button>
            <Button onClick={bulkProcessRefunds}>
              Process All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      {selectedRefund && !processDialog && (
        <Dialog open={!!selectedRefund} onOpenChange={() => setSelectedRefund(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Refund Details</DialogTitle>
              <DialogDescription>
                Order #{selectedRefund.orderId._id.slice(-6)} - {formatCurrency(selectedRefund.amount)}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="refund" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="refund">Refund Info</TabsTrigger>
                <TabsTrigger value="order">Order Details</TabsTrigger>
                <TabsTrigger value="customer">Customer Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="refund" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedRefund.status)}</div>
                  </div>
                  <div>
                    <Label>Refund Method</Label>
                    <p className="text-sm capitalize mt-1">{selectedRefund.refundMethod}</p>
                  </div>
                  <div>
                    <Label>Requested At</Label>
                    <p className="text-sm mt-1">{formatDate(selectedRefund.requestedAt)}</p>
                  </div>
                  <div>
                    <Label>Processed At</Label>
                    <p className="text-sm mt-1">
                      {selectedRefund.processedAt ? formatDate(selectedRefund.processedAt) : 'Not processed'}
                    </p>
                  </div>
                  <div>
                    <Label>Payment ID</Label>
                    <p className="text-sm font-mono mt-1">{selectedRefund.paymentId}</p>
                  </div>
                  <div>
                    <Label>Razorpay Order ID</Label>
                    <p className="text-sm font-mono mt-1">{selectedRefund.razorpayOrderId}</p>
                  </div>
                  {selectedRefund.refundTransactionId && (
                    <div className="col-span-2">
                      <Label>Refund Transaction ID</Label>
                      <p className="text-sm font-mono mt-1">{selectedRefund.refundTransactionId}</p>
                    </div>
                  )}
                  {selectedRefund.adminNotes && (
                    <div className="col-span-2">
                      <Label>Admin Notes</Label>
                      <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedRefund.adminNotes}</p>
                    </div>
                  )}
                  {selectedRefund.processedBy && (
                    <div className="col-span-2">
                      <Label>Processed By</Label>
                      <p className="text-sm mt-1">{selectedRefund.processedBy.name}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="order" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order Total</Label>
                    <p className="text-sm font-semibold mt-1">{formatCurrency(selectedRefund.orderId.totalAmount)}</p>
                  </div>
                  <div>
                    <Label>Order Status</Label>
                    <p className="text-sm mt-1">{selectedRefund.orderId.Status}</p>
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <p className="text-sm mt-1">{selectedRefund.orderId.PaymentMethod}</p>
                  </div>
                  <div>
                    <Label>Order Date</Label>
                    <p className="text-sm mt-1">{formatDate(selectedRefund.orderId.createdAt)}</p>
                  </div>
                  {selectedRefund.orderId.DeliveryBy && (
                    <>
                      <div>
                        <Label>Delivery Person</Label>
                        <p className="text-sm mt-1">{selectedRefund.orderId.DeliveryBy.name}</p>
                      </div>
                      <div>
                        <Label>Delivery Phone</Label>
                        <p className="text-sm mt-1">{selectedRefund.orderId.DeliveryBy.phone}</p>
                      </div>
                    </>
                  )}
                </div>
                
                {selectedRefund.orderId.Product && selectedRefund.orderId.Product.length > 0 && (
                  <div>
                    <Label>Products</Label>
                    <div className="mt-2 space-y-2">
                      {selectedRefund.orderId.Product.map((product, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 border rounded">
                          {product.ProductId.Images && product.ProductId.Images[0] && (
                            <img 
                              src={product.ProductId.Images[0]} 
                              alt={product.ProductId.ProductName}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{product.ProductId.ProductName}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {product.quantity} × {formatCurrency(product.ProductId.PricePerUnit)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="customer" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm mt-1">{selectedRefund.userId.name}</p>
                  </div>
                  <div>
                    <Label>Mobile</Label>
                    <p className="text-sm mt-1">{selectedRefund.userId.mobile}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <p className="text-sm mt-1">{selectedRefund.userId.address}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRefund(null)}>
                Close
              </Button>
              {selectedRefund.status === 'pending' && (
                <Button onClick={() => setProcessDialog(true)}>
                  Process Refund
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}