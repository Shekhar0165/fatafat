// Updated ProductPage.js with Infinite Scroll
'use client'

import React, { useEffect, useState, use, useCallback, useRef } from 'react'
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
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight
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

  // Core state
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  // Modal states
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Refs for infinite scroll
  const observer = useRef()
  const lastProductElementRef = useCallback(node => {
    if (loadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreProducts()
      }
    })
    if (node) observer.current.observe(node)
  }, [loadingMore, hasMore])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset products when search changes
  useEffect(() => {
    setProducts([])
    setCurrentPage(1)
    setHasMore(true)
    fetchProducts(1, true)
  }, [debouncedSearchTerm, CategoryID])

  const fetchProducts = async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const accessToken = localStorage.getItem('accessToken');
      const res = await axios.get(`${api}/product/${CategoryID}`, {
        params: {
          page,
          limit: 10,
          search: debouncedSearchTerm
        },
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
        withCredentials: true,
      })

      if (res.data.success) {
        const { products: newProducts, currentPage, totalPages, totalProducts } = res.data
        
        if (reset || page === 1) {
          setProducts(newProducts)
        } else {
          setProducts(prev => [...prev, ...newProducts])
        }
        
        setCurrentPage(currentPage)
        setTotalPages(totalPages)
        setTotalProducts(totalProducts)
        setHasMore(currentPage < totalPages)
      } else {
        toast.error('Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreProducts = () => {
    if (!loadingMore && hasMore && currentPage < totalPages) {
      fetchProducts(currentPage + 1, false)
    }
  }

  // Navigation functions
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      fetchProducts(newPage, true)
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      fetchProducts(newPage, true)
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToSpecificPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
      fetchProducts(page, true)
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Initial fetch
  useEffect(() => {
    if (CategoryID) {
      fetchProducts(1, true)
    }
  }, [CategoryID])

  // Client-side filtering for price range and sorting
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products]

    // Price range filter (client-side)
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.PricePerUnit)
        const min = priceRange.min ? parseFloat(priceRange.min) : 0
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity
        return price >= min && price <= max
      })
    }

    // Sort (client-side)
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

    return filtered
  }

  const filteredProducts = getFilteredAndSortedProducts()

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
    toast.info(`Viewing ${product.ProductName}`)
  }

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return

    setIsDeleting(true)
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.delete(`${api}/product/delete/${selectedProduct._id}`, {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
        withCredentials: true,
      })

      if (response.data.success) {
        if (selectedProduct.Images) {
          await deleteImageFromCloudinary(selectedProduct.Images)
        }
        toast.success('Product deleted successfully')
        
        // Remove deleted product from current products
        setProducts(prev => prev.filter(p => p._id !== selectedProduct._id))
        setTotalProducts(prev => prev - 1)
        
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
    // Refresh the list by fetching from page 1
    setProducts([])
    setCurrentPage(1)
    setHasMore(true)
    fetchProducts(1, true)
    setSelectedProduct(null)
  }

  // Calculate stats from all loaded products
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
            Browse and manage your product catalog • Page {currentPage} of {totalPages} • Showing {filteredProducts.length} of {totalProducts} products
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Products</p>
                  <p className="text-3xl font-bold">{totalProducts}</p>
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
        {filteredProducts.length === 0 && !loading ? (
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
          <>
            <div className={`grid gap-6 ${viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
              }`}>
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  ref={index === filteredProducts.length - 1 ? lastProductElementRef : null}
                >
                  <ProductCard
                    product={product}
                    index={index}
                    viewMode={viewMode}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onView={handleViewProduct}
                  />
                </div>
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
                <span className="text-slate-600">Loading more products...</span>
              </div>
            )}

            {/* End of Results Indicator */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">You've reached the end of the list</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 py-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || loading}
                  className="border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToSpecificPage(1)}
                        className={currentPage === 1 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "border-slate-200 hover:bg-slate-50"
                        }
                      >
                        1
                      </Button>
                      {currentPage > 4 && <span className="text-slate-400">...</span>}
                    </>
                  )}

                  {/* Current page and surrounding pages */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    if (pageNum < 1 || pageNum > totalPages) return null

                    // Skip if we already showed page 1
                    if (pageNum === 1 && currentPage > 3) return null

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToSpecificPage(pageNum)}
                        disabled={loading}
                        className={currentPage === pageNum 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "border-slate-200 hover:bg-slate-50"
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && totalPages > 5 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="text-slate-400">...</span>}
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToSpecificPage(totalPages)}
                        className={currentPage === totalPages 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "border-slate-200 hover:bg-slate-50"
                        }
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || loading}
                  className="border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
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