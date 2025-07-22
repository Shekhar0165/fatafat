'use client'
import React, { useState, useEffect } from 'react';
import DeliveryStatsCards from '@/components/DeliveryBoy/DeliveryStatsCards';
import DeliveryBoyList from '@/components/DeliveryBoy/DeliveryBoyList';
import DeliveryBoyDetails from '@/components/DeliveryBoy/DeliveryBoyDetails';
import AddDeliveryBoyDialog from '@/components/DeliveryBoy/AddDeliveryBoyDialog';
import DeliveryBoyQRCodeCard from '@/components/DeliveryBoy/DeliveryBoyQRCodeCard';
import RemoveDeliveryBoyModal from '@/components/DeliveryBoy/RemoveDeliveryBoyModal';
import { Button } from '@/components/ui/button';
import { Download, Package } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import QRCode from 'qrcode'


const mockOrders = [
    { id: "ORD001", customer: "Alice Johnson", status: "delivered", date: "2024-07-15", amount: "₹450" },
    { id: "ORD002", customer: "Bob Wilson", status: "pending", date: "2024-07-16", amount: "₹320" },
    { id: "ORD003", customer: "Carol Davis", status: "in-transit", date: "2024-07-16", amount: "₹180" },
    { id: "ORD004", customer: "David Brown", status: "delivered", date: "2024-07-14", amount: "₹290" },
    { id: "ORD005", customer: "Emma Wilson", status: "cancelled", date: "2024-07-13", amount: "₹560" },
];

const DeliveryBoyManagement = () => {
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [animatedStats, setAnimatedStats] = useState({
        total: 0,
        active: 0,
        deliveries: 0,
        pending: 0
    });
    const [newDeliveryBoy, setNewDeliveryBoy] = useState({
        name: '',
        mobile: '',
        email: '',
        shop: '',
        password: ''
    });
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
    const [showBarcode, setShowBarcode] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [boyToRemove, setBoyToRemove] = useState(null);

    useEffect(() => {
        fetchDeliveryBoys()
    }, [])



    const fetchDeliveryBoys = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-boy/get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : undefined,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch delivery boys');
            }

            const data = await response.json();

            // Transform backend data to match frontend structure
            const transformedData = data.deliveryBoys.map(boy => ({
                id: boy._id,
                name: boy.name,
                mobile: boy.mobile,
                email: boy.email,
                shop: boy.Shop || 'Unknown Shop',
                createdAt: new Date(boy.createdAt).toLocaleDateString(),
                totalDeliveries: boy.totalDeliveries || 0,
                lateDeliveries: boy.lateDeliveries || 0,
                isOnline: boy.isOnline || false,
                rating: boy.rating || 5.0,
                avatar: boy.avatar,
                todayDeliveries: boy.todayDeliveries || 0,
                isVerified: boy.isVerified || false,
            }));

            setDeliveryBoys(transformedData);
        } catch (error) {
            console.error('Error fetching delivery boys:', error);
            setError('Failed to load delivery boys');
        } finally {
            setLoading(false);
        }
    };


    console.log(deliveryBoys)

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedStats({
                total: deliveryBoys.length,
                active: deliveryBoys.filter(boy => boy.isOnline).length,
                deliveries: deliveryBoys.reduce((sum, boy) => sum + boy.totalDeliveries, 0),
                pending: deliveryBoys.reduce((sum, boy) => sum + (boy.pendingDeliveries || 0), 0)
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [deliveryBoys]);

    const handleAddDeliveryBoy = async () => {
        if (newDeliveryBoy.name && newDeliveryBoy.mobile && newDeliveryBoy.email) {
            try {
                // Make POST request to backend API
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/delivery-boy/add`, {
                    name: newDeliveryBoy.name,
                    email: newDeliveryBoy.email,
                    mobile: newDeliveryBoy.mobile,
                });
    
                console.log('Server Response:', response.data);
                toast.success('OTP sent to delivery boy email');
                setOtpStep(true); // Move to OTP step
    
            } catch (error) {
                console.error('Error adding delivery boy:', error.response?.data || error.message);
                toast.error(error.response?.data?.message || 'Failed to send OTP');
            }
        } else {
            toast.warning('Please fill all the fields');
        }
    };

    const handleOtpVerification = async () => {
        if (!otp) {
            toast.warning('Please enter the OTP');
            return;
        }
    
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/delivery-boy/verify`, {
                email: newDeliveryBoy.email,
                otp: otp
            });
    
            // Backend says OTP is correct
            const newId = deliveryBoys.length + 1;
    
            const newBoy = {
                id: newId,
                ...newDeliveryBoy,
                userid: `DB${String(newId).padStart(3, '0')}`,
                totalDeliveries: 0,
                pendingDeliveries: 0,
                lateDeliveries: 0,
                createdAt: new Date().toISOString().split('T')[0],
                isOnline: true,
                rating: 5.0,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newDeliveryBoy.name}`,
                performance: "new",
                todayDeliveries: 0,
                weeklyTarget: 30,
                completionRate: 100
            };
    
            setDeliveryBoys([...deliveryBoys, newBoy]);
            setIsAddDialogOpen(false);
            setOtpStep(false);
            setNewDeliveryBoy({ name: '', mobile: '', email: '', shop: '', password: '' });
            setOtp('');
    
            toast.success('Email verified and delivery boy added successfully!');
            
        } catch (error) {
            console.error('OTP verification failed:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Invalid OTP or verification failed');
        }
    };


    const getOrderStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-500';
            case 'pending': return 'bg-yellow-500';
            case 'in-transit': return 'bg-blue-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const toggleOnlineStatus = (boyId) => {
        setDeliveryBoys(prev => prev.map(boy =>
            boy.id === boyId ? { ...boy, isOnline: !boy.isOnline } : boy
        ));
        if (selectedDeliveryBoy?.id === boyId) {
            setSelectedDeliveryBoy(prev => ({ ...prev, isOnline: !prev.isOnline }));
        }
    };

    const handleRemoveDeliveryBoy = (boy) => {
        setBoyToRemove(boy);
        setShowRemoveModal(true);
    };

    const confirmRemoval = () => {
        setDeliveryBoys(prev => prev.filter(boy => boy.id !== boyToRemove.id));
        if (selectedDeliveryBoy?.id === boyToRemove.id) {
            setSelectedDeliveryBoy(null);
        }
        setShowRemoveModal(false);
        setBoyToRemove(null);
    };

    const generateQRCode = async(mobile) => {
        const qrData = {
            mobile: mobile,
            shop: selectedDeliveryBoy?.shop
        };
        const qrString =JSON.stringify(qrData)
            const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
        return qrCodeDataUrl;
    };

    const filteredDeliveryBoys = deliveryBoys.filter(boy => {
        const matchesSearch = boy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            boy.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'online' && boy.isOnline) ||
            (filterStatus === 'offline' && !boy.isOnline);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Delivery Management
                                </h1>
                                <p className="text-slate-600 text-sm">Manage your delivery team efficiently</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button variant="outline" className="hover:bg-slate-50">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <AddDeliveryBoyDialog
                                isAddDialogOpen={isAddDialogOpen}
                                setIsAddDialogOpen={setIsAddDialogOpen}
                                otpStep={otpStep}
                                setOtpStep={setOtpStep}
                                newDeliveryBoy={newDeliveryBoy}
                                setNewDeliveryBoy={setNewDeliveryBoy}
                                otp={otp}
                                setOtp={setOtp}
                                handleAddDeliveryBoy={handleAddDeliveryBoy}
                                handleOtpVerification={handleOtpVerification}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 py-6">
                <DeliveryStatsCards animatedStats={animatedStats} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <DeliveryBoyList
                            filteredDeliveryBoys={filteredDeliveryBoys}
                            selectedDeliveryBoy={selectedDeliveryBoy}
                            setSelectedDeliveryBoy={setSelectedDeliveryBoy}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            toggleOnlineStatus={toggleOnlineStatus}
                            handleRemoveDeliveryBoy={handleRemoveDeliveryBoy}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <DeliveryBoyDetails
                            selectedDeliveryBoy={selectedDeliveryBoy}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            mockOrders={mockOrders}
                            getOrderStatusColor={getOrderStatusColor}
                            toggleOnlineStatus={toggleOnlineStatus}
                            setShowBarcode={setShowBarcode}
                        />
                        {showBarcode && (
                            <div className="mt-6">
                                <DeliveryBoyQRCodeCard
                                    show={showBarcode}
                                    selectedDeliveryBoy={selectedDeliveryBoy}
                                    generateQRCode={generateQRCode}
                                    onClose={() => setShowBarcode(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <RemoveDeliveryBoyModal
                showRemoveModal={showRemoveModal}
                setShowRemoveModal={setShowRemoveModal}
                boyToRemove={boyToRemove}
                confirmRemoval={confirmRemoval}
            />
        </div>
    );
};

export default DeliveryBoyManagement;