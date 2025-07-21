import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  IndianRupee,
  Eye,
  Edit3,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

const ProductCard = ({ 
  product, 
  index, 
  viewMode,
  onEdit,
  onDelete,
  onView 
}) => {
  return (
    <Card
      className={`group border-0 shadow-lg transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm ${
        viewMode === 'grid' ? 'hover:scale-105' : ''
      }`}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        {product.Images ? (
          <img 
            src={product.Images} 
            alt={product.ProductName}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center" 
          style={{ display: product.Images ? 'none' : 'flex' }}
        >
          <ImageIcon className="w-12 h-12 text-slate-400" />
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={`${
            index % 4 === 0 ? 'bg-purple-500' :
            index % 4 === 1 ? 'bg-emerald-500' :
            index % 4 === 2 ? 'bg-blue-500' : 'bg-orange-500'
          } text-white`}>
            ₹{product.PricePerUnit}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2">
          {product.ProductName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-lg font-bold text-slate-900">
            <IndianRupee className="w-4 h-4" />
            {product.PricePerUnit}
          </div>
          <div className="flex items-center text-xs text-slate-500">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(product.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={() => onView(product)}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            onClick={() => onEdit(product)}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;