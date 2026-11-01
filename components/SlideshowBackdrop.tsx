"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// All slideshow images
const slideshowImages = [
  "/slideshow/adrien-olichon-Lu5DaTljjQk-unsplash.jpg",
  "/slideshow/alberto-domingo-carreiro-tXZK-YLlwcE-unsplash.jpg",
  "/slideshow/ali-aziz-FZ7yMBQCFXM-unsplash.jpg",
  "/slideshow/arya-jalundhwala-yWwteltnrQ0-unsplash.jpg",
  "/slideshow/atai-anarbek-I9abQT6ZEY4-unsplash copy.jpg",
  "/slideshow/atai-anarbek-I9abQT6ZEY4-unsplash.jpg",
  "/slideshow/august-togbor-Il8XxCdrikE-unsplash.jpg",
  "/slideshow/aurora-song-BANLfSTwRn8-unsplash.jpg",
  "/slideshow/aysenur-yavuz-M9xbifuUzqg-unsplash.jpg",
  "/slideshow/azim-khan-ronnie-75Ll-RX_FVk-unsplash.jpg",
  "/slideshow/brayden-law-YF5BVpIN55Q-unsplash.jpg",
  "/slideshow/chicagofreezeframe-0c5cBcBpxaU-unsplash.jpg",
  "/slideshow/christian-teo-gexDVNEWdJM-unsplash.jpg",
  "/slideshow/claudio-schwarz-iwa6O8mi_Aw-unsplash.jpg",
  "/slideshow/clay-banks-mRkH4J_TopI-unsplash.jpg",
  "/slideshow/clay-banks-xrjx6nX3Mp4-unsplash.jpg",
  "/slideshow/declan-sun-0VblOSGEatQ-unsplash.jpg",
  "/slideshow/declan-sun-GSVnBMh1syA-unsplash.jpg",
  "/slideshow/declan-sun-IWmM2QrZO8U-unsplash.jpg",
  "/slideshow/declan-sun-K3gjkot3hKo-unsplash.jpg",
  "/slideshow/declan-sun-XvRK1lrBRZk-unsplash.jpg",
  "/slideshow/declan-sun-udA8QBTYrzE-unsplash.jpg",
  "/slideshow/denis-5rWF4x3ZvXI-unsplash.jpg",
  "/slideshow/dmitry-kropachev-5Hy-QAKV0to-unsplash.jpg",
  "/slideshow/dmitry-kropachev-EsJhvz6qUo8-unsplash.jpg",
  "/slideshow/dominik-mattern-Ub3jIOOUJmg-unsplash.jpg",
  "/slideshow/ela-de-pure-JFzFeBEW1x4-unsplash.jpg",
  "/slideshow/ela-de-pure-OqeOKcE-HEw-unsplash.jpg",
  "/slideshow/ela-de-pure-Wr17JqDpuWw-unsplash.jpg",
  "/slideshow/federico-bagattoni-KXr6_oSkIj4-unsplash.jpg",
  "/slideshow/firli-s-rG3BaxwFqj4-unsplash.jpg",
  "/slideshow/frank-huang-ziEKw11ck_U-unsplash.jpg",
  "/slideshow/fujiphilm-SJjuRdmo5AE-unsplash.jpg",
  "/slideshow/guanghao-zhang-PEtzRlQ_gdg-unsplash.jpg",
  "/slideshow/haberdoedas-aL_6vg3SGrU-unsplash.jpg",
  "/slideshow/iker-merodio-HLsDuaMXrMc-unsplash.jpg",
  "/slideshow/joey-zhou-PpPyv7xeS78-unsplash.jpg",
  "/slideshow/josh-marty-5Aqf7PWX_lA-unsplash.jpg",
  "/slideshow/karsten-winegeart-n4H-i0eu280-unsplash.jpg",
  "/slideshow/kc-shum-9O3tbPRl8To-unsplash.jpg",
  "/slideshow/kris-tian-XbUY2Ra2P-8-unsplash.jpg",
  "/slideshow/kris-tian-cL1tqNE03Ks-unsplash.jpg",
  "/slideshow/kris-tian-gGi6Ya4TqGw-unsplash.jpg",
  "/slideshow/kris-tian-gUSmLfOC_Xc-unsplash.jpg",
  "/slideshow/kris-tian-h0A62XK0EbY-unsplash.jpg",
  "/slideshow/kris-tian-y7jf-b3Lmvk-unsplash.jpg",
  "/slideshow/kseniia-poroshkova-AwEt8iWIKtI-unsplash.jpg",
  "/slideshow/kshiraj-vij-xIJRwAaxwZo-unsplash.jpg",
  "/slideshow/leo-tang-e30DonUn83Y-unsplash.jpg",
  "/slideshow/liosha-shyp-TprYnCugnqs-unsplash.jpg",
  "/slideshow/liosha-shyp-pdGrQOGxW3c-unsplash.jpg",
  "/slideshow/luis-perez-SqAEkMSt8TQ-unsplash.jpg",
  "/slideshow/manuel-szkolnik-B8nk3gdYiDs-unsplash.jpg",
  "/slideshow/martijn-vonk-Mv6EKtn02VA-unsplash.jpg",
  "/slideshow/maurits-bausenhart-rs9iMJReZSs-unsplash.jpg",
  "/slideshow/ming-ZeVxGE6HJuw-unsplash.jpg",
  "/slideshow/nikita-pishchugin--oGEz5F7qiU-unsplash.jpg",
  "/slideshow/nikoleta-marcinekova-kBxtLVMGGh8-unsplash.jpg",
  "/slideshow/norbert-buduczki-SNXkLg2Si4Y-unsplash.jpg",
  "/slideshow/pang-yuhao-k7NzPqnbFYA-unsplash.jpg",
  "/slideshow/paolo-bici-HpZI1lxCYv4-unsplash.jpg",
  "/slideshow/peyton-carroll-zeUfKSpXf3Q-unsplash.jpg",
  "/slideshow/phoenix-williams-R94IHLZqfaA-unsplash.jpg",
  "/slideshow/r-c-QO9d5cqXC3g-unsplash.jpg",
  "/slideshow/rafael-peier-C7ArKURGtIM-unsplash.jpg",
  "/slideshow/raul-mermans-garcia-opOmCQVgfnc-unsplash.jpg",
  "/slideshow/ryan-le-on2OF-X9E7E-unsplash.jpg",
  "/slideshow/sawyer-griffin-a5H5OciZsqI-unsplash.jpg",
  "/slideshow/sebastian-schuster-PBESRpF_2BI-unsplash.jpg",
  "/slideshow/sijmen-van-hooff-XwoVdWOoqj4-unsplash.jpg",
  "/slideshow/simone-hutsch-OIaG4gZmpXE-unsplash.jpg",
  "/slideshow/stavrialena-gontzou-mzF4-t4Fbuo-unsplash.jpg",
  "/slideshow/taylor-friehl-MiWVpZaXZe4-unsplash.jpg",
  "/slideshow/tobias-reich-A1-mvASloGI-unsplash.jpg",
  "/slideshow/uliana-semenova-Vr4G1jnU9IU-unsplash.jpg",
  "/slideshow/vadim-yefremov-oB75PFnYddg-unsplash.jpg",
  "/slideshow/valentino-mazzariello-lv03t8X9o7E-unsplash.jpg",
  "/slideshow/weijia-di-V6pFAyi32wA-unsplash.jpg",
  "/slideshow/yucel-m-rc92JFOnH6k-unsplash.jpg",
];

export function SlideshowBackdrop() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    // Preload first 10 images immediately, then preload the rest gradually
    const preloadImages = async () => {
      for (let i = 0; i < Math.min(10, slideshowImages.length); i++) {
        const img = document.createElement('img');
        img.src = slideshowImages[i];
        await new Promise<void>((resolve) => {
          img.onload = () => {
            setLoadedImages((prev) => new Set([...prev, i]));
            resolve();
          };
          img.onerror = () => {
            setLoadedImages((prev) => new Set([...prev, i]));
            resolve();
          };
        });
      }

      // Preload remaining images in background
      for (let i = 10; i < slideshowImages.length; i++) {
        const img = document.createElement('img');
        img.src = slideshowImages[i];
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, i]));
        };
        img.onerror = () => {
          setLoadedImages((prev) => new Set([...prev, i]));
        };
      }
    };

    preloadImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 8000); // Change image every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const nextIndex = (currentIndex + 1) % slideshowImages.length;
  const isCurrentLoaded = loadedImages.has(currentIndex);
  const isNextLoaded = loadedImages.has(nextIndex);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Current image */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isCurrentLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image
          src={slideshowImages[currentIndex]}
          alt=""
          fill
          className="object-cover"
          priority={currentIndex === 0}
          quality={85}
          sizes="100vw"
        />
      </div>

      {/* Next image (for crossfade) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isNextLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ opacity: 0 }}
      >
        <Image
          src={slideshowImages[nextIndex]}
          alt=""
          fill
          className="object-cover"
          quality={85}
          sizes="100vw"
        />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/50" />
    </div>
  );
}
