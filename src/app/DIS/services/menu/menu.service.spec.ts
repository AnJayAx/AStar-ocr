import {TestBed} from '@angular/core/testing';
import {MenuService} from './menu.service';
import {AuthGuard} from '@dis/auth/auth.guard';
import {RouterTestingModule} from '@angular/router/testing';
import {KeycloakService} from 'keycloak-angular';

describe('MenuService', () => {
  let service: MenuService;
  let keycloak: KeycloakService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [MenuService, AuthGuard, KeycloakService]
    });
    service = TestBed.inject(MenuService);
    keycloak = TestBed.inject(KeycloakService);


  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return 0', () => {
    const result = service.filterMenuItems(new Array());
    expect(result.length).toEqual(0);
  });

  it('should return 2', () => {
    spyOn(keycloak, 'getUserRoles').and.returnValue(['inventory_list', 'inventory_forecasting']);
    const menu =  [{
        group: 'Navigation Group 1',
        // Add navigation items here
        items: [
          {
            name: 'Dashboard Sample 1',
            icon: 'crosstab',
            link: './dashboard-one',
            elevation: ['boss'] // Specify user roles allowed to see this link: NOT YET IMPLEMENTED
          },
          {
            name: 'Dashboard Sample 2',
            icon: 'crosstab',
            link: './dashboard-two',
            elevation: [] // Specify user roles allowed to see this link: NOT YET IMPLEMENTED
          },
          {
            name: 'Dashboard Sample 3',
            icon: 'crosstab',
            link: './dashboard-three',
            elevation: [] // Specify user roles allowed to see this link: NOT YET IMPLEMENTED
          }
        ]
      }];

    const result = service.filterMenuItems(menu);


    expect(result[0].items.length).toEqual(2);
  });

  it('should return 3', () => {
    spyOn(keycloak, 'getUserRoles').and.returnValue(['inventory_list', 'inventory_forecasting', 'boss']);
    const menu =  [{
      group: 'Navigation Group 1',
      // Add navigation items here
      items: [
        {
          name: 'Dashboard Sample 1',
          icon: 'crosstab',
          link: './dashboard-one',
          elevation: ['boss']
        },
        {
          name: 'Dashboard Sample 2',
          icon: 'crosstab',
          link: './dashboard-two',
          elevation: []
        },
        {
          name: 'Dashboard Sample 3',
          icon: 'crosstab',
          link: './dashboard-three',
          elevation: []
        }
      ]
    }];

    const result = service.filterMenuItems(menu);


    expect(result[0].items.length).toEqual(3);
  });

});
