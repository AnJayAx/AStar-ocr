import { Component, Input, OnInit, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { ILocations } from '@its/shared/interfaces/backend/locations';
import { ItsServiceService } from '@its/shared/services/its-service.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-location-search-dropdown',
  templateUrl: './location-search-dropdown.component.html',
  styleUrls: ['./location-search-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationSearchDropdownComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: LocationSearchDropdownComponent,
      multi: true
    }
  ]
})
export class LocationSearchDropdownComponent implements OnInit, ControlValueAccessor {

  @Input() isRequired: boolean = false;  /* if true, will produce form error if touched and undefined */
  @Input() setDefaultItem: boolean = false; /* if true, initial selected location is locationsList[0] */
  @Input() selectedLocation: ILocations;
  @Input() selectedLocationId: number;
  @Output() selectedLocationChanged: EventEmitter<ILocations> = new EventEmitter();

  disabled: boolean = false;

  locationsList:ILocations[];
  viewLocationsList: ILocations[];

  onChange: any = () => { };
  onTouched: any = () => { };

  public loc = this.isRequired ? new FormControl('', [Validators.required]) : new FormControl('');

  constructor(
    private _itsService: ItsServiceService,
  ) {
    this._itsService.getLocations()
    .pipe(take(1))
    .subscribe({
      next: (allLocations) => {
        this.locationsList = allLocations;
        this.viewLocationsList = [...this.locationsList];

        if (this.setDefaultItem && !this.selectedLocation) {
          this.selectedLocation = this.locationsList[0];
        } else if (this.selectedLocationId) {
          this.selectedLocation = this.locationsList.find(location => location.Asset_Location_ID === this.selectedLocationId);
        }

        this.onLocationChange(this.selectedLocation);
      }
    });
  }

  ngOnInit(): void {}

  onLocationChange(locationValue: ILocations): void {
    this.selectedLocation = locationValue;
    this.onChange(this.selectedLocation);
    this.selectedLocationChanged.emit(this.selectedLocation);
  }

  validate({ value }: FormControl) {
    const isInvalid = !value || value.length === 0;
    return isInvalid && { required: true }
  }

  handleFilter(filterValue: string) {
    if (filterValue?.length > 0) {
      this.viewLocationsList = this.locationsList.filter(
        (s) => s.Name?.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1
      );
    }
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: ILocations): void {
    this.selectedLocation = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
