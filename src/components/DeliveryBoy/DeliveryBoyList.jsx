import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Power, UserMinus, Star } from 'lucide-react';

const DeliveryBoyList = ({
  filteredDeliveryBoys,
  selectedDeliveryBoy,
  setSelectedDeliveryBoy,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  toggleOnlineStatus,
  handleRemoveDeliveryBoy
}) => (
  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold">Delivery Team</CardTitle>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {filteredDeliveryBoys.length} members
        </Badge>
      </div>
      {/* Search and Filter */}
      <div className="space-y-3 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search delivery boys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'online' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('online')}
            className="flex-1"
          >
            Online
          </Button>
          <Button
            variant={filterStatus === 'offline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('offline')}
            className="flex-1"
          >
            Offline
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="max-h-[600px] overflow-y-auto">
        {filteredDeliveryBoys.map((boy) => (
          <div
            key={boy.id}
            className={`p-4 border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer ${selectedDeliveryBoy?.id === boy.id ? 'bg-blue-50/50 border-blue-200' : ''}`}
            onClick={() => setSelectedDeliveryBoy(boy)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={boy.avatar}
                    alt={boy.name}
                    className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${boy.isOnline ? 'bg-green-500' : 'bg-slate-400'}`} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{boy.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                      <span className="text-xs text-slate-600">{boy.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOnlineStatus(boy.id);
                  }}
                  className={`p-1 h-8 w-8 ${boy.isOnline ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <Power size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDeliveryBoy(boy);
                  }}
                  className="p-1 h-8 w-8 text-red-600 hover:bg-red-50"
                >
                  <UserMinus size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default DeliveryBoyList; 