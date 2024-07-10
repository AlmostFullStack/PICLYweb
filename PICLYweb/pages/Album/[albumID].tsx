import Actionbar from "@/components/actions/ActionBar";
import { Album } from "@/templates/Album";
import { getAlbumByAlbumID, updateViewCount } from "@/lib/functions/firebaseCRUD";
import FallbackPage from "@/components/page/FallbackPage";
import ExpiredPage from "@/components/page/ExpiredPage";
import { useBodyScrollLock } from "@/lib/functions/scrollLock";
import { useEffect } from "react";
import Carousel from "@/components/page/Carousel";
import { dynamicBlurDataUrl } from "@/lib/functions/dynamicBlurDataURL";

const ImageView = ({ album, valid }: { album: Album|null, valid:boolean }) => {
  
  const { lockScroll, openScroll } = useBodyScrollLock();

  useEffect(()=>{
    lockScroll();
    return ()=>openScroll();
  },[]);

  if(!valid) return  <FallbackPage/>
  else if(!album) return <ExpiredPage/>

  return (
    <div className="(background) w-screen h-screen absolute bg-black">
      <Carousel album={album} />
      <Actionbar resetAlbum={() => {}} mode="guest" album={album} deleteAlbum={()=>{}} />
    </div>
  );
};

export async function getServerSideProps({ query }: { query: { albumID: string } }) {
  const albumID = query.albumID as string;

  try {
    const album_: Album | undefined = await getAlbumByAlbumID(albumID);
    
    if (album_){
      const album:Album = {
        albumID : album_.albumID,
        ownerID : album_.ownerID,
        creationTime : JSON.parse(JSON.stringify(album_.creationTime)),
        expireTime : JSON.parse(JSON.stringify(album_.expireTime)),
        tags : album_.tags || [],
        thumbnailURL : album_.thumbnailURL || '',
        imageURLs : album_.imageURLs || [],
        imageCount: album_.imageCount || 0,
        viewCount : album_.viewCount || 0,
        imageSizes: album_.imageSizes || [],
      }
    
      //increase viewCount
      updateViewCount(album_.albumID!,album_.viewCount+1);
    
      
      if(new Date(album_.expireTime).getTime() > new Date().getTime()){
        return {
          //album found and viewable
          props: { album:album, valid:true } ,
        };
      }
      else return {
        //album found and unviewable
        props: { album:null, valid:true } ,
      }
    }
    else return { props: { valid: false } }
  } catch (error) {
    console.error("Error fetching album:", error);
    return { props: { valid: false } };
  }
}

export default ImageView;

export async function generateMetadata({ params }: {params: {albumID: string}}){
 
  let album:Album | undefined;
  try {
    album = await getAlbumByAlbumID(params.albumID);
  }catch(error){
    console.log(error);
  }

  if(album && new Date(album.expireTime).getTime() > new Date().getTime()) return {
    title: "PICLY Photo Sharing",
    openGraph: {
      images: album?.thumbnailURL
    }
  };

  else return {
    title: "PICLY Photo Sharing"
  }
}
