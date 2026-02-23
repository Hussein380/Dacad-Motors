import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  MessageSquare,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layout } from '@/components/common/Layout';
import { LazyImage } from '@/components/common/LazyImage';
import { Skeleton } from '@/components/common/Skeleton';
import { getCars, deleteCar } from '@/services/carService';
import { getInquiries, updateInquiry } from '@/services/inquiryService';
import { AdminCarModal } from '@/components/admin/AdminCarModal';
import type { Car as CarType, Inquiry } from '@/types';

const statusConfig: Record<Inquiry['status'], { label: string; color: string; icon: any }> = {
  New: { label: 'New', color: 'bg-warning/10 text-warning', icon: Clock },
  Contacted: { label: 'Contacted', color: 'bg-accent/10 text-accent', icon: MessageSquare },
  Scheduled: { label: 'Scheduled', color: 'bg-success/10 text-success', icon: CalendarDays },
  Sold: { label: 'Sold', color: 'bg-success text-success-foreground', icon: ShieldCheck },
  Closed: { label: 'Closed', color: 'bg-muted text-muted-foreground', icon: X },
};

export default function Admin() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [carPage, setCarPage] = useState(1);
  const [carTotal, setCarTotal] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [carsData, inquiriesData] = await Promise.all([
        getCars({ limit: 100, page: 1 } as any),
        getInquiries(),
      ]);
      setCars(carsData.cars);
      setCarTotal(carsData.total);
      setCarPage(1);
      setInquiries(inquiriesData);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreCars = async () => {
    const nextPage = carPage + 1;
    setIsLoadingCars(true);
    try {
      const carsData = await getCars({ limit: 24, page: nextPage } as any);
      setCars(prev => [...prev, ...carsData.cars]);
      setCarPage(nextPage);
    } finally {
      setIsLoadingCars(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCar = () => {
    setSelectedCar(null);
    setIsModalOpen(true);
  };

  const handleEditCar = (car: CarType) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleDeleteCar = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      const success = await deleteCar(id);
      if (success) {
        loadData();
      }
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: Inquiry['status']) => {
    const updated = await updateInquiry(id, { status });
    if (updated) {
      loadData();
    }
  };

  const stats = [
    {
      label: 'Total Cars',
      value: carTotal,
      icon: Car,
      change: '+2 this month',
    },
    {
      label: 'Active Inquiries',
      value: inquiries.filter(i => i.status !== 'Closed' && i.status !== 'Sold').length,
      icon: MessageSquare,
      change: '+12 new leads',
    },
    {
      label: 'Inventory Value',
      value: formatPrice(cars.reduce((sum, c) => sum + (c.salePrice || 0), 0)),
      icon: DollarSign,
      change: '+8% from last month',
    },
    {
      label: 'Potential Customers',
      value: new Set(inquiries.map(i => i.email)).size,
      icon: Users,
      change: '+5 new customers',
    },
  ];

  const filteredCars = cars.filter(car =>
    car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInquiries = inquiries.filter(inquiry =>
    inquiry.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inquiry.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inquiry.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your inventory and inquiries</p>
          </div>
          <Button
            className="gradient-accent text-accent-foreground border-0"
            onClick={handleAddCar}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Car
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-success mt-1">{stat.change}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search cars, inquiries, customers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inquiries" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="cars">Inventory</TabsTrigger>
          </TabsList>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </Card>
                ))
              ) : filteredInquiries.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">No inquiries found</Card>
              ) : (
                filteredInquiries.map((inquiry) => {
                  const statusInfo = statusConfig[inquiry.status];
                  return (
                    <motion.div
                      key={inquiry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground truncate">{inquiry.id}</p>
                            <p className="font-semibold text-sm">{inquiry.carName}</p>
                          </div>
                          <Badge className={statusInfo.color} variant="secondary">
                            <statusInfo.icon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm font-medium">{inquiry.customerName}</p>
                          <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                          <p className="text-xs text-muted-foreground">{inquiry.phone}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">{inquiry.type}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Message
                              </DropdownMenuItem>
                              {inquiry.status === 'New' && (
                                <DropdownMenuItem onClick={() => handleUpdateInquiryStatus(inquiry.id, 'Contacted')}>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Mark Contacted
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleUpdateInquiryStatus(inquiry.id, 'Sold')}>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Mark as SOLD
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateInquiryStatus(inquiry.id, 'Closed')}>
                                <X className="w-4 h-4 mr-2" />
                                Close
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Inquiry</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Type</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border">
                          <td className="p-4" colSpan={5}>
                            <Skeleton className="h-12 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No inquiries found
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((inquiry) => {
                        const statusInfo = statusConfig[inquiry.status];
                        return (
                          <motion.tr
                            key={inquiry.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-border hover:bg-secondary/50 transition-colors"
                          >
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-xs text-muted-foreground">{inquiry.id}</p>
                                <p className="font-medium">{inquiry.carName}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm">{inquiry.customerName}</p>
                              <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                              <p className="text-xs text-muted-foreground">{inquiry.phone}</p>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              <Badge variant="outline">{inquiry.type}</Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={statusInfo.color} variant="secondary">
                                <statusInfo.icon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Message
                                  </DropdownMenuItem>
                                  {inquiry.status === 'New' && (
                                    <DropdownMenuItem onClick={() => handleUpdateInquiryStatus(inquiry.id, 'Contacted')}>
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Mark Contacted
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleUpdateInquiryStatus(inquiry.id, 'Sold')}>
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    Mark as SOLD
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateInquiryStatus(inquiry.id, 'Closed')}>
                                    <X className="w-4 h-4 mr-2" />
                                    Close
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </Card>
                ))
                : filteredCars.map((car, i) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="relative h-40">
                        <LazyImage
                          src={car.imageUrl}
                          alt={car.name}
                          className="w-full h-full object-cover"
                          wrapperClassName="h-full"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge
                            className={
                              car.available
                                ? 'bg-success text-success-foreground border-0'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {car.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-display font-semibold">{car.name}</h3>
                            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                              <span className="capitalize">{car.category}</span>
                              <span>•</span>
                              <span>{car.mileage?.toLocaleString()} km</span>
                              <span>•</span>
                              <span>{car.condition}</span>
                            </div>
                          </div>
                          <p className="font-bold text-accent">{formatPrice(car.salePrice || 0)}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditCar(car)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCar(car.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>

            {!isLoading && cars.length < carTotal && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={loadMoreCars}
                  disabled={isLoadingCars}
                >
                  {isLoadingCars ? 'Loading...' : 'Load More Cars'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AdminCarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          car={selectedCar}
          onSuccess={loadData}
        />
      </div>
    </Layout>
  );
}
