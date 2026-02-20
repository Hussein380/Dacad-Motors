import * as React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { LazyImage } from "@/components/common/LazyImage";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
    images: string[];
    alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);

    React.useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    const scrollTo = (index: number) => {
        api?.scrollTo(index);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="space-y-3 sm:space-y-4 w-full min-w-0 overflow-hidden">
            <Carousel setApi={setApi} className="w-full min-w-0 relative group">
                <CarouselContent className="min-w-0">
                    {images.map((image, index) => (
                        <CarouselItem key={index}>
                            <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-muted">
                                <LazyImage
                                    src={image}
                                    alt={`${alt} - Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    wrapperClassName="h-full"
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {images.length > 1 && (
                    <>
                        <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 border-0 text-white hover:text-white" />
                        <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 border-0 text-white hover:text-white" />
                    </>
                )}

                {/* Progress Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all",
                                    current === index + 1 ? "bg-white w-4" : "bg-white/50"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </Carousel>

            {/* Thumbnails - scrollable on small screens, contained */}
            {images.length > 1 && (
                <div className="min-w-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={cn(
                                "relative flex-shrink-0 w-14 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all snap-start",
                                current === index + 1 ? "border-accent ring-2 ring-accent/20" : "border-transparent hover:border-accent/40"
                            )}
                        >
                            <img
                                src={image}
                                alt={`${alt} thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
}
