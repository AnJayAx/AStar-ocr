import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PostImage } from '../classes/img-model';
import { IImageItem } from '../interfaces/backend/imageItem';
import { IPostByHHResponse } from '../interfaces/backend/PostByHHResponse';
import { ItsServiceService } from './its-service.service';
import { Utils } from '../classes/utils';

const PHOTO_LIMIT_KEY = 'HHPhotoLimit';
@Injectable({
  providedIn: 'root'
})
export class SubmitImageService {

  constructor(
    private _itsService: ItsServiceService
  ) { }

  getHHPhotoLimit(): Observable<number> {
    return this._itsService.getITSSettingByKey(PHOTO_LIMIT_KEY).pipe(
      map(response => parseInt(Utils.getSingleITSSettingVal(response)))
    );
  }

  postSignature(signatureData: string, transactionNo: string): Observable<IPostByHHResponse> {
    const signatureImageItem: IImageItem = new PostImage();
    signatureImageItem['Creator'] = this._itsService.getKeyCloakUsername();
    signatureImageItem['Type'] = 'S';
    signatureImageItem['ImageContent'] = signatureData.split(',')[1];
    signatureImageItem['TransactionNo'] = transactionNo;

    return this._itsService.postImages([signatureImageItem]);
  }

  postPhotoArray(photoData: string[], transactionNo: string): Observable<IPostByHHResponse> {
    const photoImageItems = [];

    photoData.forEach(data => {
      const photoImageItem: IImageItem = new PostImage();
      photoImageItem['Creator'] = this._itsService.getKeyCloakUsername();
      photoImageItem['Type'] = 'P';
      photoImageItem['ImageContent'] = data;
      photoImageItem['TransactionNo'] = transactionNo;

      photoImageItems.push(photoImageItem)
    })

    return this._itsService.postImages(photoImageItems);
  }

  postSignatureAndPhotoArray(signatureData: string, photoData: string[], transactionNo: string): Observable<IPostByHHResponse> {
    const imageParams = [];

    photoData.forEach(data => {
      const imageItem: IImageItem = new PostImage();
      imageItem['Creator'] = this._itsService.getKeyCloakUsername();
      imageItem['Type'] = 'P';
      imageItem['ImageContent'] = data;
      imageItem['TransactionNo'] = transactionNo;

      imageParams.push(imageItem);
    });


    const signatureParams: IImageItem = new PostImage();
    signatureParams['Creator'] = this._itsService.getKeyCloakUsername();
    signatureParams['Type'] = 'S';
    signatureParams['ImageContent'] = signatureData.split(',')[1];
    signatureParams['TransactionNo'] = transactionNo;

    return this._itsService.postImages([signatureParams, ...imageParams]);
  }
}
