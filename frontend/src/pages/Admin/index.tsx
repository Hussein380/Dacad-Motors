import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowRight,
  ChevronRight
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

  // Inquiry message popup
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

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

  // Abbreviate large prices for compact display in stat cards
  const shortPrice = (amount: number) => {
    if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`;
    return `KES ${amount}`;
  };

  const stats = [
    {
      label: 'Total Catalog',
      value: carTotal,
      icon: Car,
      change: 'Total units in database',
    },
    {
      label: 'Sold Revenue',
      value: shortPrice(cars.filter(c => !c.available).reduce((sum, c) => sum + (c.salePrice || 0), 0)),
      icon: TrendingUp,
      change: 'Total value of cars sold',
    },
    {
      label: 'Inventory Value',
      value: shortPrice(cars.filter(c => c.available).reduce((sum, c) => sum + (c.salePrice || 0), 0)),
      icon: DollarSign,
      change: 'Value of current stock',
    },
    {
      label: 'Potential Customers',
      value: new Set(inquiries.map(i => i.email)).size,
      icon: Users,
      change: 'Unique reach so far',
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
    <Layout showFooter={false}>
      <div className="dark min-h-screen bg-background text-foreground">
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
                  <p className="font-display text-base sm:text-xl lg:text-2xl font-bold">{stat.value}</p>
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
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary/50 p-1 border border-border/50">
              <TabsTrigger value="inquiries" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Inquiries</TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Inventory</TabsTrigger>
            </TabsList>

            {/* Inquiries Tab */}
            <TabsContent value="inquiries">
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-24 w-full" />
                    </Card>
                  ))
                ) : filteredInquiries.length === 0 ? (
                  <Card className="p-10 text-center text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No inquiries yet</p>
                  </Card>
                ) : (
                  filteredInquiries.map((inquiry, idx) => {
                    const statusInfo = statusConfig[inquiry.status];
                    const initials = inquiry.customerName
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();
                    return (
                      <motion.div
                        key={inquiry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <Card
                          className={`overflow-hidden cursor-pointer hover:shadow-md active:scale-[0.99] transition-all ${inquiry.status === 'New' ? 'border-l-4 border-l-warning shadow-sm shadow-warning/20' : ''}`}
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          {/* Top: inquiry type + status badge */}
                          <div className="flex items-center justify-between px-4 pt-4 pb-3">
                            <div className="min-w-0 flex items-center gap-2">
                              {inquiry.status === 'New' && (
                                <span className="relative flex h-2 w-2 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-warning" />
                                </span>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{inquiry.type}</p>
                                  {inquiry.status === 'New' && (
                                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-warning text-warning-foreground uppercase tracking-wider">New</span>
                                  )}
                                </div>
                                <p className="font-semibold text-sm truncate">{inquiry.carName}</p>
                                {inquiry.carPrice && (
                                  <p className="text-xs font-bold text-accent mt-0.5">{formatPrice(inquiry.carPrice)}</p>
                                )}
                              </div>
                            </div>
                            <Badge className={`${statusInfo.color} shrink-0`} variant="secondary">
                              <statusInfo.icon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>

                          {/* Customer row */}
                          <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-accent-foreground">{initials}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm text-foreground">{inquiry.customerName}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {inquiry.email} · {inquiry.phone}
                              </p>
                            </div>
                          </div>

                          {/* Tap indicator footer */}
                          <div className="bg-accent/10 px-4 py-2 flex items-center justify-between border-t border-accent/20">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Tap for more details</span>
                            <ChevronRight className="w-3.5 h-3.5 text-accent" />
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
                        <th className="text-left p-4 font-medium text-muted-foreground">Inquiry Details</th>
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
                              onClick={() => setSelectedInquiry(inquiry)}
                              className={`border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer ${inquiry.status === 'New' ? 'border-l-4 border-l-warning bg-warning/5' : ''
                                }`}
                            >
                              <td className="p-4">
                                <div>
                                  <p className="font-medium">{inquiry.carName}</p>
                                  {inquiry.carPrice && (
                                    <p className="text-xs font-bold text-accent mt-0.5">{formatPrice(inquiry.carPrice)}</p>
                                  )}
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
                                    <DropdownMenuItem onClick={() => setSelectedInquiry(inquiry)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      See Customer Message
                                    </DropdownMenuItem>
                                    {inquiry.status === 'New' && (
                                      <DropdownMenuItem onClick={() => handleUpdateInquiryStatus(inquiry.id, 'Contacted')}>
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Mark as Contacted
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => handleUpdateInquiryStatus(inquiry.id, 'Sold')}>
                                      <ShieldCheck className="w-4 h-4 mr-2" />
                                      Car Was Sold ✓
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateInquiryStatus(inquiry.id, 'Closed')}>
                                      <X className="w-4 h-4 mr-2" />
                                      Customer Not Interested
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

            {/* Inventory Tab */}
            <TabsContent value="inventory">
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

          {/* Inquiry Message Popup */}
          <AnimatePresence>
            {selectedInquiry && (() => {
              const si = selectedInquiry as any;
              const statusInfo = statusConfig[selectedInquiry.status];
              const initials = selectedInquiry.customerName
                .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
              return (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedInquiry(null)}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 80 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-sm bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Drag handle (mobile only) */}
                    <div className="sm:hidden flex justify-center pt-3 pb-1">
                      <div className="w-10 h-1 rounded-full bg-border" />
                    </div>

                    {/* Gradient header */}
                    <div className="gradient-accent px-6 pt-4 pb-8 relative">
                      <button
                        onClick={() => setSelectedInquiry(null)}
                        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                      <Badge className="bg-white/20 text-white border-0 text-xs mb-3" variant="secondary">
                        <statusInfo.icon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{selectedInquiry.type}</p>
                      <h3 className="text-white font-display font-bold text-xl mt-0.5 leading-tight">
                        {selectedInquiry.carName}
                        {selectedInquiry.carPrice && (
                          <span className="block text-sm text-white/80 font-semibold mt-1">
                            Asking Price: {formatPrice(selectedInquiry.carPrice)}
                          </span>
                        )}
                      </h3>
                    </div>

                    {/* Avatar overlap */}
                    <div className="flex justify-center -mt-7 mb-3">
                      <div className="w-14 h-14 rounded-full gradient-accent ring-4 ring-card flex items-center justify-center shadow-lg">
                        <span className="text-lg font-bold text-accent-foreground">{initials}</span>
                      </div>
                    </div>

                    {/* Customer name + contact */}
                    <div className="text-center px-6 mb-4">
                      <p className="font-display font-bold text-lg">{selectedInquiry.customerName}</p>
                      <a href={`mailto:${selectedInquiry.email}`} className="text-xs text-accent hover:underline block mt-1">
                        {selectedInquiry.email}
                      </a>
                      <a href={`tel:${selectedInquiry.phone}`} className="text-xs text-muted-foreground hover:text-foreground block mt-0.5">
                        {selectedInquiry.phone}
                      </a>
                    </div>

                    {/* Message bubble */}
                    <div className="mx-5 mb-5 bg-secondary/50 rounded-2xl p-4 relative">
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-secondary/50 rotate-45 rounded-sm" />
                      <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Message</p>
                      <p className="text-sm leading-relaxed text-foreground">
                        {si.message || 'No message was included.'}
                      </p>
                    </div>

                    {/* Action buttons — Car Sold / Not Interested */}
                    <div className="flex gap-2 px-5 mb-3">
                      <button
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-success/40 bg-success/10 text-success text-xs font-semibold hover:bg-success/20 active:scale-95 transition-all"
                        onClick={() => { handleUpdateInquiryStatus(selectedInquiry.id, 'Sold'); setSelectedInquiry(null); }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Car Was Sold
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 active:scale-95 transition-all"
                        onClick={() => { handleUpdateInquiryStatus(selectedInquiry.id, 'Closed'); setSelectedInquiry(null); }}
                      >
                        <X className="w-3.5 h-3.5" />
                        Not Interested
                      </button>
                    </div>

                    {/* Reply buttons */}
                    <div className="px-5 pb-6 flex flex-col gap-2">
                      <a
                        href={`https://wa.me/${selectedInquiry.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#22c35e] active:scale-95 transition-all shadow-lg shadow-green-500/20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Reply on WhatsApp
                      </a>
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary active:scale-95 transition-all"
                      >
                        Reply by Email
                      </a>
                    </div>
                  </motion.div>
                </div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
