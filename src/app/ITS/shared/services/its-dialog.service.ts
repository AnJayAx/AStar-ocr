import { Injectable } from '@angular/core';
import { CustomDialogService } from '@dis/services/message/custom-dialog.service';
import { Observable, of } from 'rxjs';
import { IPostByHHResponse } from '../interfaces/backend/PostByHHResponse';

@Injectable({
  providedIn: 'root'
})
export class ItsDialogService {

  constructor(
    private _customDialog: CustomDialogService
  ) { }

  noTagsSelected(): Observable<any> {
    return this._customDialog.message(
      'No Tags Detected', 'Please select one (or more) tags to continue.',
      [{ text: 'Close', primary: false }], 'warning'
    );
  }

  noTagSelected(): Observable<any> {
    return this._customDialog.message(
      'No Tags Detected', 'Please select one tag to continue.',
      [{ text: 'Close', primary: false }], 'warning'
    );
  }

  missingFormInformation(): Observable<any> {
    return this._customDialog.message(
      'Missing Details!', 'Please fill out the required fields before submitting.',
      [{ text: 'Close', primary: false }], 'error'
    );
  }

  postByHH(postResponse: IPostByHHResponse): Observable<any> {
    console.log('[its-dialog svc] postByHH postResponse', postResponse);
    if (!!postResponse) {
      try {

        if (postResponse['Status'].toLowerCase() === 'success') {
          return this._customDialog.message(
            `${postResponse['Operation']} Successful`, `${postResponse['Message']}`,
            [{ text: 'Done', primary: true }], 'success'
          );
        } else {
          return this._customDialog.message(
            `${postResponse['Operation']} Failed`, `${postResponse['Message']}`,
            [{ text: 'Close', primary: false }], 'error'
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    /* wrapper functions (eg. postToBlockchainIfConnectionEnabled$) might return a null response 
      but it does not indicate a fail operation so this is returned to communicate to the subscriber
      that the operation was still a success
    */
    else {
      return of({ primary: true });
    }
  }

  
  postByHHArray(postResponse: IPostByHHResponse): Observable<any> {
    console.log('[its-dialog svc] postByHH postResponse', postResponse);
    if (!!postResponse) {
      try {

        if (postResponse[0]['Status'].toLowerCase() === 'success') {
          return this._customDialog.message(
            `${postResponse['Operation']} Successful`, `${postResponse[0]['Message']}`,
            [{ text: 'Done', primary: true }], 'success'
          );
        } else {
          return this._customDialog.message(
            `${postResponse[0]['Operation']} Failed`, `${postResponse['Message']}`,
            [{ text: 'Close', primary: false }], 'error'
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    /* wrapper functions (eg. postToBlockchainIfConnectionEnabled$) might return a null response 
      but it does not indicate a fail operation so this is returned to communicate to the subscriber
      that the operation was still a success
    */
    else {
      return of({ primary: true });
    }
  }

  undefinedValuesFound(): Observable<any> {
    return this._customDialog.message(
      'Undefined Values', 'Ensure that all selected quantities are defined',
      [{ text: 'Close', primary: false }], 'warning'
    );
  }

  zeroValuesFound(optional: boolean = true): Observable<any> {
    const actions = optional ? [{ text: 'No', primary: false }, { text: 'Yes', primary: true }] : [{ text: 'Close', primary: false }];
    const msg = optional ? 'Continue with zero quantities?' : 'Ensure that there are no zero quantities';
    return this._customDialog.message(
      'Zero quantities found', msg, actions, 'warning'
    );
  }

  genericConfirmAction(confirmationTitle?: string, confirmationMsg?: string): Observable<any> {
    const title = confirmationTitle?.length > 0 ? confirmationTitle : 'Confirm Action';
    const msg = confirmationMsg?.length > 0 ? confirmationMsg : 'Are you sure you want to continue?'
    return this._customDialog.message(
      `${title}`, `${msg}`,
      [{ text: 'Back', primary: false }, { text: 'Continue', primary: true, themeColor: "primary" }], 'info'
    );
  }

  noActionTaken(): Observable<any> {
    return this._customDialog.message(
      'No Submission', 'No submission items found. Nothing was posted.',
      [{ text: 'Okay', primary: true }], 'info'
    );
  }

  /* For deletable-tags-view component */
  denyEmptyTagList(): Observable<any> {
    return this._customDialog.message(
      'Empty Tag List',
      'At least one tag must exist in this list. Empty tag lists are not allowed.',
      [{ text: 'Okay', primary: true }],
      'warning'
    );
  }

}
