import { Injectable } from "@angular/core";

@Injectable()
export class FontSizeService {
    fontsize: string ="14px";

    get getFontSize(): string {
        return this.fontsize;
    }
    set setFontSize(value: string) {
        this.fontsize = value;
    }

    constructor() { }
}