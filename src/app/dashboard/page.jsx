'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Tag, TrendingUp, Filter, Grid3X3, List, Users, ShoppingCart, Package, Truck } from 'lucide-react'

const api = process.env.NEXT_PUBLIC_API_URL
console.log('API URL:', api)

export default function DashboardPage() {
  const [labels, setLabels] = useState([])
  const [filteredLabels, setFilteredLabels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const router = useRouter()

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await axios.get(`${api}/labels`, {
          withCredentials: true,
        })
        console.log('Fetched labels:', res.data)
        setLabels(res.data)
        setFilteredLabels(res.data)
      } catch (err) {
        console.error('Failed to fetch labels:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLabels()
  }, [])

  useEffect(() => {
    const filtered = labels.filter(label =>
      label.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredLabels(filtered)
  }, [searchTerm, labels])

  const totalCategories = labels.reduce((sum, label) => sum + (label.categories?.length || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-10 w-56 mb-3" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-10 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-12 w-full max-w-md" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl blur opacity-30"></div>
              <div className="relative p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl">
                <Tag className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                Manage your business operations with ease
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="group border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Labels</p>
                  <p className="text-3xl font-bold">{labels.length}</p>
                </div>
                <div className="p-3 bg-blue-400/30 rounded-xl backdrop-blur-sm">
                  <Tag className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Categories</p>
                  <p className="text-3xl font-bold">{totalCategories}</p>
                </div>
                <div className="p-3 bg-emerald-400/30 rounded-xl backdrop-blur-sm">
                  <Grid3X3 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Active Orders</p>
                  <p className="text-3xl font-bold">42</p>
                </div>
                <div className="p-3 bg-orange-400/30 rounded-xl backdrop-blur-sm">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden relative hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm font-medium mb-1">Delivery Boys</p>
                  <p className="text-3xl font-bold">8</p>
                </div>
                <div className="p-3 bg-rose-400/30 rounded-xl backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="group border-0 shadow-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden relative hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-12 -translate-x-12" />
            
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-indigo-100 text-sm font-medium">Shop Management</p>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Take Orders</h3>
                  
                  <Button
                    onClick={() => router.push('/dashboard/shop')}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-6 py-3"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Open Shop
                  </Button>
                </div>
                
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <TrendingUp className="w-8 h-8 text-indigo-100 group-hover:text-white transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 text-white overflow-hidden relative hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-12 -translate-x-12" />
            
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <p className="text-cyan-100 text-sm font-medium">Delivery Management</p>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Manage Delivery</h3>
                  
                  <Button
                    onClick={() => router.push('http://localhost:3000/dashboard/shop/delivery_boy')}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-6 py-3"
                  >
                    <Truck className="w-5 h-5 mr-2" />
                    Delivery Boys
                  </Button>
                </div>
                
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <Users className="w-8 h-8 text-cyan-100 group-hover:text-white transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Controls Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  placeholder="Search labels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border-slate-200 focus:border-violet-500 focus:ring-violet-500 bg-white/80 backdrop-blur-sm rounded-xl text-slate-700 placeholder-slate-400 shadow-lg"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg px-4 py-2 transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-violet-500 text-white shadow-lg hover:bg-violet-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg px-4 py-2 transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-violet-500 text-white shadow-lg hover:bg-violet-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>

              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:shadow-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Label
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Labels Grid/List */}
        {filteredLabels.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-16 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full blur opacity-50"></div>
                <div className="relative p-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No labels found</h3>
              <p className="text-slate-500 text-lg">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first label.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
            }`}>
            {filteredLabels.map((label, index) => (
              <Card
                key={label._id}
                className={`group border-0 shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden relative ${
                  viewMode === 'grid' ? 'hover:scale-105' : 'hover:scale-102'
                }`}
                onClick={() =>
                  router.push(`/dashboard/label/${encodeURIComponent(label.name)}=${label._id}`)
                }
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-10 translate-x-10 ${
                  index % 6 === 0 ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10' :
                  index % 6 === 1 ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10' :
                  index % 6 === 2 ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10' :
                  index % 6 === 3 ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10' :
                  index % 6 === 4 ? 'bg-gradient-to-br from-pink-500/20 to-pink-600/10' : 'bg-gradient-to-br from-teal-500/20 to-teal-600/10'
                }`} />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {label.name}
                    </CardTitle>
                    <div className={`w-4 h-4 rounded-full shadow-lg ${
                      index % 6 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      index % 6 === 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                      index % 6 === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      index % 6 === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      index % 6 === 4 ? 'bg-gradient-to-r from-pink-500 to-pink-600' : 'bg-gradient-to-r from-teal-500 to-teal-600'
                    }`} />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={`${
                        index % 6 === 0 ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        index % 6 === 1 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        index % 6 === 2 ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        index % 6 === 3 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        index % 6 === 4 ? 'bg-pink-100 text-pink-700 border-pink-200' : 'bg-teal-100 text-teal-700 border-teal-200'
                      } font-semibold px-3 py-1 rounded-lg shadow-sm`}
                    >
                      {label.categories?.length || 0} Categories
                    </Badge>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse shadow-lg" />
                    </div>
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