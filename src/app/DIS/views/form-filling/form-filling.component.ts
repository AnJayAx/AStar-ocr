import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Surface, Path, geometry, drawDOM, exportSVG} from '@progress/kendo-drawing';
import { saveAs } from '@progress/kendo-file-saver';
import {ToastService} from '@dis/services/message/toast.service';

const {Point} = geometry;

@Component({
  selector: 'app-form-filling',
  templateUrl: './form-filling.component.html',
  styleUrls: ['./form-filling.component.scss']
})
export class FormFillingComponent implements OnInit{

  // form field
  constructor(private changeDetector: ChangeDetectorRef, private toastr: ToastService) {
  }

  // for stepper
  public current = 0;
  uploadSaveUrl = 'Actual URL string';
  uploadRemoveUrl = 'Actual URL string';

  public steps = [
    { label: 'Personal Info', icon: 'user' },
    { label: 'Signature', icon: 'dictionary-add' },
    { label: 'Attachments', icon: 'attachment', optional: true },
    { label: 'Preview', icon: 'preview' },
    { label: 'Submit', icon: 'file-add' },
  ];

  public registerForm: FormGroup = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    birthDate: new FormControl(new Date(2000, 10, 10)),
    email: new FormControl('', Validators.email),
    acceptNews: new FormControl(),
  });

  // exporting signature
  @ViewChild('surface', { static: false })
  private surfaceElement: ElementRef;

  @ViewChild('drawing', { static: false })
  private drawingElement: ElementRef;

  private surface: Surface;
  private drawing: Surface;
  private path;

  ngOnInit(): void  {
  }



  public clearForm(): void {
    this.registerForm.reset();
  }
  initSignature(): void {
    this.surface = Surface.create(this.surfaceElement.nativeElement);
    this.surfaceElement.nativeElement.addEventListener(
      'mousemove',
      this.onMouseMove
    );
    this.surfaceElement.nativeElement.addEventListener(
      'mousedown',
      this.onMouseDown
    );
    this.surfaceElement.nativeElement.addEventListener(
      'mouseup',
      this.onMouseUp
    );
  }

  initDrawing(): void {
    this.drawing = Surface.create(this.drawingElement.nativeElement);
    this.drawingElement.nativeElement.addEventListener(
      'mousemove',
      this.onDrawMouseMove
    );
    this.drawingElement.nativeElement.addEventListener(
      'mousedown',
      this.onDrawMouseDown
    );
    this.drawingElement.nativeElement.addEventListener(
      'mouseup',
      this.onMouseUp
    );
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
    if ( this.surfaceElement) {
      this.surfaceElement.nativeElement.removeEventListener(
        'mousemove',
        this.onMouseMove
      );
      this.surfaceElement.nativeElement.removeEventListener(
        'mousedown',
        this.onMouseDown
      );
      this.surfaceElement.nativeElement.removeEventListener(
        'mouseup',
        this.onMouseUp
      );

    }

    if (this.surface){
      this.surface.destroy();
    }

    if ( this.drawingElement) {
      this.drawingElement.nativeElement.removeEventListener(
        'mousemove',
        this.onMouseMove
      );
      this.drawingElement.nativeElement.removeEventListener(
        'mousedown',
        this.onMouseDown
      );
      this.drawingElement.nativeElement.removeEventListener(
        'mouseup',
        this.onMouseUp
      );

    }

    if (this.drawing){
      this.drawing.destroy();
    }
  }

  onClear(): void {
    this.surface.clear();
  }

  onDrawClear(): void {
    this.drawing.clear();
  }

  export(): void {
    // Convert the DOM element to a drawing using kendo.drawing.drawDOM
    drawDOM(this.surfaceElement.nativeElement)
      .then((group) => {
        // Render the result as a SVG document
        return exportSVG(group);
      })
      .then((data) => {
        // Save the SVG document
        saveAs(data, 'signature.svg');
      });
  }

  drawExport(): void {
    // Convert the DOM element to a drawing using kendo.drawing.drawDOM
    drawDOM(this.surfaceElement.nativeElement)
      .then((group) => {
        // Render the result as a SVG document
        return exportSVG(group);
      })
      .then((data) => {
        // Save the SVG document
        saveAs(data, 'signature.svg');
      });
  }

  private onMouseMove = (e) => {
    if (!this.path) {
      return;
    }

    const offset = {
      top: this.surfaceElement.nativeElement.offsetTop,
      left: this.surfaceElement.nativeElement.offsetLeft,
    };

    const newPoint = new Point(e.pageX - offset.left, e.pageY - offset.top);

    this.path.lineTo(newPoint);
  }

  private onDrawMouseMove = (e) => {
    if (!this.path) {
      return;
    }

    const offset = {
      top: this.drawingElement.nativeElement.offsetTop,
      left: this.drawingElement.nativeElement.offsetLeft,
    };

    const newPoint = new Point(e.pageX - offset.left, e.pageY - offset.top);

    this.path.lineTo(newPoint);
  }

  private onDrawMouseDown = (e) => {
    this.path = new Path({
      stroke: {
        color: '#E4141B',
        width: 2,
        lineCap: 'round',
        lineJoin: 'round',
      },
    });

    const offset = {
      top: this.drawingElement.nativeElement.offsetTop,
      left: this.drawingElement.nativeElement.offsetLeft,
    };

    const newPoint = new Point(e.pageX - offset.left, e.pageY - offset.top);

    for (let i = 0; i < 1; i++) {
      this.path.lineTo(newPoint.clone().translate(i, 0));
    }

    this.drawing.draw(this.path);
  }

  private onMouseDown = (e) => {
    this.path = new Path({
      stroke: {
        color: '#E4141B',
        width: 2,
        lineCap: 'round',
        lineJoin: 'round',
      },
    });

    const offset = {
      top: this.surfaceElement.nativeElement.offsetTop,
      left: this.surfaceElement.nativeElement.offsetLeft,
    };

    const newPoint = new Point(e.pageX - offset.left, e.pageY - offset.top);

    for (let i = 0; i < 1; i++) {
      this.path.lineTo(newPoint.clone().translate(i, 0));
    }

    this.surface.draw(this.path);
  }

  private onMouseUp = () => (this.path = undefined);

  // file upload

  onNext(): void {
    this.current += 1;
    if  (this.current === 1) {
      this.changeDetector.detectChanges();
      this.initSignature();
      this.initDrawing();

    }else if (this.current === 4 ){
      this.toastr.success('Your request has been process successfully.');
    }
  }
  onBack(): void {
    this.current -= 1;
  }
}
