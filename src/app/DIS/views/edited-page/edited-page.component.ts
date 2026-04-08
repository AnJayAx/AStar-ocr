import {Component, Inject, OnInit, Renderer2, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ToastService} from '@dis/services/message/toast.service';

@Component({
  selector: 'app-edited-page',
  templateUrl: './edited-page.component.html',
  styleUrls: ['./edited-page.component.scss']
})
export class EditedPageComponent implements OnInit {

  @ViewChild('template', { read: TemplateRef })
  public notificationTemplate: TemplateRef<any>;
  public value = 30;

  constructor(private http: HttpClient, private toastr: ToastService) { }

  ngOnInit(): void {
  }

  onLoadingMessageButtonClick(): void {
    this.http.get('http://localhost:3000/posts').subscribe(res => {
      console.log(res);
    });

  }

  onNotificationButtonClick(): void {
    this.toastr.warning ('this is a very long message for testing notification.');
  }
}
