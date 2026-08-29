import React, { useState, useEffect } from "react";
import { Image } from "@/components/ui/image";

/** LIFE-identiteit foto's — de foam/fashion-sessie. Cross-fade rotatie als
 *  hero-achtergrond voor LIFE-pagina's (AdminPage, LifeLanding). */
const PHOTOS = [
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/62d7ca434_Creating_fashion_photo_with_refe_202608281558.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/8e7fba58a_Yellow_foam_fashion_portrait_2K_202608281333.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/de7b6720c_Create_editorial_design_photo_2K_202608281331.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ed3823950_Create_yellow_and_green_fashion_202608281715.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1bd49082e_Fashion_close-up_with_foam_blocks_202608281717.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/17acce00e_Fashion_photo_in_yellow_foam_202608281403.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/b635483b0_Make_editorial_design_photo_2K_202608281331.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/6d5569499_Make_editorial_fashion_photo_2K_2026082813331.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/7401050f3_Make_editorial_fashion_photo_2K_202608281333.jpeg",
];

export default function LifeHeroPhoto({ className = "", intervalMs = 7000 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PHOTOS.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {PHOTOS.map((src, i) => (
        <Image
          key={src}
          src={src}
          fittingType="fill"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full transition-opacity duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}
    </div>
  );
}