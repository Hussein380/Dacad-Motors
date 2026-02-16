import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Fuel, Settings2 } from 'lucide-react';
import { type Car } from '@/types';
import { LazyImage } from '@/components/common/LazyImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

interface CarCardProps {
  car: Car;
  index?: number;
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const fuelLabels: Record<string, string> = {
    electric: 'Electric',
    hybrid: 'Hybrid',
    petrol: 'Petrol',
    diesel: 'Diesel',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/cars/${car.id}`}>
        <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/50">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <LazyImage
              src={car.imageUrl}
              alt={car.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              wrapperClassName="h-full"
            />

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              {car.available ? (
                <Badge className="bg-success text-success-foreground border-0">Available</Badge>
              ) : (
                <Badge variant="secondary">Unavailable</Badge>
              )}
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-card/80 backdrop-blur-sm capitalize">
                {car.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title & Rating */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-semibold text-lg group-hover:text-accent transition-colors">
                  {car.name}
                </h3>
                <p className="text-sm text-muted-foreground">{car.year}</p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="font-medium">{car.rating}</span>
                <span className="text-muted-foreground">({car.reviewCount})</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{car.seats}</span>
              </div>
              <div className="flex items-center gap-1">
                <Settings2 className="w-4 h-4" />
                <span className="capitalize">{car.transmission}</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="w-4 h-4" />
                <span>{fuelLabels[car.fuelType]}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div>
                <span className="text-2xl font-display font-bold">
                  {car.salePrice ? formatPrice(car.salePrice) : formatPrice(car.rentPrice)}
                </span>
                {!car.salePrice && <span className="text-sm text-muted-foreground">/day</span>}
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/254722344116?text=${encodeURIComponent(
                    `Hi, I'm interested in the ${car.brand} ${car.model} (${car.year}) priced at ${car.salePrice ? formatPrice(car.salePrice) : formatPrice(car.rentPrice)
                    }${!car.salePrice ? '/day' : ''}. Is it still available?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-success/50 text-success hover:bg-success/10 hover:text-success shadow-sm"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </Button>
                </a>
                <Button
                  size="sm"
                  className={cn(
                    'shadow-sm',
                    car.available
                      ? 'gradient-accent text-accent-foreground border-0'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                  disabled={!car.available}
                >
                  {car.available ? 'Enquire' : 'Unavailable'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
