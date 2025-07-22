'use client'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Package, User, MapPin, Phone, Clock, Printer, CheckCircle, Timer, Truck, AlertCircle, Loader2, QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OrderDetailsPage({ params }) {
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [orderStatus, setOrderStatus] = useState('preparing')
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [deliveryBoyData, setDeliveryBoyData] = useState(null)
    const router = useRouter()

    // Handle Next.js params properly
    const resolvedParams = React.use(params)
    const orderId = resolvedParams.order;

    // Fetch order data from API
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/order/get/one/${orderId}`,
                  {
                    headers: {
                      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
                    },
                  }
                );
                console.log(res)
                if (res.data.success) {
                    setOrder(res.data.data)
                    setOrderStatus(res.data.data.Status || 'preparing')

                    // Generate QR code with order data
                    generateQRCode(res.data.data)
                } else {
                    setError(res.data.message)
                }
            } catch (e) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderId])

    useEffect(() => {
        if (!window.socket) {
            console.warn('Socket not available yet. Real-time updates will not work.')
            return
        }
        window.socket.on('Assign-Delivery_boy', (AssignOrderId) => {
            // Add new order to live orders if it's current status
            console.log('AssignOrderId', AssignOrderId)
            if (orderId === AssignOrderId) {
                router.push('/dashboard/shop')
                alert('Fround Delivery Boys')
            }
        })
        return () => {
            if (window.socket) {
                window.socket.off('Assign-Delivery_boy')
            }
        }
    }, [])


    // Generate QR Code for delivery scanning
    const generateQRCode = async (orderData) => {
        try {
            const qrData = orderData._id

            const qrString = JSON.stringify(qrData)
            const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })

            setQrCodeUrl(qrCodeDataUrl)
        } catch (err) {
            console.error('Error generating QR code:', err)
        }
    }
    const deliveryBoys = [
        { id: 1, name: 'Mike Johnson', status: 'active' },
        { id: 2, name: 'Sarah Davis', status: 'active' },
        { id: 3, name: 'Tom Brown', status: 'active' }
    ]


    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500'
            case 'preparing': return 'bg-blue-500'
            case 'current': return 'bg-blue-500'
            case 'ready': return 'bg-green-500'
            case 'delivered': return 'bg-emerald-500'
            default: return 'bg-gray-500'
        }
    }


    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Card className="p-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Loading Order Details</h3>
                            <p className="text-gray-600">Please wait while we fetch your order...</p>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Card className="p-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Error Loading Order</h3>
                            <p className="text-gray-600">{error}</p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="mt-4"
                                variant="outline"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    // If no order data
    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Card className="p-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">Order Not Found</h3>
                        <p className="text-gray-600">The order you're looking for doesn't exist.</p>
                    </div>
                </Card>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => window.history.back()} className="hover:bg-blue-50">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                            <p className="text-gray-600">Order ID: <span className="font-mono font-semibold text-blue-600">{order._id}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full text-sm font-medium shadow-lg">
                            ⚡ 15-Min Delivery
                        </div>
                        <Badge className={`${getStatusColor(order.Status)} text-white`}>
                            {order.Status.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                {/* Customer & Delivery Information */}
                <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Customer & Delivery Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                                    <p className="text-gray-900 font-mono font-semibold">{order.OrderBy._id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location Coordinates</label>
                                    <p className="text-gray-900 font-mono text-sm">
                                        {order.OrderBy.address.location.coordinates[1]}, {order.OrderBy.address.location.coordinates[0]}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                                    <p className="text-gray-900 font-medium">{order.OrderBy.address.formatted}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Order Items ({order.Product.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Items Container */}
                                <div className="space-y-4">

                                    {order.Product.map((item, index) => (
                                        <div key={item._id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={item.ProductId.Images}
                                                    alt={item.ProductId.ProductName}
                                                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                                    onError={(e) => {
                                                        e.target.src = `https://via.placeholder.com/80x80/f0f0f0/999999?text=${item.ProductId.ProductName.charAt(0)}`
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{item.ProductId.ProductName}</h3>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Type:</span> {item.ProductId.Type}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Stock:</span> {item.ProductId.Stock} available
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Quantity:</span> {item.units} units
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">₹{item.ProductId.PricePerUnit}</p>
                                                <p className="text-sm text-gray-600">per unit</p>
                                                <div className="mt-2">
                                                    <Badge variant="outline" className="font-medium">
                                                        {item.units} × ₹{item.ProductId.PricePerUnit}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Charge Section */}
                                <div className="flex items-center justify-between mt-6 mb-2 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold text-green-900">Delivery Charge</span>
                                    </div>
                                    <span className="text-lg font-bold text-green-700">₹{order.DeliveryCharge}</span>
                                </div>

                                <Separator className="my-6" />

                                {/* Order Summary */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Total Amount</span>
                                        <span className="text-green-600">₹{order.totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Payment Method</span>
                                        <span className="font-semibold">{order.paymentMethod}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Delivery QR Code - Takes 1 column */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-6">
                            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="w-5 h-5" />
                                    Delivery QR Code
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center space-y-6">
                                    <div className="bg-white p-6 rounded-xl border-2 border-dashed border-green-300 shadow-inner">
                                        {qrCodeUrl ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={qrCodeUrl}
                                                    alt="Delivery QR Code"
                                                    className="mx-auto w-48 h-48 border-4 border-gray-200 rounded-lg shadow-sm"
                                                />
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-gray-900 mb-2">Order ID</p>
                                                    <p className="text-xs font-mono text-gray-600 break-all bg-gray-50 px-3 py-2 rounded">{order._id}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-blue-900 mb-2">📱 For Delivery Boys</h4>
                                            <p className="text-sm text-blue-800">
                                                Scan this QR code with your delivery app to confirm pickup and update order status.
                                            </p>
                                        </div>

                                        {deliveryBoyData && (
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-green-900 mb-2">✅ Picked Up By</h4>
                                                <p className="text-sm text-green-800">
                                                    {deliveryBoyData.name} - {deliveryBoyData.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}