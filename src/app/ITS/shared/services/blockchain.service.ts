import { Injectable } from '@angular/core';
import { IItemInfo } from '../interfaces/backend/ItemInfo';
import { IPostBlock, IPostBlockItem } from '../interfaces/blockchain/PostBlock';
import { ScanMode, ScanmodeService } from './scanmode.service';
import { CommonStoreService } from './common-store.service';
import { IPickedItemByHHLite } from '../interfaces/backend/SPT_Doc/PickedItemByHH';
import { IFirstOperation } from '../interfaces/backend/FirstOperation';
import { IOperationTraveler } from '../interfaces/backend/OperationTraveler';
import { IProductionTravelerItemInfo } from '../interfaces/backend/ProductionTravelerItemInfo';
import { IItemInfoToPostBlockItem } from '../interfaces/frontend/ItemInfoToPostBlockItemParam';
import { Utils } from '../classes/utils';
import { ISimpleBom } from '../interfaces/backend/SimpleBom';
import { IItemTraits } from '../interfaces/frontend/ItemTraits';
import { ILocations } from '../interfaces/backend/locations';
import { ICustomerAddress } from '../interfaces/backend/Customer/CustomerAddress';
import { ItsServiceService } from './its-service.service';
import { Observable, of } from 'rxjs';
import { IPostByHHResponse } from '../interfaces/backend/PostByHHResponse';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  constructor(
    private _scanmode: ScanmodeService,
    private _commonstore: CommonStoreService,
    private _itsService: ItsServiceService,
  ) { } 

  postToBlockchainIfConnectionEnabled$(postBlock: IPostBlock): Observable<IPostByHHResponse> {
    return this._commonstore.currentBlockchainConnectionEnabledStatus===false ?
      of(null)
      : this._itsService.postToBlockchain(postBlock);
  }

  postToBlockchainMOIfConnectionEnabled$(postBlockArr: IPostBlock[]): Observable<IPostByHHResponse> {
    return this._commonstore.currentBlockchainConnectionEnabledStatus===false ?
      of(null)
      : this._itsService.postToBlockchainMO(postBlockArr);
  }

  private itemInfoToPostBlockItem({itemInfoObject, refurbishType=null, weight=null, remarks=null, isCostEqualPrice=false}: IItemInfoToPostBlockItem): IPostBlockItem {
    return {
      "ProductId": itemInfoObject.EPC_ID,
      "EPCID": itemInfoObject.EPC_ID,
      "AutoIDType": this._scanmode.currentScanMode.toString(),
      "ImageOfProduct": "",
      "Brand": itemInfoObject.Category,
      "ProductName": "",
      "ProductDescription": "",
      "RefNo": itemInfoObject.Ref_No,
      "ProductCode": itemInfoObject.SKU,
      "BatchNo": itemInfoObject.BatchNo,
      "CountryOfOrigin": "",
      "Description": Utils.removeNullValue(itemInfoObject.Description), 
      "Price": (isCostEqualPrice && !!itemInfoObject.Cost) ? itemInfoObject.Cost : 0,
      "Quantity": itemInfoObject.LastBal,
      "Manufacturer": "",
      "RefurbishType": refurbishType ?? "",
      "ManufacturingDate": Utils.removeNullValue(itemInfoObject.Date_of_PurchaseS),
      "DateOfExpire": Utils.removeNullValue(itemInfoObject.Date_of_Expire),
      "WarrantyExpiryDate": Utils.removeNullValue(itemInfoObject.Warranty_Expiry_Date),
      "CalibrationDate": Utils.removeNullValue(itemInfoObject.Calibration_Date),
      "GS1BarCode": "",
      "Certification": "",
      "CO2Score": "",
      "Remarks": remarks ?? itemInfoObject.Remarks,
      "Height": "",
      "Length": "",
      "Width": "",
      "Weight": !!weight ? weight.toString() : "",
      "HeightUOM": "",
      "LengthUOM": "",
      "WidthUOM": "",
      "WeightUOM": "",
      "Status": Utils.removeNullValue(itemInfoObject.Asset_StatusName),
    };
  }

  private productionTravelerItemInfoToPostBlockItem(productionTravelerItemInfoObject: IProductionTravelerItemInfo, bomList: ISimpleBom[], traits:IItemTraits): IPostBlockItem {
    return {
      "ProductId": productionTravelerItemInfoObject.EPC_ID,
      "EPCID": productionTravelerItemInfoObject.EPC_ID,
      "AutoIDType": this._scanmode.currentScanMode.toString(),
      "ImageOfProduct": "",
      "Brand": productionTravelerItemInfoObject.Category,
      "ProductName": "",
      "ProductDescription": "",
      "RefNo": productionTravelerItemInfoObject.Ref_No,
      "ProductCode": productionTravelerItemInfoObject.SKU,
      "BatchNo": productionTravelerItemInfoObject.BatchNo,
      "CountryOfOrigin": "",
      "Description": Utils.removeNullValue(productionTravelerItemInfoObject.Description), 
      "Price": 0,
      "Quantity": productionTravelerItemInfoObject.LastBal,
      "Manufacturer": "",
      "RefurbishType": "",
      "ManufacturingDate": Utils.removeNullValue(productionTravelerItemInfoObject.Date_of_PurchaseS),
      "DateOfExpire": Utils.removeNullValue(productionTravelerItemInfoObject.Date_of_Expire),
      "WarrantyExpiryDate": Utils.removeNullValue(productionTravelerItemInfoObject.Warranty_Expiry_Date),
      "CalibrationDate": Utils.removeNullValue(productionTravelerItemInfoObject.Calibration_Date),
      "GS1BarCode": "",
      "Certification": "",
      "CO2Score": "",
      "Remarks": bomList.map(bomItem => `${bomItem.SKU}/${bomItem.Description}`).toString(),
      "Height": traits.height?.toString() ?? "",
      "Length": traits.length?.toString() ?? "",
      "Width": traits.width?.toString() ?? "",
      "Weight": traits.weight?.toString() ?? "",
      "HeightUOM": traits.lwhUom?.toString() ?? "",
      "LengthUOM": traits.lwhUom?.toString() ?? "",
      "WidthUOM": traits.lwhUom?.toString() ?? "",
      "WeightUOM": traits.weightUom?.toString() ?? "",
      "Status": productionTravelerItemInfoObject.CO.Status, 
    }
  }

  getRegistrationPostBlock(transactionNo: string, registrationScanItemArr: IItemInfo[], latitude: number, longitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Manufacturer",
      "OperationType": 'Registration',
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": transactionNo,
      "Destination": "",
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": registrationScanItemArr[0].Remarks,
      "Latitude": latitude,
      "Longitude": longitude,
      "Status": registrationScanItemArr[0].Asset_StatusName,
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": registrationScanItemArr.map(item => this.itemInfoToPostBlockItem({ itemInfoObject: item, isCostEqualPrice:true })),
    };
  }

  getGrVerifyPostBlock(grVerifyScanItemArr: IItemInfo[], latitude: number, longitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Refurbishment",
      "OperationType": "GR Verify",
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": "",
      "Destination": "",
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": grVerifyScanItemArr[0].Remarks,
      "Latitude": latitude,
      "Longitude": longitude,
      "Status": grVerifyScanItemArr[0].Asset_StatusName,
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": grVerifyScanItemArr.map(item => this.itemInfoToPostBlockItem({ itemInfoObject:item, isCostEqualPrice: true })),
    };
  }

  getLoanOriginPostBlock(loanTransactionNo: string, loanScanItems: IItemInfo[], loanRemark: string, latitude: number, longtitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Refurbishment",
      "OperationType": "Loan (From)",
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": loanTransactionNo,
      "Destination": "",
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": '',
      "Vehicle": "",
      "Remarks": loanRemark,
      "Latitude": latitude,
      "Longitude": longtitude,
      "Status": loanScanItems[0].Asset_StatusName,
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": loanScanItems.map(item => this.itemInfoToPostBlockItem({ itemInfoObject: item })),
    };
  }

  getLoanDestinationPostBlock(loanTransactionNo: string, loanScanItems: IItemInfo[], loanCustomer: { loanCustomerName: string, loanCustomerAddress: ICustomerAddress }, loanRemark: string, latitude: number, longtitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Refurbishment",
      "OperationType": "Loan (To)",
      "Company": loanCustomer.loanCustomerName,
      "TransactionNo": loanTransactionNo,
      "Destination": "",
      "Address": !!loanCustomer.loanCustomerAddress ? loanCustomer.loanCustomerAddress.Address : "",
      "PostCode": !!loanCustomer.loanCustomerAddress ? loanCustomer.loanCustomerAddress.Postcode : "",
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": loanRemark,
      "Latitude": latitude,
      "Longitude": longtitude,
      "Status": loanScanItems[0].Asset_StatusName,
      "SubmissionDate": new Date().toISOString(),
      "Country": !!loanCustomer.loanCustomerAddress ? loanCustomer.loanCustomerAddress.Country : "",
      "Items": loanScanItems.map(item => this.itemInfoToPostBlockItem({ itemInfoObject: item })),
    };
  }

  getReturnDestinationPostBlock(returnTransactionNo: string, returnScanItems: IItemInfo[], returnLocation: ILocations, returnRemark: string, latitude: number, longtitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Refurbishment",
      "OperationType": "Return (To)",
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": returnTransactionNo,
      "Destination": returnLocation.Name,
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": returnRemark,
      "Latitude": latitude,
      "Longitude": longtitude,
      "Status": returnScanItems[0].Asset_StatusName,
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": returnScanItems.map(item => this.itemInfoToPostBlockItem({ itemInfoObject: item })),
    }
  }

  getReturnOriginPostBlock(returnTransactionNo: string, returnScanItems: IItemInfo[], returnCustomer: { returnCustomerName: string, returnCustomerAddress: ICustomerAddress }, returnRemark: string, latitude: number, longtitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Refurbishment",
      "OperationType": "Return (From)",
      "Company": "",
      "TransactionNo": returnTransactionNo,
      "Destination": "",
      "Address": "",
      "PostCode": "",
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": returnRemark,
      "Latitude": latitude,
      "Longitude": longtitude,
      "Status": returnScanItems[0].Asset_StatusName,
      "SubmissionDate": new Date().toISOString(),
      // "Country": returnCustomer.returnCustomerAddress?.Country ?? "",
      "Country": "",
      "Items": returnScanItems.map(item => this.itemInfoToPostBlockItem({ itemInfoObject: item })),
    }
  }

  getRefurbishmentPostBlock(refurbishScanItemArr: IItemInfo[], refurbishOption: string, refurbishStatus: string, refurbishRemarks: string, latitude: number, longitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Refurbishment",
      "OperationType": 'Refurbish',
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": "", 
      "Destination": "",
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": refurbishScanItemArr[0].Remarks,
      "Latitude": latitude,
      "Longitude": longitude,
      "Status": refurbishStatus,
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": refurbishScanItemArr.map(item => this.itemInfoToPostBlockItem({ itemInfoObject:item, refurbishType:refurbishOption, remarks:refurbishRemarks })),
    }
  }

  getMroPostBlock(mroScanItemArr: IItemInfo[], mroDocNo: string, mroActionRemarks: string, latitude: number, longitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Refurbishment",
      "OperationType": 'MRO',
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": mroDocNo, 
      "Destination": "",
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": mroActionRemarks,
      "Latitude": latitude,
      "Longitude": longitude,
      "Status": "",
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": mroScanItemArr.map(item => this.itemInfoToPostBlockItem({ itemInfoObject:item })),
    }
  }


  getPickingListOriginPostBlock(pickingScanItems: IItemInfo[], postPickingParam: IPickedItemByHHLite[], latitude: number, longitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Warehouse",
      "OperationType": 'Picking (From)',
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": "",
      "Destination": "",
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": pickingScanItems[0].Remarks,
      "Latitude": latitude,
      "Longitude": longitude,
      "Status": "",
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": pickingScanItems.map(item => this.itemInfoToPostBlockItem({ itemInfoObject: item, weight: postPickingParam.find(pickingItem => pickingItem.EPC_ID === item.EPC_ID)?.Weight})),
    }
  }

  getPickingListDestinationPostBlock(pickingScanItems: IItemInfo[], postPickingParam: IPickedItemByHHLite[], destinationCompany: { companyName: string, companyAddress: string, companyPostcode: string, companyCountry: string }, latitude: number, longitude: number): IPostBlock {
    return {
      "SupplyChainEntityType": "Warehouse",
      "OperationType": 'Picking (To)',
      "Company": destinationCompany.companyName,
      "TransactionNo": "",
      "Destination": "",
      "Address": destinationCompany.companyAddress,
      "PostCode": destinationCompany.companyPostcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": pickingScanItems[0].Remarks,
      "Latitude": latitude,
      "Longitude": longitude,
      "Status": "",
      "SubmissionDate": new Date().toISOString(),
      "Country": destinationCompany.companyCountry,
      "Items": pickingScanItems.map(item => this.itemInfoToPostBlockItem({ itemInfoObject: item, weight: postPickingParam.find(pickingItem => pickingItem.EPC_ID === item.EPC_ID)?.Weight })),
    }
  }


  getFirstOperationPostBlock(postFirstOperation: IFirstOperation, latitude: number, longitude: number, traits:IItemTraits={height:null,length:null,width: null,weight:null,lwhUom:null,weightUom:null}): IPostBlock {
    function getPostBlockItemArr(postFirstOperation: IFirstOperation, currentScanMode: ScanMode):IPostBlockItem[] {
      return postFirstOperation.Assigned_EPCIDs.map(epcItem => {
        return {
          "ProductId": epcItem.EPC_ID,
          "EPCID": epcItem.EPC_ID,
          "AutoIDType": currentScanMode.toString(),
          "ImageOfProduct": "",
          // "Brand": "",
          "Brand": postFirstOperation.Category,
          "ProductName": "",
          // "ProductDescription": "",
          "ProductDescription": postFirstOperation.Description, /* Temporary for demo */
          "RefNo": "",
          "ProductCode": postFirstOperation.SKU,
          "BatchNo": postFirstOperation.BatchNo, // TODO: If auto-running, this will be generated in the backend?
          "CountryOfOrigin": "",
          "Description": postFirstOperation.Description, 
          "Price": 0,
          "Quantity": parseInt(postFirstOperation.Packing_Quantity), 
          "Manufacturer": "",
          "RefurbishType": "",
          "ManufacturingDate": postFirstOperation.Manufacturing_Date,
          "DateOfExpire": postFirstOperation.Date_of_Expire,
          "WarrantyExpiryDate": "",
          "CalibrationDate": "",
          "GS1BarCode": "",
          "Certification": "",
          "CO2Score": "",
          // "Remarks": postFirstOperation.Remarks,
          "Remarks": postFirstOperation.BOM.map(bomItem => `${bomItem.SKU}/${bomItem.Description}`).toString(),
          "Height": traits.height?.toString() ?? "",
          "Length": traits.length?.toString() ?? "",
          "Width": traits.width?.toString() ?? "",
          "Weight": traits.weight?.toString() ?? "",
          "HeightUOM": traits.lwhUom?.toString() ?? "",
          "LengthUOM": traits.lwhUom?.toString() ?? "",
          "WidthUOM": traits.lwhUom?.toString() ?? "",
          "WeightUOM":  traits.weightUom?.toString() ?? "",
          // "Status": postFirstOperation.Operation.Status,
          "Status": 'Available',    
        } as IPostBlockItem;
      });
    }

    return {
      "SupplyChainEntityType": "Manufacturer",
      "OperationType": 'Production Traveler',
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": postFirstOperation.WO,
      "Destination": "",
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": postFirstOperation.Remarks,
      "Latitude": latitude,
      "Longitude": longitude,
      "Status": postFirstOperation.Operation.Status,
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": postFirstOperation.Assigned_EPCIDs.length > 0 ? getPostBlockItemArr(postFirstOperation, this._scanmode.currentScanMode) : [],
    };
  }

  getOperationTravelerPostBlock(postOperationTraveler: IOperationTraveler, operationTravelerScanItems: IProductionTravelerItemInfo[], latitude: number, longitude: number, traits:IItemTraits={height:null,length:null,width: null,weight:null,lwhUom:null,weightUom:null}): IPostBlock {
    return {
      "SupplyChainEntityType": "Manufacturer",
      "OperationType": 'Production Traveler',
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": postOperationTraveler.WO,
      "Destination": "",
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": postOperationTraveler.QC_Remarks,
      "Latitude": latitude,
      "Longitude": longitude,
      "Status": postOperationTraveler.Operation.Status,
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": operationTravelerScanItems.map(item => this.productionTravelerItemInfoToPostBlockItem(item, postOperationTraveler.BOM, traits)),
    };
  }

  getScrapPostBlock(scrapScanItems: IItemInfo[], latitude: number, longitude: number, remarks: string): IPostBlock {
    return {
      "SupplyChainEntityType": "Refurbishment",
      "OperationType": "Scrap",
      "Company": this._commonstore.currentUserCompany.company_Name,
      "TransactionNo": "",
      "Destination": "",
      "Address": this._commonstore.currentUserCompany.addressList[0].company_Address,
      "PostCode": this._commonstore.currentUserCompany.addressList[0].postcode,
      "Operator": this._commonstore.currentServerUser.User_Name,
      "Operator2": "",
      "Vehicle": "",
      "Remarks": remarks,
      "Latitude": latitude,
      "Longitude": longitude,
      "Status": "",
      "SubmissionDate": new Date().toISOString(),
      "Country": this._commonstore.currentUserCompany.addressList[0].country,
      "Items": scrapScanItems.map(item => this.itemInfoToPostBlockItem({ itemInfoObject: item })),
    }
  }
}
