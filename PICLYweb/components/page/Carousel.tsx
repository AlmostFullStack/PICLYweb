import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import nextImg from "@/public/assets/images/arrow_forward.svg";
import prevImg from "@/public/assets/images/arrow_back.svg";
import LoadingPage from "./LoadingPage";
import { Album } from "@/templates/Album";
const Action = ({ prev, next }: { prev: () => void; next: () => void }) => {
  const arrowClassName =
    "fixed top-1/2 -translate-y-1/2 lg:w-12 lg:h-12 h-full w-24 lg:opacity-60 lg:visible invisible cursor-pointer";
  return (
    <>
      <Image
        className={`${arrowClassName} lg:left-4 left-0`}
        src={prevImg}
        alt="prev"
        width={0}
        height={0}
        sizes="100vw"
        onClick={prev}
      />
      <Image
        className={`${arrowClassName} lg:right-4 right-0`}
        src={nextImg}
        alt="next"
        width={0}
        height={0}
        sizes="100vw"
        onClick={next}
      />
    </>
  );
};
const Indicators = ({
  steps,
  activeIndex,
  onClickHandler,
}: {
  steps: number;
  activeIndex: number;
  onClickHandler: (newIndex: number) => void;
}) => {
  const [clientSide, setClientSide] = useState<boolean>(false);
  useEffect(() => {
    if (window != null) setClientSide(true);
  });
  const indicators = [];
  for (let i = 0; i < steps; i++) {
    indicators.push(
      <span
        key={i}
        className={`w-8 h-2 rounded-md ${
          activeIndex == i ? "bg-slate-100" : "bg-slate-400"
        } cursor-pointer`}
        onClick={() => onClickHandler(i)}
      ></span>
    );
  }

  return (
    <div className="(mask) fixed bottom-5 lg:w-min w-[224px] h-min left-1/2 -translate-x-1/2 overflow-hidden">
      <div
        className={`w-min h-min flex gap-3 justify-center lg:transition-none transition-all duration-[250ms]`}
        style={{
          transform:
            clientSide &&
            window.matchMedia("screen and (min-width: 1024px)").matches
              ? "translate(0,0)"
              : steps < 6
                ? `translate(${118 - 22 * steps}px,0)`
                : `translate(${
                    activeIndex <= 1
                      ? 8
                      : activeIndex >= steps - 2
                        ? -44 * (steps - 3) + 96
                        : -44 * activeIndex + 96
                  }px, 0px)`,
        }}
      >
        {...indicators}
      </div>
    </div>
  );
};
const Carousel = ({ album }: { album: Album }) => {
  const steps = album.imageURLs.length;
  //useState
  const [activeIndex, setActiveIndex] = useState<number>(0);
  //useRef
  const screenRef = useRef<HTMLDivElement>(null);
  const isScrollListenerAdded = useRef<boolean>(false);
  const activeImgRef = useRef<HTMLDivElement>(null);
  const timerRef: { current: NodeJS.Timeout | null } = useRef(null);
  //bool
  const singlePic = album.imageURLs.length === 1;

  //useEffect
  useEffect(() => {
    const container = screenRef.current;
    if (container && !isScrollListenerAdded.current) {
      container.addEventListener("scroll", updateIndicatorOnScroll);
      isScrollListenerAdded.current = true;
      return () => {
        container.removeEventListener("scroll", updateIndicatorOnScroll);
        isScrollListenerAdded.current = false;
      };
    }
  }, [screenRef.current]);
  useEffect(() => {
    if (activeImgRef.current) {
      activeImgRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  //functions
  const next = () => {
    const nextIndex = activeIndex === steps - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };
  const prev = () => {
    const nextIndex = activeIndex === 0 ? steps - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };
  const goToIndex = (newIndex: number) => {
    setActiveIndex(newIndex);
  };
  const updateIndicatorOnScroll = () => {
    // console.log(screenRef.current?.scrollLeft);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (screenRef.current) {
        const screenWidth = screenRef.current.clientWidth;
        setActiveIndex(Math.round(screenRef.current.scrollLeft / screenWidth));
      }
    }, 50);
  };

  const imageList = album.imageURLs.map((url, idx) => (
    <div
      key={idx}
      className="(imagebackground) w-screen lg:h-screen h-[calc(100vh-6rem)] flex justify-center align-middle snap-center relative"
    >
      {idx == activeIndex && (
        <div
          className="(anchor) w-1 h-1 absolute"
          key={idx}
          ref={activeImgRef}
        ></div>
      )}
      <Image
        src={url}
        alt={`${url}`}
        width={0}
        height={0}
        sizes="100vw"
        fill
        className="relative object-contain scale-[90%] lg:translate-y-0 translate-y-[2rem]"
        draggable={false}
        priority={true}
      ></Image>
    </div>
  ));

  if (!album || !album.imageURLs) return <LoadingPage />;
  return (
    <div
      className="(carousel background) w-full h-full absolute overflow-x-scroll snap-x snap-mandatory scroll-smooth scrollbar-hide "
      ref={screenRef}
    >
      <div className="(screen) w-min h-screen flex relative">{imageList}</div>
      {!singlePic && <Action next={next} prev={prev} />}
      {!singlePic && (
        <Indicators
          steps={steps}
          activeIndex={activeIndex}
          onClickHandler={goToIndex}
        />
      )}
    </div>
  );
};
export default Carousel;
