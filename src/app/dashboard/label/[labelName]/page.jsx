'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search,
  Calendar,
  Package,
  Grid3X3,
  List,
  Save,
  X,
  Folder
} from 'lucide-react'

const api = process.env.NEXT_PUBLIC_API_URL

export default function CategoryPage({ params }) {
    const [categories, setCategories] = useState([])
    const [filteredCategories, setFilteredCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [editId, setEditId] = useState(null)
    const [editName, setEditName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState('grid')
    const [addingCategory, setAddingCategory] = useState(false)
    
    const labelName = decodeURIComponent(params.labelName)
    const labelId = labelName.split('=')[1];
    const label = labelName.split('=')[0];
    const router = useRouter()

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${api}/categroy?labelId=${labelId}`, {
                withCredentials: true,
            })

            if (res.data.success) {
                setCategories(res.data.categories)
                setFilteredCategories(res.data.categories)
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err)
            toast.error('Failed to fetch categories')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (labelId) fetchCategories()
    }, [labelId])

    useEffect(() => {
        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredCategories(filtered)
    }, [searchTerm, categories])

    const handleAdd = async () => {
        if (!name.trim()) return toast.error('Category name is required')

        setAddingCategory(true)
        try {
            const res = await axios.post(`${api}/categroy/add`, { name, labelId }, { withCredentials: true })
            if (res.data.success) {
                toast.success('Category added successfully')
                setName('')
                fetchCategories()
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add category')
        } finally {
            setAddingCategory(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return

        try {
            await axios.delete(`${api}/categroy/delete/${id}`, { withCredentials: true })
            toast.success('Category deleted successfully')
            fetchCategories()
        } catch (err) {
            toast.error('Failed to delete category')
        }
    }

    const handleUpdate = async () => {
        if (!editName.trim()) return toast.error('Name required')

        try {
            const res = await axios.put(`${api}/categroy/update/${editId}`, { name: editName }, { withCredentials: true })
            if (res.data.success) {
                toast.success('Category updated successfully')
                setEditId(null)
                setEditName('')
                fetchCategories()
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Update failed')
        }
    }

    const totalProducts = categories.reduce((sum, category) => sum + category.products.length, 0)

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="p-6 max-w-7xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="mb-8">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    
                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {[...Array(2)].map((_, i) => (
                            <Card key={i} className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-8 w-16" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="border-0 shadow-lg">
                                <CardHeader className="pb-3">
                                    <Skeleton className="h-6 w-3/4" />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="flex gap-2 pt-2">
                                        <Skeleton className="h-8 w-16" />
                                        <Skeleton className="h-8 w-16" />
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                            <Folder className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            {label} Categories
                        </h1>
                    </div>
                    <p className="text-slate-600 text-lg">
                        Manage categories for the {label} label
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Total Categories</p>
                                    <p className="text-3xl font-bold">{categories.length}</p>
                                </div>
                                <div className="p-3 bg-emerald-400/30 rounded-full">
                                    <Folder className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Products</p>
                                    <p className="text-3xl font-bold">{totalProducts}</p>
                                </div>
                                <div className="p-3 bg-blue-400/30 rounded-full">
                                    <Package className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Category Section */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <Plus className="w-5 h-5" />
                            Add New Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Input
                                placeholder="Enter category name..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <Button 
                                onClick={handleAdd}
                                disabled={addingCategory || !name.trim()}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                            >
                                {addingCategory ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Category
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Category Section */}
                {editId && (
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-amber-50 mb-8 border-orange-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-900">
                                <Edit3 className="w-5 h-5" />
                                Edit Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Edit category name..."
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                                />
                                <Button 
                                    onClick={handleUpdate}
                                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Update
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setEditId(null)
                                        setEditName('')
                                    }}
                                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white/80 backdrop-blur-sm"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="bg-emerald-500 hover:bg-emerald-600"
                        >
                            <Grid3X3 className="w-4 h-4 mr-2" />
                            Grid
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="bg-emerald-500 hover:bg-emerald-600"
                        >
                            <List className="w-4 h-4 mr-2" />
                            List
                        </Button>
                    </div>
                </div>

                {/* Categories Grid/List */}
                {filteredCategories.length === 0 ? (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-12 text-center">
                            <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4">
                                <Folder className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {categories.length === 0 ? 'No categories yet' : 'No categories found'}
                            </h3>
                            <p className="text-slate-500">
                                {categories.length === 0 
                                    ? 'Create your first category to get started organizing your products.' 
                                    : 'Try adjusting your search terms.'
                                }
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                            : 'grid-cols-1'
                    }`}>
                        {filteredCategories.map((category, index) => (
                            <Card
                                key={category._id}
                                className={`group border-0 shadow-lg transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm ${
                                    viewMode === 'grid' ? 'hover:scale-105' : ''
                                }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                            {category.name}
                                        </CardTitle>
                                        <div className={`w-3 h-3 rounded-full ${
                                            index % 6 === 0 ? 'bg-emerald-500' :
                                            index % 6 === 1 ? 'bg-blue-500' :
                                            index % 6 === 2 ? 'bg-purple-500' :
                                            index % 6 === 3 ? 'bg-orange-500' :
                                            index % 6 === 4 ? 'bg-pink-500' : 'bg-teal-500'
                                        }`} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <Badge 
                                            variant="secondary" 
                                            className="bg-emerald-100 text-emerald-700 font-medium"
                                        >
                                            <Package className="w-3 h-3 mr-1" />
                                            {category.products.length} Products
                                        </Badge>
                                        <div className="flex items-center text-xs text-slate-500">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(category.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditId(category._id)
                                                setEditName(category.name)
                                            }}
                                            className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                        >
                                            <Edit3 className="w-3 h-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(category._id)}
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                router.push(
                                                    `/dashboard/label/${labelName}/${category._id}`
                                                )
                                            }}
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}