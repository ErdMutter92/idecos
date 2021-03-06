import {
  Component,
  ElementRef,
  Input,
} from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { Store } from '@ngrx/store';

@Component({
  selector: 'new-entry',
  templateUrl: './newEntry.component.html',
  styleUrls: ['./newEntry.component.css']
})
export class NewEntryComponent implements ModalComponent {
  @Input('metadata') metadata;
  @Input('close') close;

  @Input('value') set value(value) {
    this.metadata.value = value;
  };

  @Input('type') set type(type: 'folder' | 'file') {
    this.metadata.type = type;
  };

  constructor(
    private store$: Store<any>,
    private _element: ElementRef,
  ){ }
  
  public ngAfterViewInit() {
    this.focus();
    this.element.addEventListener('keypress', this.keyHandler.bind(this));
  }
  
  private keyHandler(event) {
    switch(event.key) {
      case 'Enter': {
        this.store$.dispatch({
          type: `editor:${this.metadata.type}:create`,
          payload: {
            directory: this.metadata.root,
            name: this.inputValue,
          }
        });
        this.close();
        break;
      }
      case 'Escape': {
        this.close();
        break;
      }
    }
  }
  
  public focus() {
    this.element.firstChild.focus();
    this.inputValue = '';
    this.inputValue = `${this.metadata.value}/`;
  }
  
  set inputValue(value) {
    this.element.firstChild.value = value;
  }
  
  get inputValue() {
    return this.element.firstChild.value;
  }
  
  get element() {
    return this._element.nativeElement;
  }
}