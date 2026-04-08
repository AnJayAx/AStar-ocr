import { ApplicationRef, ComponentFactoryResolver, ElementRef, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { RefreshService } from './refresh.service';

@Injectable({
  providedIn: 'root'
})
export class ReloadComponentService {

  constructor(
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,

    private _refresh: RefreshService,
    private _router: Router,
  ) {}

  reloadComponent(componentType: any, elementRef: ElementRef): void {
    const currentURL = this._router.url;
    this._router.navigate(['/mainmenunew'], { skipLocationChange: true }).then(() => {
      this._router.navigate([`/${currentURL}`]).then(() => {
        console.log('[reload-component service] component has been reloaded', elementRef);
        this._refresh.refresh();
        this.recreateComponent(componentType, elementRef);
      })
    });
  }

  recreateComponent(componentType: any, elementRef: ElementRef) {
    const component = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const componentRef = component.create(this.injector);
    this.appRef.attachView(componentRef.hostView);
    const domElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    const parentElement = elementRef.nativeElement.parentElement;
    if (parentElement) {
      parentElement.innerHTML = '';
      parentElement.appendChild(domElement);
    }
  }

}
