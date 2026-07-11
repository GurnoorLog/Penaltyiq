"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Rewind, FastForward } from "lucide-react";

export interface CarouselItem {
  id: number;
  title: string;
}

const RulerLines = ({
  top = true,
  totalLines = 100,
}: {
  top?: boolean;
  totalLines?: number;
}) => {
  const lines = [];
  const lineSpacing = 100 / (totalLines - 1);

  for (let i = 0; i < totalLines; i++) {
    const isFifth = i % 5 === 0;
    const isCenter = i === Math.floor(totalLines / 2);

    let height = "h-3";
    let color = "bg-gray-500 dark:bg-gray-400";

    if (isCenter) {
      height = "h-8";
      color = "bg-primary dark:bg-white";
    } else if (isFifth) {
      height = "h-4";
      color = "bg-primary dark:bg-white";
    }

    const positionClass = top ? "" : "bottom-0";

    lines.push(
      <div
        key={i}
        className={`absolute w-0.5 ${height} ${color} ${positionClass}`}
        style={{ left: `${i * lineSpacing}%` }}
      />
    );
  }

  return <div className="relative w-full h-8 px-4">{lines}</div>;
};

export function RulerCarousel({
  originalItems,
  onSelect,
}: {
  originalItems: CarouselItem[];
  onSelect?: (item: CarouselItem) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const itemsPerSet = originalItems.length;

  // Create 3 copies for infinite scroll
  const infiniteItems: (CarouselItem & { key: string; originalIndex: number })[] = [];
  for (let i = 0; i < 3; i++) {
    originalItems.forEach((item, index) => {
      infiniteItems.push({ ...item, key: `${i}-${item.id}`, originalIndex: index });
    });
  }

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Start with the middle copy
  useEffect(() => {
    setActiveIndex(itemsPerSet);
  }, [itemsPerSet]);

  const handleItemClick = (newIndex: number) => {
    if (isResetting) return;
    const targetOrig = newIndex % itemsPerSet;
    const possible = [
      targetOrig,
      targetOrig + itemsPerSet,
      targetOrig + itemsPerSet * 2,
    ];
    let closest = possible[0];
    let minDist = Math.abs(possible[0] - activeIndex);
    for (const idx of possible) {
      const d = Math.abs(idx - activeIndex);
      if (d < minDist) { minDist = d; closest = idx; }
    }
    setActiveIndex(closest);
  };

  const handlePrevious = () => {
    if (isResetting) return;
    setActiveIndex((p) => p - 1);
  };

  const handleNext = () => {
    if (isResetting) return;
    setActiveIndex((p) => p + 1);
  };

  // Infinite scroll jump
  useEffect(() => {
    if (isResetting) return;
    if (activeIndex < itemsPerSet) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex + itemsPerSet);
        setIsResetting(false);
      }, 0);
    } else if (activeIndex >= itemsPerSet * 2) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex - itemsPerSet);
        setIsResetting(false);
      }, 0);
    }
  }, [activeIndex, itemsPerSet, isResetting]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isResetting) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); setActiveIndex((p) => p - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); setActiveIndex((p) => p + 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isResetting]);

  const itemWidth = 500; // 400px width + 100px gap
  const totalWidth = infiniteItems.length * itemWidth;
  const activePos = activeIndex % itemsPerSet;
  // Center the active item in the viewport
  const targetX = containerWidth > 0
    ? containerWidth / 2 - itemsPerSet * itemWidth / 2 - (activeIndex - activePos) * itemWidth
    : -(activeIndex * itemWidth);

  const activeItem = originalItems[activeIndex % itemsPerSet];
  const currentPage = activePos + 1;
  const totalPages = itemsPerSet;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-background dark:bg-black" ref={containerRef}>
      <div className="w-full h-[200px] flex flex-col justify-center relative">
        <div className="flex items-center justify-center">
          <RulerLines top />
        </div>
        <div className="flex items-center justify-center w-full h-full relative overflow-hidden">
          <motion.div
            className="flex items-center gap-[100px]"
            animate={{ x: targetX }}
            transition={
              isResetting
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 20, mass: 1 }
            }
          >
            {infiniteItems.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <motion.button
                  key={item.key}
                  onClick={() => handleItemClick(index)}
                  className={`text-4xl md:text-6xl font-bold whitespace-nowrap cursor-pointer flex items-center justify-center ${
                    isActive
                      ? "text-primary dark:text-white"
                      : "text-muted-foreground dark:text-gray-500 hover:text-foreground dark:hover:text-gray-400"
                  }`}
                  animate={{
                    scale: isActive ? 1 : 0.75,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={
                    isResetting
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 400, damping: 25 }
                  }
                  style={{ width: "400px" }}
                >
                  {item.title}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
        <div className="flex items-center justify-center">
          <RulerLines top={false} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={handlePrevious}
          disabled={isResetting}
          className="flex items-center justify-center cursor-pointer"
          aria-label="Previous item"
        >
          <Rewind className="w-5 h-5 text-primary/80" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground dark:text-gray-400">
            {currentPage}
          </span>
          <span className="text-sm text-muted-foreground dark:text-gray-500">/</span>
          <span className="text-sm font-medium text-muted-foreground dark:text-gray-400">
            {totalPages}
          </span>
        </div>

        <button
          onClick={handleNext}
          disabled={isResetting}
          className="flex items-center justify-center cursor-pointer"
          aria-label="Next item"
        >
          <FastForward className="w-5 h-5 text-primary/80" />
        </button>
      </div>

      <button
        onClick={() => onSelect?.(activeItem)}
        className="mt-12 px-10 py-4 bg-gold text-on-primary-fixed font-bold rounded-xl text-lg hover:shadow-2xl hover:shadow-gold/30 active:scale-95 transition-all"
      >
        Confirm Selection
      </button>
    </div>
  );
}
