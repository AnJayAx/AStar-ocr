import { FormControl, FormGroup } from "@angular/forms";

export const REGISTER_FORM: FormGroup = new FormGroup({
    refNo: new FormControl(),
    batchNo: new FormControl(),
    SKU: new FormControl(),
    sapSN: new FormControl(),
});
