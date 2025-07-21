import React, { useEffect, useState } from 'react';

const QRCodeModal = ({ showBarcode, setShowBarcode, selectedDeliveryBoy, generateQRCode }) => {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (showBarcode && selectedDeliveryBoy) {
      setQrUrl(''); // reset before generating
      generateQRCode(selectedDeliveryBoy.mobile).then(setQrUrl);
    } else {
      setQrUrl('');
    }
  }, [showBarcode, selectedDeliveryBoy, generateQRCode]);

  if (!showBarcode || !selectedDeliveryBoy) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Delivery Boy QR Code</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code" className="mx-auto" />
            ) : (
              <div>Generating QR code...</div>
            )}
          </div>
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>User ID:</strong> {selectedDeliveryBoy.mobile}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Name:</strong> {selectedDeliveryBoy.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Shop:</strong> {selectedDeliveryBoy.shop}
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code for delivery boy check-in and status updates
          </p>
          <button
            onClick={() => setShowBarcode(false)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal; 