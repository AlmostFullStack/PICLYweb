import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import Modal from "../modal/Modal";
import { notosans } from "@/public/assets/fonts/notosans";
import ReactDOM  from "react-dom"; 
import { page } from "@/pages/Gallery/[userid]";
import { logout } from "../page/LoginPage";

const BackDrop = ({onClick}:{onClick:()=>void})=>{
    return <div className="(backdrop) w-screen h-screen left-0 top-0 fixed bg-black/80"
      onClick={onClick}></div>
}

const MobileMenuTab = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  switchPage
}: {
  mobileMenuOpen: boolean|undefined;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean|undefined>>;
  switchPage:(page:page)=>void;
}): ReactNode => {
  const [clientSide,setClientSide] = useState<boolean>(false);
  useEffect(()=>setClientSide(true),[]);
  if(!document) return <></>
  const root = document.getElementById('modalroot');
  const portal = ReactDOM.createPortal(
    <>
    {mobileMenuOpen && <BackDrop onClick={()=>setMobileMenuOpen(false)}/>}
    <div className={`fixed w-1/2 h-screen right-0 top-0 bg-pico_default flex justify-center ${mobileMenuOpen ? 'right-0' : '-right-1/2'} transition-all duration-300`}>
      <ul className={`${notosans.className} mt-8 text-xl flex flex-col gap-5`}>
        <li 
          onClick={()=>{switchPage('gallery');setMobileMenuOpen(false)}}>갤러리</li>
        <li 
          onClick={()=>{switchPage('profile');setMobileMenuOpen(false)}}>프로필</li>
        <li 
          onClick={()=>{switchPage('about');setMobileMenuOpen(false)}}>서비스 정보</li>
        <li className="mt-auto mb-8"
          onClick={logout}
          >로그아웃</li>
      </ul>
    </div>
  </>, root!);
  
  return portal
};

export default MobileMenuTab;
