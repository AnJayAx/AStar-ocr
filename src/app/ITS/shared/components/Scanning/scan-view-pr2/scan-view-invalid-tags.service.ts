import { Injectable } from '@angular/core';
import { IItemInfo } from '@its/shared/interfaces/backend/ItemInfo';
import { BehaviorSubject, Observable } from 'rxjs';

interface IInvalidTagDisplayItem {
  [tag: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ScanViewInvalidTagsService {

  private invalidTagConditionsMap: IInvalidTagDisplayItem = {};

  private showInvalidTags: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public showInvalidTags$: Observable<boolean> = this.showInvalidTags.asObservable();

  constructor() { }

  private addTagInvalidReasonToMap(tag: string, invalidReasons: string[]): void {
    if (!this.invalidTagConditionsMap[tag]) {
      this.invalidTagConditionsMap[tag] = [...new Set(invalidReasons)];
    } else {
      this.invalidTagConditionsMap[tag] = [...new Set(this.invalidTagConditionsMap[tag].concat(invalidReasons))];
    }
  }

  appendUnregisteredTags(tagIdArr: string[]): void {
    tagIdArr.forEach(tag => this.addTagInvalidReasonToMap(tag, ['Unregistered']));
  }

  appendInvalidCategoryTags(tagItemArr: IItemInfo[]): void {
    tagItemArr.forEach(tagItem => this.addTagInvalidReasonToMap(tagItem.EPC_ID, [`Invalid Category=${tagItem.Category}`]));
  }

  appendFilterFailTag(tagItem: IItemInfo, filterProperties: string[]): void {
    this.addTagInvalidReasonToMap(tagItem.EPC_ID, filterProperties.map(property => `Invalid ${property}=${tagItem[property]}`));
  }

  clearInvalidTags(): void {
    this.invalidTagConditionsMap = {};
  }

  showInvalidTagsDialog(): void {
    if (this.showInvalidTags.getValue() === false) {
      this.showInvalidTags.next(false);
    }
    this.showInvalidTags.next(true);
  }

  closeInvalidTagsDialog(): void {
    this.showInvalidTags.next(false);
  }

  get isInvalidTagsAvailable(): boolean {
    return Object.keys(this.invalidTagConditionsMap).length > 0;
  }

  get invalidTagsDisplayHTML(): string {
    let html = "<div>\n";
    Object.keys(this.invalidTagConditionsMap).forEach(tagId => {
      html += `<b>${tagId}</b>\n`;
      html += `<ul>`;
      const invalidReasons = this.invalidTagConditionsMap[tagId];
      invalidReasons.forEach(reason => html += `<li>${reason}</li>`);
      html += `</ul>`;
    });
    html += "</div>";
    return html;
  }
}
