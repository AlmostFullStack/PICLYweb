import { useState, useRef, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { IoIosClose } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsSendFill } from "react-icons/bs";
import { auth } from "@/lib/firebase/firebase";
import { Album } from "@/templates/Album";
import { createAlbum } from "@/lib/functions/firebaseCRUD";
import DateInput from "../inputs/DateInput";
import ImageInput from "../inputs/ImageInput";
import TagInput from "../inputs/TagInput";
import ErrorModal from "./ErrorModal";

  //data limits
export const MAX_IMAGE_NUM = 5;
export const MAX_TAG_NUM = 5;

const NewAlbumModal = ({
  close,
  refreshWithNewAlbum,
}: {
  close: () => void;
  refreshWithNewAlbum: (newAlbum: Album) => void;
}) => {
  //initialization
  const oneWeekLaterFromNow = new Date();
  oneWeekLaterFromNow.setDate(oneWeekLaterFromNow.getDate() + 7);

  //user inputs
  const [imgFiles, setImgFiles] = useState<File[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date>(oneWeekLaterFromNow);
  const [dateDiff, setDateDiff] = useState<number>(0); //분단위

  //states
  const [error, setError] = useState<boolean>(true);
  const [errorNo,setErrorNo] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  //refs
  const inputTagRef = useRef<HTMLInputElement>(null);
  const scrollTagRef = useRef<HTMLDivElement>(null);

  //useEffects
  useEffect(() => {
    if (imgFiles.length > 0 && dateDiff > 0) setError(false);
    else setError(true);
  }, [imgFiles, dateDiff]);

  //functions
  const onAlbumCreate = async () => {
    setIsLoading(true);
    const createdAlbum = await createAlbum(auth.currentUser!.uid,dueDate,tagList,imgFiles);
    setIsLoading(false);

    if (!createdAlbum) {
      console.log("album creation fail");
      return;
    }
    refreshWithNewAlbum(createdAlbum);
    close();
  };

  return (
    <div className={`w-screen h-screen fixed top-0 left-0 z-[102]`}>
      <div className="(backdrop) w-full h-full fixed bg-black opacity-50 z-100"></div>
      <div className="(modal) lg:w-[900px] lg:h-[700px] w-full h-screen p-5 relative z-101 lg:left-1/2 lg:-translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2 lg:bg-white rounded-xl flex flex-col items-center
                                content-start bg-pico_default">
        {!error && !isLoading && (
          <BsSendFill
            className="hidden lg:block w-8 h-8 absolute right-0 top-0 m-6 fill-black cursor-pointer hover:scale-[115%] "
            onClick={onAlbumCreate}
          />
        )}
        {!error && !isLoading && (
          <button
            onClick={onAlbumCreate}
            className="lg:hidden absolute right-0 top-0 m-5 text-2xl text-pico_blue">
            완료
          </button>
        )}
        {isLoading && (
          <AiOutlineLoading3Quarters className="w-10 h-10 absolute right-0 top-0 m-6 lg:fill-black animate-spin" />
        )}
        
        <ErrorModal
          errorNo={errorNo}
          setErrorNo={setErrorNo}
          maxTag={MAX_TAG_NUM}
          maxImg={MAX_IMAGE_NUM}/>
        
        <h1 className="lg:text-black text-3xl mb-6">새 앨범</h1>
        
        <ImageInput
          imgFiles={imgFiles}
          setImgFiles={setImgFiles}
          setErrorNo={setErrorNo}/>

        <DateInput
          setDueDate={setDueDate}
          setDateDiff={setDateDiff}
          setErrorNo={setErrorNo}
          dueDate={dueDate}
          dateDiff={dateDiff}/>

        <TagInput
          scrollTagRef={scrollTagRef}
          tagList={tagList}
          inputTagRef={inputTagRef}
          setTagList={setTagList}
          setErrorNo={setErrorNo}/>

        <p className="lg:text-black pt-12 text-sm text-center">
          선정적이거나 모욕적인 이미지, 비속어, 개인정보가 <br />
          포함된 내용은 제재의 대상이 될 수 있습니다.
        </p>
        
      </div>
      {!isLoading && (
        <IoIosClose
          className="w-16 h-16 absolute top-0 right-auto lg:right-0 lg:m-8 m-2 cursor-pointer"
          onClick={close}
        />
      )}
    </div>
  );
};

export default NewAlbumModal;
