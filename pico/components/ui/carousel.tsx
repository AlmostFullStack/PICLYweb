import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { curAlbumState } from "@/lib/recoil/curAlbumState";
import { useRecoilValue } from "recoil";
import nextImg from '@/public/assets/images/arrow_forward.svg'
import prevImg from '@/public/assets/images/arrow_back.svg'
import LoadingPage from "../Loading";

const BackDrop = () =>{
  return <div className="w-screen h-screen fixed top-0 left-0 bg-black opacity-80"></div>
}

const Action = ({prev,next}:{prev:()=>void, next:()=>void}) =>{

  const cn = "fixed top-1/2 -translate-y-1/2 w-12 h-12 cursor-pointer opacity-60";
  return<>
    <Image className={`${cn} left-4`} src={prevImg} alt='prev' onClick={prev}/>
    <Image className={`${cn} right-4`} src={nextImg} alt='next' onClick={next}/>
  </>

}

const Indicators = ({
  steps,
  activeIndex,
  onClickHandler,
}: {
  steps:number,
  activeIndex: number;
  onClickHandler: (newIndex: number) => void;
}) => {
  const indicators = [];
  for(let i=0;i<steps;i++){
    indicators.push(
      <span key={i}
      className={`w-8 h-2 rounded-md ${activeIndex == i ? 'bg-slate-100' : 'bg-slate-400'} cursor-pointer`}
      onClick={() => onClickHandler(i)}></span>
    );
  }

  
  return <div className="w-min h-min fixed left-1/2 -translate-x-1/2 bottom-10 flex gap-3 justify-center
  ">
    {...indicators}
  </div>;
};

const PicoCarousel = ()=> {
  const album = useRecoilValue(curAlbumState);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const screenRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const activeImgRef = useRef<HTMLDivElement>(null);
  const timerRef: { current: NodeJS.Timeout | null } = useRef(null);
  

  useEffect(() => {
    const container = screenRef.current;
    if (container) {
      container.addEventListener("scroll", updateIndicatorOnScroll);

      return () => {
        container.removeEventListener("scroll", updateIndicatorOnScroll);
      };
    }
  }, []);

  useEffect(()=>{
    
    if(activeImgRef.current){
      activeImgRef.current.scrollIntoView({
        behavior:"smooth",
      });
    }
  },[activeIndex]);
  
  if(!album) return <LoadingPage/>

  const steps = album.getImageURLs.length;

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
    if(timerRef.current !== null){
      clearTimeout(timerRef.current);
    }
  
    timerRef.current = setTimeout(() => {
      if (screenRef.current) {
        const screenWidth = screenRef.current.clientWidth;
        console.log(Math.round(screenRef.current.scrollLeft/screenWidth));
        setActiveIndex(Math.round(screenRef.current.scrollLeft/screenWidth));
        }      
      }, 50); 
  };

  

  const imageList = album.getImageURLs.map((url,idx) => (
    <div key={idx} className="(imagebackground) w-screen h-screen flex justify-center align-middle snap-center relative" ref={slideRef}>
      {idx == activeIndex && <div className="(anchor) w-1 h-1 absolute" key={idx} ref={activeImgRef}></div>}
      <Image
        src={url}
        alt={`${url}`}
        fill
        className="relative object-contain scale-[85%]"
        draggable={false}
      ></Image>
    </div>
  ));
  
  

  return (
    <div className="(background) w-screen h-screen absolute overflow-x-scroll snap-x snap-mandatory scroll-smooth scrollbar-hide" ref={screenRef}>
      <BackDrop/>
      <div className="(screen) w-min h-screen flex relative" >{imageList}</div>
      <Action next={next} prev={prev}/>
      <Indicators steps={steps} activeIndex={activeIndex} onClickHandler={goToIndex}/>
    </div>
  );
}

export default PicoCarousel;
