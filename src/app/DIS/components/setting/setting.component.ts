import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef, ViewEncapsulation, ElementRef, ViewChild, HostListener } from '@angular/core';
import { faRightFromBracket, IconDefinition, faUser, faGear } from '@fortawesome/free-solid-svg-icons';
import { Utils } from '@its/shared/classes/utils';
import { Router } from '@angular/router';
import { ItsSettingsService } from '@its/shared/services/its-settings.service';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SettingComponent implements OnInit {
  @ViewChild("settingAnchor", { read: ElementRef }) public anchor: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup: ElementRef;
  @HostListener("document:click", ["$event"])
  public documentClick(event: KeyboardEvent): void {
    if (!this.contains(event.target)) {
      this.show = false;
    }
  }
  private contains(target: EventTarget): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }
  
  @Output() currentMenuChange = new EventEmitter<string>();
  
  public show = false;
  public settingArray: { faIcon: IconDefinition, text: string }[];

  public onToggle(): void {
    this.show = !this.show;

    this.ref.detectChanges();
  }
  
  constructor(
    private router: Router,
    private _itsSettings: ItsSettingsService,
    private ref: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this._itsSettings.keycloakUsername$.subscribe({
      next: (username) => {
        this.settingArray = [
          { faIcon: faUser, text: username },
          { faIcon: faGear, text: 'Settings' },
          { faIcon: faRightFromBracket, text: 'Sign Out' }
        ];
        this.ref.detectChanges();
      }
    });
  }

  onClick(menuId: string) {
    this.show = false;
    const normalizedId = Utils.normalized(menuId);
    this.currentMenuChange.emit(normalizedId);

    switch(normalizedId){
      case 'signout': {
        this.logout();
        break;
      }
      case 'settings': {
        this.router.navigate(['/its-settings']);
        break;
      }
    }
  }

  private logout() {
    this.router.navigate(["init-page",{ type : "logout" }]);
  }
}
