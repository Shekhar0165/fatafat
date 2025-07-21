import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Plus } from 'lucide-react';

const AddDeliveryBoyDialog = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  otpStep,
  setOtpStep,
  newDeliveryBoy,
  setNewDeliveryBoy,
  otp,
  setOtp,
  handleAddDeliveryBoy,
  handleOtpVerification
}) => (
  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
    <DialogTrigger asChild>
      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
        <Plus className="w-4 h-4 mr-2" />
        Add Delivery Boy
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Delivery Boy</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new delivery boy to your team.
        </DialogDescription>
      </DialogHeader>
      {!otpStep ? (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={newDeliveryBoy.name}
              onChange={(e) => setNewDeliveryBoy({ ...newDeliveryBoy, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={newDeliveryBoy.mobile}
              onChange={(e) => setNewDeliveryBoy({ ...newDeliveryBoy, mobile: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={newDeliveryBoy.email}
              onChange={(e) => setNewDeliveryBoy({ ...newDeliveryBoy, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <Button onClick={handleAddDeliveryBoy} className="w-full">
            Send OTP for Verification
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 py-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              OTP has been sent to {newDeliveryBoy.mobile} and {newDeliveryBoy.email}
            </p>
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="text-center text-lg tracking-widest my-2"
            />
            <p className="text-xs text-gray-500 mt-2">Demo OTP: 123456</p>
          </div>
          <div className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOtpStep(false)}
              className="w-full my-2"
            >
              Back
            </Button>
            <Button
              onClick={handleOtpVerification}
              className="w-full"
            >
              Verify & Add
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export default AddDeliveryBoyDialog; 