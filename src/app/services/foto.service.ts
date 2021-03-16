import { Injectable } from '@angular/core';
import { CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory, Plugins } from '@capacitor/core';


const {Camera,Filesystem,Storage}=Plugins;

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  public dataFoto : Photo[] = []
  private keyFoto : string ="foto";

  constructor() { }
  public async tambahFoto()
  {
    const Foto = await Camera.getPhoto({
      resultType : CameraResultType.Uri,
      source : CameraSource.Camera,
      quality : 100

    });

    console.log(Foto)

    this.dataFoto.unshift({
      filePath: "Load",
      webviewPath:Foto.webPath
    })

    Storage.set({
      key : this.keyFoto,
      value: JSON.stringify(this.dataFoto)
    })
  }
  public async simpanFoto(foto : CameraPhoto){
      const base64Data = await this.readAsBase64(foto);

      const namaFile = new Date().getTime + '.jpeg';
      const simpanFile = await Filesystem.writeFile({
        path : namaFile,
        data : base64Data,
        directory : FilesystemDirectory.Data
      })

      return{
        filePath: namaFile,
        webviewPath :foto.webPath
      }
  }

  private async readAsBase64(foto : CameraPhoto)
  {
    const response = await fetch(foto.webPath);
    const blob =await response.blob();

    return await this.convertBlobToBase64(blob) as string
  }

  convertBlobToBase64 = (blob : Blob) => new Promise((resolve,reject ) =>{
    const reader = new FileReader
    reader.onerror=reject
    reader.onload=()=>
    {
      resolve(reader.result);
    }
  })

  public async loadFoto(){
    const listFoto = await Storage.get({key : this.keyFoto});
    this.dataFoto=JSON.parse(listFoto.value) || [];

    for (let foto of this.dataFoto)
    {
      const readFile = await Filesystem.readFile({
        path : foto.filePath,
        directory : FilesystemDirectory.Data
      })

      foto.webviewPath='data:iamge/jpeg;based64,${readFile.data}';
    }
  }
}
export interface Photo{
  filePath : string;
  webviewPath : string;
}