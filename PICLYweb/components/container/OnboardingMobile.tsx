import Image from "next/image";
import { ReactNode, useRef } from "react";
import GetStarted from "../actions/GetStarted";
import { ONBOARDING_CONTENT } from "@/public/assets/texts";
import { poppins } from "@/public/assets/fonts/poppins";
import flatIphone from "@/public/assets/images/flatIphone.png";
import catAlbum from "@/public/assets/images/catAlbum.svg";
import racoonAlbum from "@/public/assets/images/racoonAlbum.svg";
import emptyAlbum from "@/public/assets/images/emptyAlbum.svg";
import onBoarding2ImageMobile from "@/public/assets/images/onBoarding2ImageMobile.png";
import outDatedAlbum from "@/public/assets/images/outDatedAlbum.png";
import { notosans } from "@/public/assets/fonts/notosans";
const OnboardingMobile = (): ReactNode => {

  //useRef
  const firstOnBoardingRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div className="(title) lg:hidden lg:fixed w-full h-[100svh] flex-grow flex flex-col align-middle items-center lg:flex-row-reverse z-10">
        <GetStarted firstOnBoardingRef={firstOnBoardingRef} />
      </div>

      <div
        className={`(mobile onboarding1) lg:hidden w-full h-[100svh] p-8 pt-24 flex flex-col justify-between ${notosans.className}`}
        ref={firstOnBoardingRef}>
        <h1 className="text-2xl font-bold text-center">
          {ONBOARDING_CONTENT.onBoarding1Title}
        </h1>
        <div className="w-full flex justify-center">
          <div className="relative overflow-hidden">
            <div className={`absolute ${poppins.className} font-bold text-2xl top-[50px] left-[35px]`}>
              PICLY
            </div>
            <Image
              className="w-[300px]"
              src={flatIphone}
              alt="Iphone"
              width={300}
              priority={true}/>
            <Image
              className="absolute top-[90px] left-[25px] w-[120px]"
              src={catAlbum}
              alt="catAlbum"
              width={120}
              priority={true}/>
            <Image
              className={`absolute top-[260px] left-[25px] w-[120px]`}
              src={emptyAlbum}
              alt="emptyAlbum"
              width={120}
              priority={true}/>
            <Image
              className={`absolute top-[260px] left-[155px] w-[120px]`}
              src={emptyAlbum}
              alt="emptyAlbum"
              width={0}
              priority={true}/>
            <Image
              className="absolute top-[90px] left-[155px] w-[120px]"
              src={racoonAlbum}
              alt="racoonAlbum"
              width={120}
              priority={true}/>
          </div>
        </div>
        <h2 className="whitespace-pre-wrap">
          {ONBOARDING_CONTENT.onBoarding1Content}
        </h2>
      </div>
      <div
        className={`(mobile onboarding2) lg:hidden w-full h-[100svh] p-8 pt-24 flex flex-col justify-between ${notosans.className}`}
      >
        <h1 className="text-2xl font-bold text-center">
          {ONBOARDING_CONTENT.onBoarding2Title}
        </h1>
        <div className="relative justify-center flex">
          <Image
            className="w-[300px]"
            src={onBoarding2ImageMobile}
            alt="onBoarding2"
            priority={true}
          />
          {/* <Image className={`absolute top-[150px] left-1/2 -translate-x-1/2 w-[150px] {styles.__onBoarding__msg_toast}`}
              src={copyToast}
              alt="copyToast"/> */}
        </div>
        <h2 className="whitespace-pre-wrap">
          {ONBOARDING_CONTENT.onBoarding2Content}
        </h2>
      </div>
      <div
        className={`(mobile onboarding3) lg:hidden w-full h-[100svh] p-8 pt-24 flex flex-col justify-between ${notosans.className}`}
      >
        <h1 className="text-2xl font-bold text-center">
          {ONBOARDING_CONTENT.onBoarding3Title}
        </h1>
        <div className="relative flex justify-center">
          <Image
            className="w-[300px]"
            src={outDatedAlbum}
            alt="outDatedAlbum"
            priority={true}
          />
        </div>
        <h2 className="whitespace-pre-wrap">
          {ONBOARDING_CONTENT.onBoarding3Content}
        </h2>
      </div>
    </>
  );
};

export default OnboardingMobile;
