// Updated ProductPage.js
'use client'

import React, { useEffect, useState, use } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Search,
  IndianRupee,
  Package,
  Grid3X3,
  List,
  Plus,
  SortAsc,
  SortDesc,
  Filter
} from 'lucide-react'

// Import our new components
import ProductForm from '@/components/Product/ProductForm'
import DeleteConfirmDialog from '@/components/Product/DeleteConfirmDialog'
import ProductCard from '@/components/Product/ProductCard'
import { deleteImageFromCloudinary } from '@/utils/cloudinary'

const api = process.env.NEXT_PUBLIC_API_URL

export default function ProductPage({ params }) {
  const { category: CategoryID } = use(params)
  const router = useRouter()

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  // Modal states
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${api}/product/${CategoryID}`, {
        withCredentials: true,
      })
      if (res.data.success) {
        setProducts(res.data.products)
        setFilteredProducts(res.data.products)
      } else {
        toast.error('Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (CategoryID) fetchProducts()
  }, [CategoryID])

  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.PricePerUnit)
        const min = priceRange.min ? parseFloat(priceRange.min) : 0
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity
        return price >= min && price <= max
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = a.ProductName.toLowerCase()
          bValue = b.ProductName.toLowerCase()
          break
        case 'price':
          aValue = parseFloat(a.PricePerUnit)
          bValue = parseFloat(b.PricePerUnit)
          break
        case 'date':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          aValue = a.ProductName.toLowerCase()
          bValue = b.ProductName.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, priceRange, sortBy, sortOrder])

  // Product Actions
  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsProductFormOpen(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setIsProductFormOpen(true)
  }

  const handleViewProduct = (product) => {
    // Implement view functionality or navigate to product detail page
    toast.info(`Viewing ${product.ProductName}`)
  }

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return

    setIsDeleting(true)
    console.log(selectedProduct)
    try {
      // Delete product from database
      const response = await axios.delete(`${api}/product/delete/${selectedProduct._id}`, {
        withCredentials: true,
      })

      if (response.data.success) {
        if (selectedProduct.Images) {
        await deleteImageFromCloudinary(selectedProduct.Images
        )
      }
        toast.success('Product deleted successfully')
        fetchProducts() // Refresh the list
        setIsDeleteDialogOpen(false)
        setSelectedProduct(null)
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = () => {
    fetchProducts() // Refresh the list
    setSelectedProduct(null)
  }

  // Calculate stats
  const averagePrice = products.length > 0
    ? products.reduce((sum, product) => sum + parseFloat(product.PricePerUnit), 0) / products.length
    : 0

  const maxPrice = products.length > 0
    ? Math.max(...products.map(p => parseFloat(p.PricePerUnit)))
    : 0

  const minPrice = products.length > 0
    ? Math.min(...products.map(p => parseFloat(p.PricePerUnit)))
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Products Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <Skeleton className="h-48 w-full" />
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Products
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Browse and manage your product catalog
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Products</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <div className="p-3 bg-purple-400/30 rounded-full">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Average Price</p>
                  <p className="text-3xl font-bold">₹{averagePrice.toFixed(0)}</p>
                </div>
                <div className="p-3 bg-emerald-400/30 rounded-full">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Highest Price</p>
                  <p className="text-3xl font-bold">₹{maxPrice}</p>
                </div>
                <div className="p-3 bg-blue-400/30 rounded-full">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Lowest Price</p>
                  <p className="text-3xl font-bold">₹{minPrice}</p>
                </div>
                <div className="p-3 bg-orange-400/30 rounded-full">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>

          {/* Price Range Filter */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min price"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-24 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-24 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md focus:border-purple-400 focus:ring-purple-400"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="date">Sort by Date</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="border-slate-200 hover:bg-slate-50"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-200 hover:bg-slate-50'}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-200 hover:bg-slate-50'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Add Product Button */}
          <Button
            onClick={handleAddProduct}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || priceRange.min || priceRange.max
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && !priceRange.min && !priceRange.max && (
              <Button
                onClick={handleAddProduct}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
            }`}>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                viewMode={viewMode}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onView={handleViewProduct}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <ProductForm
          isOpen={isProductFormOpen}
          onClose={() => setIsProductFormOpen(false)}
          product={selectedProduct}
          categoryId={CategoryID}
          onSuccess={handleFormSuccess}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          productName={selectedProduct?.ProductName}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  )
}