import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormControl, Validators } from '@angular/forms';
import { ICategories } from '@its/shared/interfaces/backend/categories';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-category-search-dropdown',
  templateUrl: './category-search-dropdown.component.html',
  styleUrls: ['./category-search-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySearchDropdownComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: CategorySearchDropdownComponent,
      multi: true
    }
  ]
})
export class CategorySearchDropdownComponent implements OnInit, ControlValueAccessor {

  @Input() isRequired: boolean = false;  
  @Input() setDefaultItem: boolean = false; /* if true, initial selected category is categoriesList[0] */
  @Input() selectedCategory: ICategories;
  @Input() selectedCategoryId: number;
  @Input() selectedCategoryName: string;
  @Output() selectedCategoryChanged: EventEmitter<ICategories> = new EventEmitter();
  
  disabled: boolean = false;

  categoriesList: ICategories[];
  viewCategoriesList: ICategories[];

  onChange: any = () => {};
  onTouched: any = () => {};

  public cat = this.isRequired ? new FormControl("", [Validators.required]) : new FormControl("");
  
  constructor(
    private _itsService: ItsServiceService
  ) {
    this._itsService.getCategories()
    .pipe(take(1))
    .subscribe({
      next: (allCategories) => {
        this.categoriesList = allCategories;
        this.viewCategoriesList = [...this.categoriesList];

        if (this.setDefaultItem && !this.selectedCategory) {
          this.selectedCategory = this.categoriesList[0];
        } else if (this.selectedCategoryId) {
          this.selectedCategory = this.categoriesList.find(category => category.Category_ID === this.selectedCategoryId);
        } else if (this.selectedCategoryName) {
          this.selectedCategory = this.categoriesList.find(category => category.Name.toLowerCase() === this.selectedCategoryName.toLowerCase());
        }

        this.onCategoryChange(this.selectedCategory);
      }
    })
  }

  ngOnInit(): void {}

  onCategoryChange(categoryValue: ICategories): void {
    this.selectedCategory = categoryValue;
    this.onChange(this.selectedCategory);
    this.selectedCategoryChanged.emit(this.selectedCategory);
  }

  validate({ value }: FormControl) {
    const isInvalid = !value || value.length === 0;
    return isInvalid && { required: true };
  }

  handleFilter(filterValue: string) {
    if (filterValue?.length > 0) {
      this.viewCategoriesList = this.categoriesList.filter(
        (s) => s.Name?.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1
      );
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: ICategories): void {
    this.selectedCategory = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
