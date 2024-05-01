import { Album, AlbumProps, imageSize } from "@/templates/Album";
import { db, storage } from "../firebase/firebase";
import { DocumentData, DocumentSnapshot, addDoc, collection, deleteDoc, doc,getDoc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { imageCompressGetFile } from "./imageCompress";
import { _report_ } from "@/templates/Reports";

enum CollectionName {
  albums = "Albums",
  users = "Users",
  reports = "Reports",
}

const getCollectionRef = (collectionName: CollectionName) =>{
  return collection(db, collectionName);
}

const getDocRef = (collectionName: CollectionName, docId: string) => {
  return doc(db, collectionName, docId);
}

const getStorageRef = (objectName: string) =>{
  return ref(storage,objectName);
}

// Read functions
export const getAlbumByAlbumID = async (albumID:string|undefined):Promise<Album|undefined> =>{
  console.log('albumID:'+albumID);
  if(!albumID) return undefined;
  const albumRef = getDocRef(CollectionName.albums, albumID);
  //get Album
  let album:Album;
  let getAlbum:DocumentSnapshot;
  try{
    // let from, to;
    // from = new Date().getTime()
    getAlbum = await getDoc(albumRef);
    // to = new Date().getTime()
    // console.log(to-from);
  }catch(error){
    console.log(error);
    return;
  }
  if(getAlbum.exists()){
    console.log('Album found');
    album = new Album({albumID:albumID,...getAlbum.data()});
  }
  else{
    console.log("Album not found");
    return;
  }
  return album;
}

export const getAllAlbumsByUID = async (uid:string) =>{
  console.log("getAllAlbumsByID executed");
  const albumQuery = query(getCollectionRef(CollectionName.albums), where(AlbumProps.ownerID, '==', uid), orderBy(AlbumProps.creationTime,'desc'));
  
  try {
    const querySnapshot = await getDocs(albumQuery);

    const fetchAlbum:Promise<Album>[] = querySnapshot.docs.map(async (doc) => {
      const albumID:string = doc.id;
      const albumData:DocumentData= doc.data();
      let album:Album = new Album({albumID:albumID,...albumData as DocumentSnapshot});
      return album;
    });
    const userAlbums:Album[] = await Promise.all(fetchAlbum);
    return userAlbums;
  } catch (error) {
    console.error(error);
    return [];
  }
}

  // Create functions
export const createAlbum = async (ownerID:string,expireTime:Date,tags:string[],imgFiles:File[],imageSizes:imageSize[]): Promise<Album|undefined> =>{
  //create album and post
  let album:Album = {
      ownerID: ownerID,
      creationTime: new Date(),
      expireTime: expireTime,
      tags: tags,
      thumbnailURL:'',
      imageURLs:[],
      imageCount:imgFiles.length,
      viewCount: 0,
      imageSizes: imageSizes,
  };
  let albumID:string;
  try{
    const doc = await addDoc(getCollectionRef(CollectionName.albums), album);
    albumID = doc.id;
  }catch(error){
    console.log(error);
    return;
  }

  //generate thumbnail
  const thumbnailRef = getStorageRef(`${albumID}/thumbnail.jpeg`);
  let thumbnailURL:string = '';
  const metadata = {
    contentType: 'image/jpeg',
  };
  try{
    const thumbnail = await imageCompressGetFile(0.3,1920,imgFiles[0]);
    await uploadBytes(thumbnailRef,thumbnail!,metadata);
    thumbnailURL = await getDownloadURL(thumbnailRef);
  }catch(error){
    console.log(error);
  }

  //post imageURLs
  const imageURLs:string[] = [];
  try {
    // Create an array of promises for uploading image files
    const uploadPromises = imgFiles.map(async (imgFile, i) => {
      if(imgFile == null) return null;
      const fileName = `${albumID}/${i}.jpeg`; // Generate a unique file name
      const imageRef = getStorageRef(fileName);
      await uploadBytes(imageRef, imgFile, metadata);
      const imageURL = await getDownloadURL(imageRef);
      return imageURL;
    });
    // Wait for all uploads to complete
    const imgURLs:(string | null)[] = await Promise.all(uploadPromises);
    imageURLs.push(...imgURLs.filter(url => url !== null) as string[]);
  } catch (error) {
    console.error('Error uploading images:', error);
  }
    const tempImagesURL = imgFiles.map((image)=>URL.createObjectURL(image));
    // console.log(imageURLs);
    await updateDoc(getDocRef(CollectionName.albums,albumID),{
      thumbnailURL: thumbnailURL,
      imageURLs: imageURLs
    })
    album = {...album,
      albumID:albumID,
      thumbnailURL: tempImagesURL[0], 
      imageURLs: tempImagesURL
    };
    return album;
}

export const createDefaultAlbum = async (uid: string) => {
  // URLs of the images stored in your public folder
  const defaultImageUrl = '/assets/images/defaultAlbumImage.png';

  // Convert each URL to a File object
  const response = await fetch(defaultImageUrl);
  const blob = await response.blob();
  const imgFile:File = new File([blob], defaultImageUrl.split('/').pop()!, {type: 'image/jpeg'});
  
  await createAlbum(uid, new Date(new Date().setDate(new Date().getDate() + 30)), ['새로운','공유의','시작'], [imgFile], [{width: 692 * 4, height: 692 * 4}]);
  console.log('default album created');
}

export const createReport = async (albumID:string, reportCode: number, content:string) => {
  const report:_report_ = {
    creationTime: new Date(),
    albumID: albumID,
    reportCode: reportCode,
    reportContent: content
  }
  const doc = await addDoc(getCollectionRef(CollectionName.reports), report);
  // console.log(doc);
}

//Update functions
export const updateViewCount = async (albumID:string, newViewCount:number) => {
  await updateDoc(getDocRef(CollectionName.albums,albumID),{
    viewCount: newViewCount
  });
}

// Delete functions
const deleteAlbumImages = async (album:Album) => {
  if (!album) return;

  const albumID = album.albumID;
  const imageURLs:string[] = album.imageURLs.map((album,idx)=> `${albumID}/${idx}.jpeg`);
  imageURLs.push(`${albumID}/thumbnail.jpeg`);

  try {
    // Delete each image from Cloud Storage
    const deleteImagePromises = imageURLs.map(async (imageURL) => {
      const imageRef = getStorageRef(imageURL);
      await deleteObject(imageRef);
    });
    // Wait for all image deletions to complete
    await Promise.all(deleteImagePromises);
  } catch (error) {
    console.error(error);
  }
};

const deleteAlbumDoc = async (album:Album) => {
  if(!album) return;

  const albumID = album.albumID;
  const albumRef = getDocRef(CollectionName.albums,albumID!);
  await deleteDoc(albumRef);
}
  
export const deleteAlbum = async (album:Album) =>{
  await deleteAlbumImages(album);
  await deleteAlbumDoc(album);
}

export const clearAllAlbumsByID = async (uid:string) =>{
  console.log("getAllAlbumsByID executed");
  const albumQuery = query(getCollectionRef(CollectionName.albums), where(AlbumProps.ownerID, '==', uid), orderBy(AlbumProps.creationTime,'desc'));
  
  try {
    const querySnapshot = await getDocs(albumQuery);

    querySnapshot.docs.forEach(async (doc) => {
      const albumID:string = doc.id;
      const albumData:DocumentData= doc.data();
      let album:Album = new Album({albumID:albumID,...albumData as DocumentSnapshot});
      deleteAlbum(album);
    });
  } catch (error) {
    console.error(error);
  }

}