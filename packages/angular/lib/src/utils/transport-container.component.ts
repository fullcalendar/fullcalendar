import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewEncapsulation,
  ViewChild,
  TemplateRef,
  ElementRef,
  OnChanges,
  AfterViewInit,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'transport-container',
  templateUrl: './transport-container.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class TransportContainerComponent implements OnChanges, AfterViewInit {
  @Input() containerEl!: HTMLElement; // required
  @Input() template!: TemplateRef<any>; // required
  @Input() renderProps?: any;

  @ViewChild('wrapperEl') wrapperElRef?: ElementRef;

  ngAfterViewInit() {
    this.attachWrapperEl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['containerEl'] && this.wrapperElRef) {
      this.attachWrapperEl();
    }
  }

  // Keep Preact's container in place and move only Angular's boxless wrapper into it.
  private attachWrapperEl() {
    const wrapperEl: Element | undefined = this.wrapperElRef?.nativeElement;

    if (wrapperEl && wrapperEl.parentNode !== this.containerEl) {
      this.containerEl.appendChild(wrapperEl);
    }
  }
}
