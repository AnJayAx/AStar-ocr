import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-download-data-page',
  templateUrl: './download-data-page.component.html',
  styleUrls: ['./download-data-page.component.scss']
})
export class DownloadDataPageComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goBack() {
    this.router.navigateByUrl('/login');
  }

}
