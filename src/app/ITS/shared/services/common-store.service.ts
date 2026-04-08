import { Injectable } from '@angular/core';
import { ICompany } from '../interfaces/backend/Customer/Company';
import { IUser } from '../interfaces/backend/User';

@Injectable({
  providedIn: 'root'
})
export class CommonStoreService {

  private blockchainConnectedEnabledState: boolean;
  private inboundVerifyStatusState: string;
  private inboundVerifyValueState: string;
  private serverUserState: IUser;
  private userCompanyState: ICompany;

  constructor() {}

  updateBlockchainConnectionEnabledState(blockchainConnectionEnabledState: boolean): void {
    this.blockchainConnectedEnabledState = blockchainConnectionEnabledState;
    console.log('[common-store svc] blockchainConnectedEnabled', this.blockchainConnectedEnabledState);
  }
  updateInboundVerifyStatusState(inboundVerifyStatus: string): void {
    this.inboundVerifyStatusState = inboundVerifyStatus;
    console.log('[common-store svc] inboundVerifyStatusState', this.inboundVerifyStatusState);
  }
  updateInboundVerifyValueState(inboundVerifyValue: string): void {
    this.inboundVerifyValueState = inboundVerifyValue;
    console.log('[common-store svc] inboundVerifyValueState', this.inboundVerifyValueState);
  }
  updateServerUserState(serverUser: IUser): void { 
    this.serverUserState = serverUser; 
    console.log('[common-store svc] setServerUserState', this.serverUserState);
  }
  updateUserCompanyState(userCompany: ICompany): void {
    this.userCompanyState = userCompany;
    console.log('[common-store svc] setUserCompanyState', this.userCompanyState);
  }

  initBlockchainConnectionEnabledStateIfUndefined(blockchainConnectionState: boolean): void {
    if (this.blockchainConnectedEnabledState === undefined || this.blockchainConnectedEnabledState === null) {
      this.blockchainConnectedEnabledState = blockchainConnectionState;
    }
  }
  initInboundVerifyStatusStateIfUndefined(inboundVerifyStatus: string): void {
    if (!this.inboundVerifyStatusState || this.inboundVerifyStatusState.length<1) {
      this.inboundVerifyStatusState = inboundVerifyStatus;
    }
  }
  initInboundVerifyValueIfUndefined(inboundVerifyValue: string): void {
    if (!this.inboundVerifyValueState || this.inboundVerifyValueState.length<1) {
      this.inboundVerifyValueState = inboundVerifyValue;
    }
  }
  initServerUserStateIfUndefined(user: IUser) {
    if (!this.serverUserState) {
      this.serverUserState = user;
    }
  }
  initUserCompanyStateIfUndefined(company: ICompany) {
    if (!this.currentUserCompany) {
      this.userCompanyState = company;
    }
  }

  get currentBlockchainConnectionEnabledStatus() { return this.blockchainConnectedEnabledState; }
  get currentInboundVerifyStatus() { return this.inboundVerifyStatusState; }
  get currentInboundVerifyValue() { return this.inboundVerifyValueState; }
  get currentServerUser() { return this.serverUserState; }
  get currentUserCompany() { return this.userCompanyState; }

  toggleToVerifyValue(isToggled: boolean) { return isToggled ? this.inboundVerifyValueState : 'Non'; }
  verifyValueToToggle(inboundVerifyValue: string) { return inboundVerifyValue.toLowerCase().includes('non') ? false : true; }

}
