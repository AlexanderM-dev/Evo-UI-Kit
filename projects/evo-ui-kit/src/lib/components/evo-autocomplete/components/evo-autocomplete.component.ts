import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { delay, takeUntil, tap } from 'rxjs/operators';
import { isNull } from 'lodash-es';
import { EvoInputTheme } from '../../evo-input';

export type DropdownPosition = 'bottom' | 'top' | 'auto';
export type AddTagFn = ((term: string) => any | Promise<any>);
export type CompareWithFn = (a: any, b: any) => boolean;
export type GroupValueFn = (key: string | object, children: any[]) => string | object;

@Component({
    // tslint:disable-next-line
    selector: 'evo-autocomplete',
    templateUrl: './evo-autocomplete.component.html',
    styleUrls: ['./evo-autocomplete.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class EvoAutocompleteComponent implements ControlValueAccessor, AfterContentInit, AfterViewInit, OnDestroy {

    theme: EvoInputTheme = EvoInputTheme.default;

    isFocused = false;
    isSelectbox = false;

    // Inputs
    @Input() isOpen;
    @Input() items: any[];
    @Input() bindLabel: string;
    @Input() bindValue: string;
    @Input() markFirst = true;
    @Input() placeholder: string;
    @Input() notFoundText = 'Не найдено';
    @Input() typeToSearchText = 'Начните писать...';
    @Input() addTagText = 'Добавить тэг';
    @Input() loadingText = 'Идет поиск...';
    @Input() clearAllText: string;
    @Input() dropdownPosition: DropdownPosition = 'auto';
    @Input() appendTo: string;
    @Input() loading: boolean;
    @Input() closeOnSelect = true;
    @Input() hideSelected: boolean;
    @Input() selectOnTab: boolean;
    @Input() openOnEnter: boolean;
    @Input() maxSelectedItems: number;
    // tslint:disable-next-line
    @Input() groupBy: string | Function;
    @Input() groupValue: GroupValueFn;
    @Input() bufferAmount = 4;
    @Input() virtualScroll: boolean;
    @Input() selectableGroup: boolean;
    @Input() selectableGroupAsModel = true;
    @Input() searchFn: () => {};
    @Input() clearOnBackspace = true;
    @Input() typeahead: Subject<string>;
    @Input() multiple: boolean;
    @Input() multipleInline: boolean;
    @Input() addTag: boolean | AddTagFn;
    @Input() searchable = true;
    @Input() clearable = true;
    @Input() errorsMessages: {[key: string]: string};
    @Input() compareWith: CompareWithFn;

    // Fix: https://github.com/ng-select/ng-select/pull/1257
    // Don't work with custom template - labelTemp
    @Input() editQuery = false;

    // Outputs
    // tslint:disable:no-output-rename no-output-native
    @Output('blur') blurEvent = new EventEmitter();
    @Output('focus') focusEvent = new EventEmitter();
    @Output('change') changeEvent = new EventEmitter();
    @Output('open') openEvent = new EventEmitter();
    @Output('close') closeEvent = new EventEmitter();
    @Output('search') searchEvent = new EventEmitter<{term: string, items: any[]}>();
    @Output('clear') clearEvent = new EventEmitter();
    @Output('add') addEvent = new EventEmitter();
    @Output('remove') removeEvent = new EventEmitter();
    @Output('scroll') scrollEvent = new EventEmitter<{start: number; end: number}>();
    @Output('scrollToEnd') scrollToEndEvent = new EventEmitter();
    // tslint:enable:no-output-rename no-output-native

    @ViewChild(NgSelectComponent)
    ngSelectComponent: NgSelectComponent;

    @HostBinding('attr.class') hostClassName = 'evo-autocomplete';

    @ContentChild('labelTemp', {read: TemplateRef}) labelTemp: TemplateRef<any>;
    @ContentChild('optionTemp', {read: TemplateRef}) optionTemp: TemplateRef<any>;

    protected inputVal: string;

    protected readonly _destroy$ = new Subject<void>();

    protected _value: any;

    protected inputEl: HTMLInputElement;

    constructor(
        public control: NgControl,
    ) {
        control.valueAccessor = this;
    }

    @Input('isSelectbox') set setSelectbox(isSelectbox: boolean) {
        this.clearable = false;
        this.editQuery = false;
        this.searchable = false;
        this.notFoundText = '';
        this.isSelectbox = isSelectbox;
    }

    @Input('theme') set setTheme(theme: string | EvoInputTheme) {
        if (EvoInputTheme[theme]) {
            this.theme = EvoInputTheme[theme];
        }
    }

    get hasErrors(): boolean {
        return this.control.dirty && this.control.touched && this.control.invalid;
    }

    get classes(): {[key: string]: boolean} {
        return {
            'is-multiple-inline': this.multipleInline,
            'is-edit-query': this.editQuery,
            'is-selectbox': this.isSelectbox,
            'disabled': this.control.disabled,
            'touched': this.control.touched,
            'valid': this.control.valid,
            'invalid': this.control.invalid,
            [`theme-${ this.theme }`]: true,
        };
    }

    get value(): any {
        return this._value;
    }

    set value(value: any) {
        if (value !== this._value) {
            this._value = value;
            this._onChange(value);
        }
    }

    get showClear(): boolean {
        return !this.isSelectbox && this.ngSelectComponent?.showClear() || false;
    }

    ngAfterViewInit(): void {
        if (this.editQuery) {
            this.editQueryMode();
        }

        // prevent option click to close evo-modal
        this.ngSelectComponent.element.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).closest('.ng-option')) {
                e.stopPropagation();
            }
        });
    }

    ngAfterContentInit(): void {
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    writeValue(value: any): void {
        this.value = value;
        if (this.ngSelectComponent) {
            this.ngSelectComponent.writeValue(value);
        }
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (this.ngSelectComponent) {
            this.ngSelectComponent.setDisabledState(isDisabled);
        }
    }

    editQueryMode(): void {
        const ngSelectEl: HTMLElement = this.ngSelectComponent.element;
        this.inputEl = ngSelectEl.querySelector('.ng-input input');

        this.changeEvent.pipe(
            delay(0),
            tap(() => {
                this.resetSearchQuery();
                this.inputEl.value = this.inputVal || '';
            }),
            takeUntil(this._destroy$),
        ).subscribe();

        this.closeEvent.pipe(
            delay(0),
            tap(() => {
                this.resetSearchQuery();
                if (ngSelectEl.classList.contains('ng-select-focused')) {
                    this.inputEl.value = this.inputVal || '';
                }
            }),
            takeUntil(this._destroy$),
        ).subscribe();

        this.focusEvent.pipe(
            tap(() => {
                this.resetSearchQuery();
                this.inputEl.value = this.inputVal || '';
            }),
            takeUntil(this._destroy$),
        ).subscribe();

        this.blurEvent.pipe(
            tap(() => {
                this.inputEl.value = '';
            }),
            takeUntil(this._destroy$),
        ).subscribe();

        if (this.control.valueChanges) {
            this.control.valueChanges.pipe(
                tap((value) => {
                    if (!isNull(value)) {
                        this.resetSearchQuery();
                        return;
                    }
                    this.inputVal = '';
                    this.inputEl.value = '';
                }),
                takeUntil(this._destroy$),
            ).subscribe();
        }
    }

    resetSearchQuery(): void {
        const currentItem = this.ngSelectComponent.selectedItems[0];
        this.inputVal = (currentItem && currentItem.label) || '';
    }

    focus(): void {
        this.ngSelectComponent.focus();
    }

    blur(): void {
        this.ngSelectComponent.blur();
    }

    open(): void {
        this.ngSelectComponent.open();
    }

    close(): void {
        this.ngSelectComponent.close();
    }

    onFocus(event: FocusEvent): void {
        this.isFocused = true;
        this._onTouched();
        if (this.control.value) {
            this.focusEvent.emit(event);
        }
    }

    onBlur(event: FocusEvent): void {
        this.isFocused = false;
        this.blurEvent.emit(event);
    }

    onClearClick(): void {
        this.ngSelectComponent.handleClearClick();
    }

    protected _onChange = (value) => {
    }
    protected _onTouched = () => {
    }
}
