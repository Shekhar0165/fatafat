import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Activity, TrendingUp, Clock } from 'lucide-react';

const DeliveryStatsCards = ({ animatedStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Total Delivery Boys</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{animatedStats.total}</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Online Now</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{animatedStats.active}</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Total Deliveries</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{animatedStats.deliveries}</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Pending Orders</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{animatedStats.pending}</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
            <Clock className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default DeliveryStatsCards; 