import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { Shop } from "@/lib/useShopData";

const overlayStyle: React.CSSProperties = {
  background:
    "linear-gradient(to bottom, rgba(10,10,10,0) 40%, rgba(10,10,10,0.95) 100%)",
};

function ShopName({ name }: { name: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="font-display absolute bottom-12 left-8 md:left-16 text-white z-10"
      style={{
        fontSize: "clamp(40px, 7vw, 72px)",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {name}
    </motion.h1>
  );
}

function SingleBannerHero({ src, name }: { src: string; name: string }) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <motion.img
        src={src}
        alt={name}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0" style={overlayStyle} />
      <ShopName name={name} />
    </section>
  );
}

function TwoBannerCarousel({ a, b, name }: { a: string; b: string; name: string }) {
  const banners = [a, b];
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="group relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={i}
          src={banners[i]}
          alt={name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 z-[1]" style={overlayStyle} />
      <ShopName name={name} />

      <button
        onClick={() => setI((p) => (p - 1 + banners.length) % banners.length)}
        className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-sm"
        aria-label="Previous"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => setI((p) => (p + 1) % banners.length)}
        className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-sm"
        aria-label="Next"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className="h-1.5 w-1.5 rounded-full transition-all"
            style={{
              backgroundColor: idx === i ? "var(--accent)" : "rgba(255,255,255,0.3)",
              transform: idx === i ? "scale(1.4)" : "scale(1)",
            }}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export function BannerSection({ shop }: { shop: Shop }) {
  const a = shop.banner_url_1;
  const b = shop.banner_url_2;
  if (a && b) return <TwoBannerCarousel a={a} b={b} name={shop.name} />;
  if (a) return <SingleBannerHero src={a} name={shop.name} />;
  return (
    <section className="relative h-screen w-full" style={{ backgroundColor: "var(--bg-2)" }}>
      <ShopName name={shop.name} />
    </section>
  );
}
