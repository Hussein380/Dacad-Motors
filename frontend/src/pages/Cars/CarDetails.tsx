import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Users, Fuel, Settings2, MapPin, Check, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/common/Layout';
import { Skeleton } from '@/components/common/Skeleton';
import { BookingForm } from '@/components/booking/BookingForm';
import { ImageGallery } from '@/components/cars/ImageGallery';
import { getCarById } from '@/services/carService';
import { formatPrice } from '@/lib/currency';
import type { Car } from '@/types';
import { InquiryForm } from '@/components/cars/InquiryForm';

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCar = async () => {
      if (!id) return;
      try {
        const data = await getCarById(id);
        setCar(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadCar();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Car Not Found</h2>
          <p className="text-muted-foreground mb-6">The car you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/cars">Browse All Cars</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const fuelLabels: Record<string, string> = {
    electric: 'Electric',
    hybrid: 'Hybrid',
    petrol: 'Petrol',
    diesel: 'Diesel',
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to="/cars">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cars
          </Link>
        </Button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Car Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Car Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <ImageGallery
                images={car.images && car.images.length > 0 ? car.images : [car.imageUrl]}
                alt={car.name}
              />

              {/* Status Badges - Overlay on top of gallery if needed, but gallery has its own padding/dots */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {car.available ? (
                  <Badge className="bg-success text-success-foreground border-0 shadow-sm">Available</Badge>
                ) : (
                  <Badge variant="secondary" className="shadow-sm">Unavailable</Badge>
                )}
                <Badge variant="outline" className="bg-card/80 backdrop-blur-sm capitalize shadow-sm">
                  {car.category}
                </Badge>
              </div>
            </motion.div>

            {/* Title & Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold">{car.name}</h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    {car.brand} {car.model} • {car.year}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="font-semibold">{car.rating}</span>
                  <span className="text-muted-foreground">({car.reviewCount} reviews)</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Specs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Users className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <p className="font-semibold">{car.seats} People</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Settings2 className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="font-semibold capitalize">{car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Fuel className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel</p>
                      <p className="font-semibold">{fuelLabels[car.fuelType]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <MapPin className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{car.location}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="font-display text-xl font-semibold">About This Car</h2>
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="font-display text-xl font-semibold">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {car.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50"
                  >
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-success" />
                <span>Fully insured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-success" />
                <span>24/7 support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                <span>{car.mileage}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Price Card */}
              {/* Price Card */}
              <Card className="p-6 text-center gradient-hero text-primary-foreground">
                <p className="text-sm text-primary-foreground/70">
                  Asking Price
                </p>
                <p className="font-display text-4xl font-bold">
                  {formatPrice(car.salePrice || 0)}
                </p>
              </Card>

              {/* Booking/Inquiry Form */}
              <div className="space-y-4">
                <a
                  href={`https://wa.me/254722344116?text=${encodeURIComponent(
                    `Hi, I'm interested in the ${car.brand} ${car.model} (${car.year}) priced at ${formatPrice(car.salePrice || 0)}. Is it still available?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-0 h-12 text-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Enquire via WhatsApp
                  </Button>
                </a>

                <InquiryForm car={car} />
                {!car.available && (
                  <Card className="p-6 text-center">
                    <h3 className="font-display font-semibold mb-2">Sold Out</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      This unit has already been sold.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/cars">Browse Other Cars</Link>
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
