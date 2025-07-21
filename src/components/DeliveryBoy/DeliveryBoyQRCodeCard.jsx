import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

const DeliveryBoyQRCodeCard = ({ show, selectedDeliveryBoy, generateQRCode, onClose }) => {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (show && selectedDeliveryBoy) {
      setQrUrl('');
      generateQRCode(selectedDeliveryBoy.mobile).then(setQrUrl);
    } else {
      setQrUrl('');
    }
  }, [show, selectedDeliveryBoy, generateQRCode]);

  if (!show || !selectedDeliveryBoy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm max-w-md w-full">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Delivery Boy QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="bg-white p-6 rounded-xl border-2 border-dashed border-green-300 shadow-inner">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Delivery Boy QR Code"
                  className="mx-auto w-48 h-48 border-4 border-gray-200 rounded-lg shadow-sm"
                />
              ) : (
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  Generating QR code...
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 mb-2">Mobile</p>
              <p className="text-xs font-mono text-gray-600 break-all bg-gray-50 px-3 py-2 rounded">{selectedDeliveryBoy.mobile}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryBoyQRCodeCard; 