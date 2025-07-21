import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '@/utils/cloudinary';

const ProductForm = ({ 
  isOpen, 
  onClose, 
  product = null, 
  categoryId, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    ProductName: '',
    CategoryId: categoryId || '',
    Type: '',
    Stock: '',
    PricePerUnit: '',
    Units: '',
    MinimumOrder: '',
    Images: '',
    imagePublicId: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ProductName: product.ProductName || '',
        CategoryId: product.CategoryId || categoryId || '',
        Type: product.Type || '',
        Stock: product.Stock || '',
        PricePerUnit: product.PricePerUnit || '',
        Units: product.Units || '',
        MinimumOrder: product.MinimumOrder || '',
        Images: product.Images || '',
        imagePublicId: product.imagePublicId || ''
      });
      setImagePreview(product.Images || '');
    } else {
      setFormData({
        ProductName: '',
        CategoryId: categoryId || '',
        Type: '',
        Stock: '',
        PricePerUnit: '',
        Units: '',
        MinimumOrder: '',
        Images: '',
        imagePublicId: ''
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [product, categoryId, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, Images: '', imagePublicId: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.Images;
      let imagePublicId = formData.imagePublicId;

      // Handle image upload/update
      if (imageFile) {
        setIsUploading(true);
        
        // Upload new image
        const uploadResult = await uploadImageToCloudinary(imageFile);
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
        
        setIsUploading(false);
      }

      const submitData = {
        ...formData,
        Images: imageUrl,
        imagePublicId,
        Stock: parseInt(formData.Stock),
        PricePerUnit: parseFloat(formData.PricePerUnit),
        ...(formData.Type !== 'packet' && {
          Units: formData.Units ? [formData.Units] : [],
          MinimumOrder: parseInt(formData.MinimumOrder)
        })
      };

      const api = process.env.NEXT_PUBLIC_API_URL;
      const url = product 
        ? `${api}/product/update/${product._id}`
        : `${api}/product/add`;
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(product ? 'Product updated successfully' : 'Product added successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={formData.ProductName}
              onChange={(e) => handleInputChange('ProductName', e.target.value)}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Product Type *</Label>
            <Select 
              value={formData.Type} 
              onValueChange={(value) => handleInputChange('Type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="packet">Packet</SelectItem>
                <SelectItem value="non-packet">Non-Packet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Unit *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.PricePerUnit}
                onChange={(e) => handleInputChange('PricePerUnit', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.Stock}
                onChange={(e) => handleInputChange('Stock', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Units and Minimum Order (only if not packet) */}
          {formData.Type !== 'packet' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="units">Units</Label>
                <Select
                  value={formData.Units}
                  onValueChange={(value) => handleInputChange('Units', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="mL">mL</SelectItem>
                    <SelectItem value="dozen">dozen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrder">Minimum Order</Label>
                <Input
                  id="minimumOrder"
                  type="number"
                  value={formData.MinimumOrder}
                  onChange={(e) => handleInputChange('MinimumOrder', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                product ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;