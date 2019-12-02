/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, HostListener, NgModule, ChangeDetectorRef, ViewEncapsulation, ContentChild, ViewChild, forwardRef, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MyException } from './multiselect.model';
import { ClickOutsideDirective, ScrollDirective, styleDirective, setPosition } from './clickOutside';
import { ListFilterPipe } from './list-filter';
import { Item, Badge, Search, TemplateRenderer, CIcon } from './menu-item';
import { DataService } from './multiselect.service';
import { Subject } from 'rxjs';
import { VirtualScrollerModule, VirtualScrollerComponent } from './virtual-scroll/virtual-scroll';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
/** @type {?} */
export var DROPDOWN_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef((/**
     * @return {?}
     */
    function () { return AngularMultiSelect; })),
    multi: true
};
/** @type {?} */
export var DROPDOWN_CONTROL_VALIDATION = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef((/**
     * @return {?}
     */
    function () { return AngularMultiSelect; })),
    multi: true,
};
/** @type {?} */
var noop = (/**
 * @return {?}
 */
function () {
});
var ɵ0 = noop;
var AngularMultiSelect = /** @class */ (function () {
    function AngularMultiSelect(_elementRef, cdr, ds) {
        var _this = this;
        this._elementRef = _elementRef;
        this.cdr = cdr;
        this.ds = ds;
        this.onSelect = new EventEmitter();
        this.onDeSelect = new EventEmitter();
        this.onSelectAll = new EventEmitter();
        this.onDeSelectAll = new EventEmitter();
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onScrollToEnd = new EventEmitter();
        this.onFilterSelectAll = new EventEmitter();
        this.onFilterDeSelectAll = new EventEmitter();
        this.onAddFilterNewItem = new EventEmitter();
        this.onGroupSelect = new EventEmitter();
        this.onGroupDeSelect = new EventEmitter();
        this.virtualdata = [];
        this.searchTerm$ = new Subject();
        this.isActive = false;
        this.isSelectAll = false;
        this.isFilterSelectAll = false;
        this.isInfiniteFilterSelectAll = false;
        this.chunkIndex = [];
        this.cachedItems = [];
        this.groupCachedItems = [];
        this.itemHeight = 41.6;
        this.filterLength = 0;
        this.infiniteFilterLength = 0;
        this.dropdownListYOffset = 0;
        this.defaultSettings = {
            singleSelection: false,
            text: 'Select',
            enableCheckAll: true,
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            filterSelectAllText: 'Select all filtered results',
            filterUnSelectAllText: 'UnSelect all filtered results',
            enableSearchFilter: false,
            searchBy: [],
            maxHeight: 300,
            badgeShowLimit: 999999999999,
            classes: '',
            disabled: false,
            searchPlaceholderText: 'Search',
            showCheckbox: true,
            noDataLabel: 'No Data Available',
            searchAutofocus: true,
            lazyLoading: false,
            labelKey: 'itemName',
            primaryKey: 'id',
            position: 'bottom',
            autoPosition: true,
            enableFilterSelectAll: true,
            selectGroup: false,
            addNewItemOnFilter: false,
            addNewButtonText: "Add",
            escapeToClose: true,
            clearAll: true
        };
        this.randomSize = true;
        this.filteredList = [];
        this.virtualScroollInit = false;
        this.onTouchedCallback = noop;
        this.onChangeCallback = noop;
        this.searchTerm$.asObservable().pipe(debounceTime(1000), distinctUntilChanged(), tap((/**
         * @param {?} term
         * @return {?}
         */
        function (term) { return term; }))).subscribe((/**
         * @param {?} val
         * @return {?}
         */
        function (val) {
            _this.filterInfiniteList(val);
        }));
    }
    /**
     * @param {?} event
     * @return {?}
     */
    AngularMultiSelect.prototype.onEscapeDown = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (this.settings.escapeToClose) {
            this.closeDropdown();
        }
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.settings = Object.assign(this.defaultSettings, this.settings);
        this.cachedItems = this.cloneArray(this.data);
        if (this.settings.position == 'top') {
            setTimeout((/**
             * @return {?}
             */
            function () {
                _this.selectedListHeight = { val: 0 };
                _this.selectedListHeight.val = _this.selectedListElem.nativeElement.clientHeight;
            }));
        }
        this.subscription = this.ds.getData().subscribe((/**
         * @param {?} data
         * @return {?}
         */
        function (data) {
            if (data) {
                /** @type {?} */
                var len_1 = 0;
                data.forEach((/**
                 * @param {?} obj
                 * @param {?} i
                 * @return {?}
                 */
                function (obj, i) {
                    if (!obj.hasOwnProperty('grpTitle')) {
                        len_1++;
                    }
                }));
                _this.filterLength = len_1;
                _this.onFilterChange(data);
            }
        }));
        setTimeout((/**
         * @return {?}
         */
        function () {
            _this.calculateDropdownDirection();
        }));
        this.virtualScroollInit = false;
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    AngularMultiSelect.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes.data && !changes.data.firstChange) {
            if (this.settings.groupBy) {
                this.groupedData = this.transformData(this.data, this.settings.groupBy);
                if (this.data.length == 0) {
                    this.selectedItems = [];
                }
                this.groupCachedItems = this.cloneArray(this.groupedData);
            }
            this.cachedItems = this.cloneArray(this.data);
        }
        if (changes.settings && !changes.settings.firstChange) {
            this.settings = Object.assign(this.defaultSettings, this.settings);
        }
        if (changes.loading) {
        }
        if (this.settings.lazyLoading && this.virtualScroollInit && changes.data) {
            this.virtualdata = changes.data.currentValue;
        }
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () {
        if (this.selectedItems) {
            if (this.selectedItems.length == 0 || this.data.length == 0 || this.selectedItems.length < this.data.length) {
                this.isSelectAll = false;
            }
        }
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        if (this.settings.lazyLoading) {
            // this._elementRef.nativeElement.getElementsByClassName("lazyContainer")[0].addEventListener('scroll', this.onScroll.bind(this));
        }
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.ngAfterViewChecked = /**
     * @return {?}
     */
    function () {
        if (this.selectedListElem.nativeElement.clientHeight && this.settings.position == 'top' && this.selectedListHeight) {
            this.selectedListHeight.val = this.selectedListElem.nativeElement.clientHeight;
            this.cdr.detectChanges();
        }
    };
    /**
     * @param {?} item
     * @param {?} index
     * @param {?} evt
     * @return {?}
     */
    AngularMultiSelect.prototype.onItemClick = /**
     * @param {?} item
     * @param {?} index
     * @param {?} evt
     * @return {?}
     */
    function (item, index, evt) {
        if (this.settings.disabled) {
            return false;
        }
        /** @type {?} */
        var found = this.isSelected(item);
        /** @type {?} */
        var limit = this.selectedItems.length < this.settings.limitSelection ? true : false;
        if (!found) {
            if (this.settings.limitSelection) {
                if (limit) {
                    this.addSelected(item);
                    this.onSelect.emit(item);
                }
            }
            else {
                this.addSelected(item);
                this.onSelect.emit(item);
            }
        }
        else {
            this.removeSelected(item);
            this.onDeSelect.emit(item);
        }
        if (this.isSelectAll || this.data.length > this.selectedItems.length) {
            this.isSelectAll = false;
        }
        if (this.data.length == this.selectedItems.length) {
            this.isSelectAll = true;
        }
        if (this.settings.groupBy) {
            this.updateGroupInfo(item);
        }
    };
    /**
     * @param {?} c
     * @return {?}
     */
    AngularMultiSelect.prototype.validate = /**
     * @param {?} c
     * @return {?}
     */
    function (c) {
        return null;
    };
    /**
     * @param {?} value
     * @return {?}
     */
    AngularMultiSelect.prototype.writeValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        if (value !== undefined && value !== null && value !== '') {
            if (this.settings.singleSelection) {
                if (this.settings.groupBy) {
                    this.groupedData = this.transformData(this.data, this.settings.groupBy);
                    this.groupCachedItems = this.cloneArray(this.groupedData);
                    this.selectedItems = [value[0]];
                }
                else {
                    try {
                        if (value.length > 1) {
                            this.selectedItems = [value[0]];
                            throw new MyException(404, { "msg": "Single Selection Mode, Selected Items cannot have more than one item." });
                        }
                        else {
                            this.selectedItems = value;
                        }
                    }
                    catch (e) {
                        console.error(e.body.msg);
                    }
                }
            }
            else {
                if (this.settings.limitSelection) {
                    this.selectedItems = value.slice(0, this.settings.limitSelection);
                }
                else {
                    this.selectedItems = value;
                }
                if (this.selectedItems.length === this.data.length && this.data.length > 0) {
                    this.isSelectAll = true;
                }
                if (this.settings.groupBy) {
                    this.groupedData = this.transformData(this.data, this.settings.groupBy);
                    this.groupCachedItems = this.cloneArray(this.groupedData);
                }
            }
        }
        else {
            this.selectedItems = [];
        }
    };
    //From ControlValueAccessor interface
    //From ControlValueAccessor interface
    /**
     * @param {?} fn
     * @return {?}
     */
    AngularMultiSelect.prototype.registerOnChange = 
    //From ControlValueAccessor interface
    /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        this.onChangeCallback = fn;
    };
    //From ControlValueAccessor interface
    //From ControlValueAccessor interface
    /**
     * @param {?} fn
     * @return {?}
     */
    AngularMultiSelect.prototype.registerOnTouched = 
    //From ControlValueAccessor interface
    /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        this.onTouchedCallback = fn;
    };
    /**
     * @param {?} index
     * @param {?} item
     * @return {?}
     */
    AngularMultiSelect.prototype.trackByFn = /**
     * @param {?} index
     * @param {?} item
     * @return {?}
     */
    function (index, item) {
        return item[this.settings.primaryKey];
    };
    /**
     * @param {?} clickedItem
     * @return {?}
     */
    AngularMultiSelect.prototype.isSelected = /**
     * @param {?} clickedItem
     * @return {?}
     */
    function (clickedItem) {
        var _this = this;
        /** @type {?} */
        var found = false;
        this.selectedItems && this.selectedItems.forEach((/**
         * @param {?} item
         * @return {?}
         */
        function (item) {
            if (clickedItem[_this.settings.primaryKey] === item[_this.settings.primaryKey]) {
                found = true;
            }
        }));
        return found;
    };
    /**
     * @param {?} item
     * @return {?}
     */
    AngularMultiSelect.prototype.addSelected = /**
     * @param {?} item
     * @return {?}
     */
    function (item) {
        if (this.settings.singleSelection) {
            this.selectedItems = [];
            this.selectedItems.push(item);
            this.closeDropdown();
        }
        else
            this.selectedItems.push(item);
        this.onChangeCallback(this.selectedItems);
        this.onTouchedCallback(this.selectedItems);
    };
    /**
     * @param {?} clickedItem
     * @return {?}
     */
    AngularMultiSelect.prototype.removeSelected = /**
     * @param {?} clickedItem
     * @return {?}
     */
    function (clickedItem) {
        var _this = this;
        this.selectedItems && this.selectedItems.forEach((/**
         * @param {?} item
         * @return {?}
         */
        function (item) {
            if (clickedItem[_this.settings.primaryKey] === item[_this.settings.primaryKey]) {
                _this.selectedItems.splice(_this.selectedItems.indexOf(item), 1);
            }
        }));
        this.onChangeCallback(this.selectedItems);
        this.onTouchedCallback(this.selectedItems);
    };
    /**
     * @param {?} evt
     * @return {?}
     */
    AngularMultiSelect.prototype.toggleDropdown = /**
     * @param {?} evt
     * @return {?}
     */
    function (evt) {
        var _this = this;
        if (this.settings.disabled) {
            return false;
        }
        this.isActive = !this.isActive;
        if (this.isActive) {
            if (this.settings.searchAutofocus && this.searchInput && this.settings.enableSearchFilter && !this.searchTempl) {
                setTimeout((/**
                 * @return {?}
                 */
                function () {
                    _this.searchInput.nativeElement.focus();
                }), 0);
            }
            this.onOpen.emit(true);
        }
        else {
            this.onClose.emit(false);
        }
        setTimeout((/**
         * @return {?}
         */
        function () {
            _this.calculateDropdownDirection();
        }), 0);
        if (this.settings.lazyLoading) {
            this.virtualdata = this.data;
            this.virtualScroollInit = true;
        }
        evt.preventDefault();
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.openDropdown = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.settings.disabled) {
            return false;
        }
        this.isActive = true;
        if (this.settings.searchAutofocus && this.searchInput && this.settings.enableSearchFilter && !this.searchTempl) {
            setTimeout((/**
             * @return {?}
             */
            function () {
                _this.searchInput.nativeElement.focus();
            }), 0);
        }
        this.onOpen.emit(true);
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.closeDropdown = /**
     * @return {?}
     */
    function () {
        if (this.searchInput && this.settings.lazyLoading) {
            this.searchInput.nativeElement.value = "";
        }
        if (this.searchInput) {
            this.searchInput.nativeElement.value = "";
        }
        this.filter = "";
        this.isActive = false;
        this.onClose.emit(false);
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.closeDropdownOnClickOut = /**
     * @return {?}
     */
    function () {
        if (this.isActive) {
            if (this.searchInput && this.settings.lazyLoading) {
                this.searchInput.nativeElement.value = "";
            }
            if (this.searchInput) {
                this.searchInput.nativeElement.value = "";
            }
            this.filter = "";
            this.isActive = false;
            this.clearSearch();
            this.onClose.emit(false);
        }
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.toggleSelectAll = /**
     * @return {?}
     */
    function () {
        if (!this.isSelectAll) {
            this.selectedItems = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((/**
                 * @param {?} obj
                 * @return {?}
                 */
                function (obj) {
                    obj.selected = true;
                }));
                this.groupCachedItems.forEach((/**
                 * @param {?} obj
                 * @return {?}
                 */
                function (obj) {
                    obj.selected = true;
                }));
            }
            this.selectedItems = this.data.slice();
            this.isSelectAll = true;
            this.onChangeCallback(this.selectedItems);
            this.onTouchedCallback(this.selectedItems);
            this.onSelectAll.emit(this.selectedItems);
        }
        else {
            if (this.settings.groupBy) {
                this.groupedData.forEach((/**
                 * @param {?} obj
                 * @return {?}
                 */
                function (obj) {
                    obj.selected = false;
                }));
                this.groupCachedItems.forEach((/**
                 * @param {?} obj
                 * @return {?}
                 */
                function (obj) {
                    obj.selected = false;
                }));
            }
            this.selectedItems = [];
            this.isSelectAll = false;
            this.onChangeCallback(this.selectedItems);
            this.onTouchedCallback(this.selectedItems);
            this.onDeSelectAll.emit(this.selectedItems);
        }
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.filterGroupedList = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.filter == "" || this.filter == null) {
            this.clearSearch();
            return;
        }
        this.groupedData = this.cloneArray(this.groupCachedItems);
        this.groupedData = this.groupedData.filter((/**
         * @param {?} obj
         * @return {?}
         */
        function (obj) {
            /** @type {?} */
            var arr = [];
            if (obj[_this.settings.labelKey].toLowerCase().indexOf(_this.filter.toLowerCase()) > -1) {
                arr = obj.list;
            }
            else {
                arr = obj.list.filter((/**
                 * @param {?} t
                 * @return {?}
                 */
                function (t) {
                    return t[_this.settings.labelKey].toLowerCase().indexOf(_this.filter.toLowerCase()) > -1;
                }));
            }
            obj.list = arr;
            if (obj[_this.settings.labelKey].toLowerCase().indexOf(_this.filter.toLowerCase()) > -1) {
                return arr;
            }
            else {
                return arr.some((/**
                 * @param {?} cat
                 * @return {?}
                 */
                function (cat) {
                    return cat[_this.settings.labelKey].toLowerCase().indexOf(_this.filter.toLowerCase()) > -1;
                }));
            }
        }));
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.toggleFilterSelectAll = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this.isFilterSelectAll) {
            /** @type {?} */
            var added_1 = [];
            if (this.settings.groupBy) {
                /*                 this.groupedData.forEach((item: any) => {
                                    if (item.list) {
                                        item.list.forEach((el: any) => {
                                            if (!this.isSelected(el)) {
                                                this.addSelected(el);
                                                added.push(el);
                                            }
                                        });
                                    }
                                    this.updateGroupInfo(item);
                
                                }); */
                this.ds.getFilteredData().forEach((/**
                 * @param {?} el
                 * @return {?}
                 */
                function (el) {
                    if (!_this.isSelected(el) && !el.hasOwnProperty('grpTitle')) {
                        _this.addSelected(el);
                        added_1.push(el);
                    }
                }));
            }
            else {
                this.ds.getFilteredData().forEach((/**
                 * @param {?} item
                 * @return {?}
                 */
                function (item) {
                    if (!_this.isSelected(item)) {
                        _this.addSelected(item);
                        added_1.push(item);
                    }
                }));
            }
            this.isFilterSelectAll = true;
            this.onFilterSelectAll.emit(added_1);
        }
        else {
            /** @type {?} */
            var removed_1 = [];
            if (this.settings.groupBy) {
                /*                 this.groupedData.forEach((item: any) => {
                                    if (item.list) {
                                        item.list.forEach((el: any) => {
                                            if (this.isSelected(el)) {
                                                this.removeSelected(el);
                                                removed.push(el);
                                            }
                                        });
                                    }
                                }); */
                this.ds.getFilteredData().forEach((/**
                 * @param {?} el
                 * @return {?}
                 */
                function (el) {
                    if (_this.isSelected(el)) {
                        _this.removeSelected(el);
                        removed_1.push(el);
                    }
                }));
            }
            else {
                this.ds.getFilteredData().forEach((/**
                 * @param {?} item
                 * @return {?}
                 */
                function (item) {
                    if (_this.isSelected(item)) {
                        _this.removeSelected(item);
                        removed_1.push(item);
                    }
                }));
            }
            this.isFilterSelectAll = false;
            this.onFilterDeSelectAll.emit(removed_1);
        }
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.toggleInfiniteFilterSelectAll = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this.isInfiniteFilterSelectAll) {
            this.virtualdata.forEach((/**
             * @param {?} item
             * @return {?}
             */
            function (item) {
                if (!_this.isSelected(item)) {
                    _this.addSelected(item);
                }
            }));
            this.isInfiniteFilterSelectAll = true;
        }
        else {
            this.virtualdata.forEach((/**
             * @param {?} item
             * @return {?}
             */
            function (item) {
                if (_this.isSelected(item)) {
                    _this.removeSelected(item);
                }
            }));
            this.isInfiniteFilterSelectAll = false;
        }
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.clearSearch = /**
     * @return {?}
     */
    function () {
        if (this.settings.groupBy) {
            this.groupedData = [];
            this.groupedData = this.cloneArray(this.groupCachedItems);
        }
        this.filter = "";
        this.isFilterSelectAll = false;
    };
    /**
     * @param {?} data
     * @return {?}
     */
    AngularMultiSelect.prototype.onFilterChange = /**
     * @param {?} data
     * @return {?}
     */
    function (data) {
        var _this = this;
        if (this.filter && this.filter == "" || data.length == 0) {
            this.isFilterSelectAll = false;
        }
        /** @type {?} */
        var cnt = 0;
        data.forEach((/**
         * @param {?} item
         * @return {?}
         */
        function (item) {
            if (!item.hasOwnProperty('grpTitle') && _this.isSelected(item)) {
                cnt++;
            }
        }));
        if (cnt > 0 && this.filterLength == cnt) {
            this.isFilterSelectAll = true;
        }
        else if (cnt > 0 && this.filterLength != cnt) {
            this.isFilterSelectAll = false;
        }
        this.cdr.detectChanges();
    };
    /**
     * @param {?} arr
     * @return {?}
     */
    AngularMultiSelect.prototype.cloneArray = /**
     * @param {?} arr
     * @return {?}
     */
    function (arr) {
        /** @type {?} */
        var i;
        /** @type {?} */
        var copy;
        if (Array.isArray(arr)) {
            return JSON.parse(JSON.stringify(arr));
        }
        else if (typeof arr === 'object') {
            throw 'Cannot clone array containing an object!';
        }
        else {
            return arr;
        }
    };
    /**
     * @param {?} item
     * @return {?}
     */
    AngularMultiSelect.prototype.updateGroupInfo = /**
     * @param {?} item
     * @return {?}
     */
    function (item) {
        var _this = this;
        /** @type {?} */
        var key = this.settings.groupBy;
        this.groupedData.forEach((/**
         * @param {?} obj
         * @return {?}
         */
        function (obj) {
            /** @type {?} */
            var cnt = 0;
            if (obj.grpTitle && (item[key] == obj[key])) {
                if (obj.list) {
                    obj.list.forEach((/**
                     * @param {?} el
                     * @return {?}
                     */
                    function (el) {
                        if (_this.isSelected(el)) {
                            cnt++;
                        }
                    }));
                }
            }
            if (obj.list && (cnt === obj.list.length) && (item[key] == obj[key])) {
                obj.selected = true;
            }
            else if (obj.list && (cnt != obj.list.length) && (item[key] == obj[key])) {
                obj.selected = false;
            }
        }));
        this.groupCachedItems.forEach((/**
         * @param {?} obj
         * @return {?}
         */
        function (obj) {
            /** @type {?} */
            var cnt = 0;
            if (obj.grpTitle && (item[key] == obj[key])) {
                if (obj.list) {
                    obj.list.forEach((/**
                     * @param {?} el
                     * @return {?}
                     */
                    function (el) {
                        if (_this.isSelected(el)) {
                            cnt++;
                        }
                    }));
                }
            }
            if (obj.list && (cnt === obj.list.length) && (item[key] == obj[key])) {
                obj.selected = true;
            }
            else if (obj.list && (cnt != obj.list.length) && (item[key] == obj[key])) {
                obj.selected = false;
            }
        }));
    };
    /**
     * @param {?} arr
     * @param {?} field
     * @return {?}
     */
    AngularMultiSelect.prototype.transformData = /**
     * @param {?} arr
     * @param {?} field
     * @return {?}
     */
    function (arr, field) {
        var _this = this;
        /** @type {?} */
        var groupedObj = arr.reduce((/**
         * @param {?} prev
         * @param {?} cur
         * @return {?}
         */
        function (prev, cur) {
            if (!prev[cur[field]]) {
                prev[cur[field]] = [cur];
            }
            else {
                prev[cur[field]].push(cur);
            }
            return prev;
        }), {});
        /** @type {?} */
        var tempArr = [];
        Object.keys(groupedObj).map((/**
         * @param {?} x
         * @return {?}
         */
        function (x) {
            /** @type {?} */
            var obj = {};
            obj["grpTitle"] = true;
            obj[_this.settings.labelKey] = x;
            obj[_this.settings.groupBy] = x;
            obj['selected'] = false;
            obj['list'] = [];
            /** @type {?} */
            var cnt = 0;
            groupedObj[x].forEach((/**
             * @param {?} item
             * @return {?}
             */
            function (item) {
                item['list'] = [];
                obj.list.push(item);
                if (_this.isSelected(item)) {
                    cnt++;
                }
            }));
            if (cnt == obj.list.length) {
                obj.selected = true;
            }
            else {
                obj.selected = false;
            }
            tempArr.push(obj);
            // obj.list.forEach((item: any) => {
            //     tempArr.push(item);
            // });
        }));
        return tempArr;
    };
    /**
     * @param {?} evt
     * @return {?}
     */
    AngularMultiSelect.prototype.filterInfiniteList = /**
     * @param {?} evt
     * @return {?}
     */
    function (evt) {
        var _this = this;
        /** @type {?} */
        var filteredElems = [];
        if (this.settings.groupBy) {
            this.groupedData = this.groupCachedItems.slice();
        }
        else {
            this.data = this.cachedItems.slice();
            this.virtualdata = this.cachedItems.slice();
        }
        if ((evt != null || evt != '') && !this.settings.groupBy) {
            if (this.settings.searchBy.length > 0) {
                var _loop_1 = function (t) {
                    this_1.virtualdata.filter((/**
                     * @param {?} el
                     * @return {?}
                     */
                    function (el) {
                        if (el[_this.settings.searchBy[t].toString()].toString().toLowerCase().indexOf(evt.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                        }
                    }));
                };
                var this_1 = this;
                for (var t = 0; t < this.settings.searchBy.length; t++) {
                    _loop_1(t);
                }
            }
            else {
                this.virtualdata.filter((/**
                 * @param {?} el
                 * @return {?}
                 */
                function (el) {
                    for (var prop in el) {
                        if (el[prop].toString().toLowerCase().indexOf(evt.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                            break;
                        }
                    }
                }));
            }
            this.virtualdata = [];
            this.virtualdata = filteredElems;
            this.infiniteFilterLength = this.virtualdata.length;
        }
        if (evt.toString() != '' && this.settings.groupBy) {
            this.groupedData.filter((/**
             * @param {?} el
             * @return {?}
             */
            function (el) {
                if (el.hasOwnProperty('grpTitle')) {
                    filteredElems.push(el);
                }
                else {
                    for (var prop in el) {
                        if (el[prop].toString().toLowerCase().indexOf(evt.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                            break;
                        }
                    }
                }
            }));
            this.groupedData = [];
            this.groupedData = filteredElems;
            this.infiniteFilterLength = this.groupedData.length;
        }
        else if (evt.toString() == '' && this.cachedItems.length > 0) {
            this.virtualdata = [];
            this.virtualdata = this.cachedItems;
            this.infiniteFilterLength = 0;
        }
        this.virtualScroller.refresh();
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.resetInfiniteSearch = /**
     * @return {?}
     */
    function () {
        this.filter = "";
        this.isInfiniteFilterSelectAll = false;
        this.virtualdata = [];
        this.virtualdata = this.cachedItems;
        this.groupedData = this.groupCachedItems;
        this.infiniteFilterLength = 0;
    };
    /**
     * @param {?} e
     * @return {?}
     */
    AngularMultiSelect.prototype.onScrollEnd = /**
     * @param {?} e
     * @return {?}
     */
    function (e) {
        if (e.endIndex === this.data.length - 1 || e.startIndex === 0) {
        }
        this.onScrollToEnd.emit(e);
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    };
    /**
     * @param {?} item
     * @return {?}
     */
    AngularMultiSelect.prototype.selectGroup = /**
     * @param {?} item
     * @return {?}
     */
    function (item) {
        var _this = this;
        if (item.selected) {
            item.selected = false;
            item.list.forEach((/**
             * @param {?} obj
             * @return {?}
             */
            function (obj) {
                _this.removeSelected(obj);
            }));
            this.updateGroupInfo(item);
            this.onGroupSelect.emit(item);
        }
        else {
            item.selected = true;
            item.list.forEach((/**
             * @param {?} obj
             * @return {?}
             */
            function (obj) {
                if (!_this.isSelected(obj)) {
                    _this.addSelected(obj);
                }
            }));
            this.updateGroupInfo(item);
            this.onGroupDeSelect.emit(item);
        }
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.addFilterNewItem = /**
     * @return {?}
     */
    function () {
        this.onAddFilterNewItem.emit(this.filter);
        this.filterPipe = new ListFilterPipe(this.ds);
        this.filterPipe.transform(this.data, this.filter, this.settings.searchBy);
    };
    /**
     * @return {?}
     */
    AngularMultiSelect.prototype.calculateDropdownDirection = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var shouldOpenTowardsTop = this.settings.position == 'top';
        if (this.settings.autoPosition) {
            /** @type {?} */
            var dropdownHeight = this.dropdownListElem.nativeElement.clientHeight;
            /** @type {?} */
            var viewportHeight = document.documentElement.clientHeight;
            /** @type {?} */
            var selectedListBounds = this.selectedListElem.nativeElement.getBoundingClientRect();
            /** @type {?} */
            var spaceOnTop = selectedListBounds.top;
            /** @type {?} */
            var spaceOnBottom = viewportHeight - selectedListBounds.top;
            if (spaceOnBottom < spaceOnTop && dropdownHeight < spaceOnTop) {
                this.openTowardsTop(true);
            }
            else {
                this.openTowardsTop(false);
            }
            // Keep preference if there is not enough space on either the top or bottom
            /* 			if (spaceOnTop || spaceOnBottom) {
                            if (shouldOpenTowardsTop) {
                                shouldOpenTowardsTop = spaceOnTop;
                            } else {
                                shouldOpenTowardsTop = !spaceOnBottom;
                            }
                        } */
        }
    };
    /**
     * @param {?} value
     * @return {?}
     */
    AngularMultiSelect.prototype.openTowardsTop = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        if (value && this.selectedListElem.nativeElement.clientHeight) {
            this.dropdownListYOffset = 15 + this.selectedListElem.nativeElement.clientHeight;
        }
        else {
            this.dropdownListYOffset = 0;
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    AngularMultiSelect.prototype.clearSelection = /**
     * @param {?} e
     * @return {?}
     */
    function (e) {
        if (this.settings.groupBy) {
            this.groupCachedItems.forEach((/**
             * @param {?} obj
             * @return {?}
             */
            function (obj) {
                obj.selected = false;
            }));
        }
        this.clearSearch();
        this.selectedItems = [];
        this.onDeSelectAll.emit(this.selectedItems);
    };
    AngularMultiSelect.decorators = [
        { type: Component, args: [{
                    selector: 'angular2-multiselect',
                    template: "<div class=\"cuppa-dropdown\" (clickOutside)=\"closeDropdownOnClickOut()\">\n    <div class=\"selected-list\" #selectedList>\n        <div class=\"c-btn\" (click)=\"toggleDropdown($event)\" [ngClass]=\"{'disabled': settings.disabled}\" [attr.tabindex]=\"0\">\n\n            <span *ngIf=\"selectedItems?.length == 0\">{{settings.text}}</span>\n            <span *ngIf=\"settings.singleSelection && !badgeTempl\">\n                <span *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);\">\n                    {{item[settings.labelKey]}}\n                </span>\n            </span>\n            <span class=\"c-list\" *ngIf=\"selectedItems?.length > 0 && settings.singleSelection && badgeTempl \">\n                <div class=\"c-token\" *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);let k = index\">\n                <span *ngIf=\"!badgeTempl\" class=\"c-label\">{{item[settings.labelKey]}}</span>\n\n            <span *ngIf=\"badgeTempl\" class=\"c-label\">\n                            <c-templateRenderer [data]=\"badgeTempl\" [item]=\"item\"></c-templateRenderer>\n                        </span>\n            <span class=\"c-remove\" (click)=\"onItemClick(item,k,$event);$event.stopPropagation()\">\n                <c-icon [name]=\"'remove'\"></c-icon>\n            </span>\n        </div>\n        </span>\n        <div class=\"c-list\" *ngIf=\"selectedItems?.length > 0 && !settings.singleSelection\">\n            <div class=\"c-token\" *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);let k = index\" [hidden]=\"k > settings.badgeShowLimit-1\">\n                <span *ngIf=\"!badgeTempl\" class=\"c-label\">{{item[settings.labelKey]}}</span>\n                <span *ngIf=\"badgeTempl\" class=\"c-label\">\n                    <c-templateRenderer [data]=\"badgeTempl\" [item]=\"item\"></c-templateRenderer>\n                </span>\n                <span class=\"c-remove\" (click)=\"onItemClick(item,k,$event);$event.stopPropagation()\">\n                    <c-icon [name]=\"'remove'\"></c-icon>\n                </span>\n            </div>\n        </div>\n        <span class=\"countplaceholder\" *ngIf=\"selectedItems?.length > settings.badgeShowLimit\">+{{selectedItems?.length - settings.badgeShowLimit }}</span>\n        <span class=\"c-remove clear-all\" *ngIf=\"settings.clearAll && selectedItems?.length > 0 && !settings.disabled\" (click)=\"clearSelection($event);$event.stopPropagation()\">\n            <c-icon [name]=\"'remove'\"></c-icon>\n        </span>\n        <span *ngIf=\"!isActive\" class=\"c-angle-down\">\n    <c-icon [name]=\"'angle-down'\"></c-icon>\n            </span>\n        <span *ngIf=\"isActive\" class=\"c-angle-up\">\n            <c-icon [name]=\"'angle-up'\"></c-icon>\n\n            </span>\n    </div>\n</div>\n<div #dropdownList class=\"dropdown-list animated fadeIn\"\n[ngClass]=\"{'dropdown-list-top': dropdownListYOffset}\"\n[style.bottom.px]=\"dropdownListYOffset ? dropdownListYOffset : null\"\n[hidden]=\"!isActive\">\n    <div [ngClass]=\"{'arrow-up': !dropdownListYOffset, 'arrow-down': dropdownListYOffset}\" class=\"arrow-2\"></div>\n    <div [ngClass]=\"{'arrow-up': !dropdownListYOffset, 'arrow-down': dropdownListYOffset}\"></div>\n<div class=\"list-area\" [ngClass]=\"{'single-select-mode': settings.singleSelection }\">\n        <div class=\"pure-checkbox select-all\" *ngIf=\"settings.enableCheckAll && !settings.singleSelection && !settings.limitSelection && data?.length > 0\"\n            (click)=\"toggleSelectAll()\">\n            <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\"\n            />\n            <label>\n                <span [hidden]=\"isSelectAll\">{{settings.selectAllText}}</span>\n                <span [hidden]=\"!isSelectAll\">{{settings.unSelectAllText}}</span>\n            </label>\n        </div>\n        <img class=\"loading-icon\" *ngIf=\"loading\" src=\"assets/img/loading.gif\"/>\n        <div class=\"list-filter\" *ngIf=\"settings.enableSearchFilter\">\n            <span class=\"c-search\">\n                <c-icon [name]=\"'search'\"></c-icon>\n                </span>\n            <span *ngIf=\"!settings.lazyLoading\" [hidden]=\"filter == undefined || filter?.length == 0\" class=\"c-clear\" (click)=\"clearSearch()\">\n                <c-icon [name]=\"'clear'\"></c-icon>\n                </span>\n            <span *ngIf=\"settings.lazyLoading\" [hidden]=\"filter == undefined || filter?.length == 0\" class=\"c-clear\" (click)=\"resetInfiniteSearch()\">\n                <c-icon [name]=\"'clear'\"></c-icon>\n                </span>\n\n            <input class=\"c-input\" *ngIf=\"settings.groupBy && !settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterGroupedList()\">\n                <input class=\"c-input\" *ngIf=\"!settings.groupBy && !settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" >\n            <input class=\"c-input\" *ngIf=\"settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"searchTerm$.next($event.target.value)\">\n            <!--            <input class=\"c-input\" *ngIf=\"!settings.lazyLoading && !searchTempl && settings.groupBy\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterGroupList($event)\">-->\n            <c-templateRenderer *ngIf=\"searchTempl\" [data]=\"searchTempl\" [item]=\"item\"></c-templateRenderer>\n        </div>\n        <div class=\"filter-select-all\" *ngIf=\"!settings.lazyLoading && settings.enableFilterSelectAll\">\n            <div class=\"pure-checkbox select-all\" *ngIf=\"!settings.groupBy && filter?.length > 0 && filterLength > 0\" (click)=\"toggleFilterSelectAll()\">\n                <input type=\"checkbox\" [checked]=\"isFilterSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\" />\n                <label>\n                <span [hidden]=\"isFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                <span [hidden]=\"!isFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n            </label>\n            </div>\n            <div class=\"pure-checkbox select-all\" *ngIf=\"settings.groupBy && filter?.length > 0 && groupedData?.length > 0\" (click)=\"toggleFilterSelectAll()\">\n                    <input type=\"checkbox\" [checked]=\"isFilterSelectAll && filter?.length > 0\" [disabled]=\"settings.limitSelection == selectedItems?.length\" />\n                    <label>\n                    <span [hidden]=\"isFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                    <span [hidden]=\"!isFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n                </label>\n                </div>\n            <label class=\"nodata-label\" *ngIf=\"!settings.groupBy && filterLength == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">{{settings.noDataLabel}}</label>\n            <label class=\"nodata-label\" *ngIf=\"settings.groupBy && groupedData?.length == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">{{settings.noDataLabel}}</label>\n\n            <div class=\"btn-container\" *ngIf=\"settings.addNewItemOnFilter && filterLength == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">\n            <button class=\"c-btn btn-iceblue\" (click)=\"addFilterNewItem()\">{{settings.addNewButtonText}}</button>\n            </div>\n        </div>\n        <div class=\"filter-select-all\" *ngIf=\"settings.lazyLoading && settings.enableFilterSelectAll\">\n            <div class=\"pure-checkbox select-all\" *ngIf=\"filter?.length > 0 && infiniteFilterLength > 0\" (click)=\"toggleInfiniteFilterSelectAll()\">\n                <input type=\"checkbox\" [checked]=\"isInfiniteFilterSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\"\n                />\n                <label>\n                <span [hidden]=\"isInfiniteFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                <span [hidden]=\"!isInfiniteFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n            </label>\n            </div>\n        </div>\n\n        <div *ngIf=\"!settings.groupBy && !settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <li *ngFor=\"let item of data | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                    class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n            </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n                <ul virtualScroller #scroll [enableUnequalChildrenSizes]=\"randomSize\" [items]=\"virtualdata\" (vsStart)=\"onScrollEnd($event)\"\n                (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\" class=\"lazyContainer\">\n                    <li *ngFor=\"let item of scroll.viewPortItems; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                        class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                        <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                        />\n                        <label>{{item[settings.labelKey]}}</label>\n                    </li>\n                </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && !settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <li *ngFor=\"let item of data | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                    class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n            </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n                <ul virtualScroller #scroll2 [enableUnequalChildrenSizes]=\"randomSize\" [items]=\"virtualdata\" (vsStart)=\"onScrollEnd($event)\"\n                (vsEnd)=\"onScrollEnd($event)\" class=\"lazyContainer\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n                    <li *ngFor=\"let item of scroll2.viewPortItems; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                        class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                        <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                        />\n                        <label></label>\n                        <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                    </li>\n                </ul>\n        </div>\n        <div *ngIf=\"settings.groupBy && settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul virtualScroller #scroll3 [enableUnequalChildrenSizes]=\"randomSize\" [items]=\"virtualdata\" (vsStart)=\"onScrollEnd($event)\"\n            (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\" class=\"lazyContainer\">\n                <span *ngFor=\"let item of scroll3.viewPortItems; let i = index;\">\n                <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !settings.singleSelection\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                <li *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                </span>\n            </ul>\n        </div>\n        <div *ngIf=\"settings.groupBy && !settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <span *ngFor=\"let item of groupedData; let i = index;\">\n                    <li (click)=\"selectGroup(item)\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !settings.singleSelection\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                    <ul class=\"lazyContainer\">\n                        <span *ngFor=\"let val of item.list ; let j = index;\">\n                        <li (click)=\"onItemClick(val,j,$event); $event.stopPropagation()\" [ngClass]=\"{'grp-title': val.grpTitle,'grp-item': !val.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                                <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(val)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(val)\"\n                                />\n                                <label></label>\n                                <c-templateRenderer [data]=\"itemTempl\" [item]=\"val\"></c-templateRenderer>\n                            </li>\n                            </span>\n                </ul>\n                    \n                </li>\n                </span>\n            </ul>\n        </div>\n        <div *ngIf=\"settings.groupBy && settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroller [items]=\"groupedData\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n                <ul virtualScroller #scroll4 [enableUnequalChildrenSizes]=\"randomSize\" [items]=\"virtualdata\" (vsStart)=\"onScrollEnd($event)\"\n                (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\" class=\"lazyContainer\">\n                    <span *ngFor=\"let item of scroll4.viewPortItems; let i = index;\">\n                <li  *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection, 'selected-item': isSelected(item) == true }\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle && !settings.singleSelection\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection, 'selected-item': isSelected(item) == true }\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                </span>\n                </ul>\n            </virtual-scroller>\n        </div>\n        <div *ngIf=\"settings.groupBy && !settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                    <span *ngFor=\"let item of groupedData ; let i = index;\">\n                            <li (click)=\"selectGroup(item)\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                                    <input  *ngIf=\"settings.showCheckbox && !settings.singleSelection\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                                    />\n                                    <label>{{item[settings.labelKey]}}</label>\n                                    <ul class=\"lazyContainer\">\n                                            <span *ngFor=\"let val of item.list ; let j = index;\">\n                                            <li (click)=\"onItemClick(val,j,$event); $event.stopPropagation()\" [ngClass]=\"{'selected-item': isSelected(val) == true,'grp-title': val.grpTitle,'grp-item': !val.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                                                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(val)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(val)\"\n                                                    />\n                                                    <label>{{val[settings.labelKey]}}</label>\n                                                </li>\n                                                </span>\n                                    </ul>\n                                </li>\n                    </span>\n                <!-- <span *ngFor=\"let item of groupedData ; let i = index;\">\n                    <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                <li *ngIf=\"item.grpTitle && !settings.selectGroup\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && settings.selectGroup\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                 <li  (click)=\"selectGroup(item)\" *ngIf=\"item.grpTitle && settings.selectGroup\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && settings.selectGroup\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                </span> -->\n            </ul>\n        </div>\n        <h5 class=\"list-message\" *ngIf=\"data?.length == 0\">{{settings.noDataLabel}}</h5>\n    </div>\n</div>\n</div>",
                    host: { '[class]': 'defaultSettings.classes' },
                    providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR, DROPDOWN_CONTROL_VALIDATION],
                    encapsulation: ViewEncapsulation.None,
                    styles: ["virtual-scroll{display:block;width:100%}.cuppa-dropdown{position:relative}.c-btn{display:inline-block;border-width:1px;line-height:1.25;border-radius:3px;font-size:.85rem;padding:5px 10px;cursor:pointer;align-items:center;min-height:38px}.c-btn.disabled{background:#ccc}.selected-list .c-list{float:left;padding:0;margin:0;width:calc(100% - 20px)}.selected-list .c-list .c-token{list-style:none;padding:4px 22px 4px 8px;border-radius:2px;margin-right:4px;margin-top:2px;float:left;position:relative}.selected-list .c-list .c-token .c-label{display:block;float:left}.selected-list .c-list .c-token .c-remove{position:absolute;right:8px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);width:8px}.selected-list .c-list .c-token .c-remove svg{fill:#fff}.selected-list .fa-angle-down,.selected-list .fa-angle-up{font-size:15pt;position:absolute;right:10px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.selected-list .c-angle-down,.selected-list .c-angle-up{width:12px;height:12px;position:absolute;right:10px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);pointer-events:none}.selected-list .c-angle-down svg,.selected-list .c-angle-up svg{fill:#333}.selected-list .countplaceholder{position:absolute;right:45px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.selected-list .c-btn{width:100%;padding:5px 10px;cursor:pointer;display:flex;position:relative}.selected-list .c-btn .c-icon{position:absolute;right:5px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.dropdown-list{position:absolute;padding-top:14px;width:100%;z-index:99999}.dropdown-list ul{padding:0;list-style:none;overflow:auto;margin:0}.dropdown-list ul li{padding:10px;cursor:pointer;text-align:left}.dropdown-list ul li:first-child{padding-top:10px}.dropdown-list ul li:last-child{padding-bottom:10px}.dropdown-list ::-webkit-scrollbar{width:8px}.dropdown-list ::-webkit-scrollbar-thumb{background:#ccc;border-radius:5px}.dropdown-list ::-webkit-scrollbar-track{background:#f2f2f2}.arrow-down,.arrow-up{width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-bottom:15px solid #fff;margin-left:15px;position:absolute;top:0}.arrow-down{bottom:-14px;top:unset;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.arrow-2{border-bottom:15px solid #ccc;top:-1px}.arrow-down.arrow-2{top:unset;bottom:-16px}.list-area{border:1px solid #ccc;border-radius:3px;background:#fff;margin:0}.select-all{padding:10px;border-bottom:1px solid #ccc;text-align:left}.list-filter{border-bottom:1px solid #ccc;position:relative;padding-left:35px;height:35px}.list-filter input{border:0;width:100%;height:100%;padding:0}.list-filter input:focus{outline:0}.list-filter .c-search{position:absolute;top:9px;left:10px;width:15px;height:15px}.list-filter .c-search svg{fill:#888}.list-filter .c-clear{position:absolute;top:10px;right:10px;width:15px;height:15px}.list-filter .c-clear svg{fill:#888}.pure-checkbox input[type=checkbox]{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.pure-checkbox input[type=checkbox]:focus+label:before,.pure-checkbox input[type=checkbox]:hover+label:before{background-color:#f2f2f2}.pure-checkbox input[type=checkbox]:active+label:before{transition-duration:0s}.pure-checkbox input[type=checkbox]+label{position:relative;padding-left:2em;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;margin:0;font-weight:300}.pure-checkbox input[type=checkbox]+label:before{box-sizing:content-box;content:'';position:absolute;top:50%;left:0;width:15px;height:15px;margin-top:-9px;text-align:center;transition:.4s;border-radius:3px}.pure-checkbox input[type=checkbox]+label:after{box-sizing:content-box;content:'';position:absolute;-webkit-transform:scale(0);transform:scale(0);-webkit-transform-origin:50%;transform-origin:50%;transition:transform .2s ease-out,-webkit-transform .2s ease-out;background-color:transparent;top:50%;left:3px;width:9px;height:4px;margin-top:-5px;border-style:solid;border-width:0 0 2px 2px;-o-border-image:none;border-image:none;-webkit-transform:rotate(-45deg) scale(0);transform:rotate(-45deg) scale(0)}.pure-checkbox input[type=checkbox]:disabled+label:before{border-color:#ccc}.pure-checkbox input[type=checkbox]:disabled:focus+label:before .pure-checkbox input[type=checkbox]:disabled:hover+label:before{background-color:inherit}.pure-checkbox input[type=checkbox]:disabled:checked+label:before{background-color:#ccc}.pure-checkbox input[type=radio]:checked+label:before{background-color:#fff}.pure-checkbox input[type=radio]:checked+label:after{-webkit-transform:scale(1);transform:scale(1)}.pure-checkbox input[type=radio]+label:before{border-radius:50%}.pure-checkbox input[type=checkbox]:checked+label:after{content:'';transition:transform .2s ease-out,-webkit-transform .2s ease-out;-webkit-transform:rotate(-45deg) scale(1);transform:rotate(-45deg) scale(1)}.list-message{text-align:center;margin:0;padding:15px 0;font-size:initial}.list-grp{padding:0 15px!important}.list-grp h4{text-transform:capitalize;margin:15px 0 0;font-size:14px;font-weight:700}.list-grp>li{padding-left:15px!important}.grp-item{padding-left:30px!important}.grp-title{padding-bottom:0!important}.grp-title label{margin-bottom:0!important;font-weight:800;text-transform:capitalize}.grp-title:hover{background:0 0!important}.loading-icon{width:20px;position:absolute;right:10px;top:23px;z-index:1}.nodata-label{width:100%;text-align:center;padding:10px 0 0}.btn-container{text-align:center;padding:0 5px 10px}.clear-all{width:8px;position:absolute;top:50%;right:30px;-webkit-transform:translateY(-50%);transform:translateY(-50%)}"]
                }] }
    ];
    /** @nocollapse */
    AngularMultiSelect.ctorParameters = function () { return [
        { type: ElementRef },
        { type: ChangeDetectorRef },
        { type: DataService }
    ]; };
    AngularMultiSelect.propDecorators = {
        data: [{ type: Input }],
        settings: [{ type: Input }],
        loading: [{ type: Input }],
        onSelect: [{ type: Output, args: ['onSelect',] }],
        onDeSelect: [{ type: Output, args: ['onDeSelect',] }],
        onSelectAll: [{ type: Output, args: ['onSelectAll',] }],
        onDeSelectAll: [{ type: Output, args: ['onDeSelectAll',] }],
        onOpen: [{ type: Output, args: ['onOpen',] }],
        onClose: [{ type: Output, args: ['onClose',] }],
        onScrollToEnd: [{ type: Output, args: ['onScrollToEnd',] }],
        onFilterSelectAll: [{ type: Output, args: ['onFilterSelectAll',] }],
        onFilterDeSelectAll: [{ type: Output, args: ['onFilterDeSelectAll',] }],
        onAddFilterNewItem: [{ type: Output, args: ['onAddFilterNewItem',] }],
        onGroupSelect: [{ type: Output, args: ['onGroupSelect',] }],
        onGroupDeSelect: [{ type: Output, args: ['onGroupDeSelect',] }],
        itemTempl: [{ type: ContentChild, args: [Item, { static: false },] }],
        badgeTempl: [{ type: ContentChild, args: [Badge, { static: false },] }],
        searchTempl: [{ type: ContentChild, args: [Search, { static: false },] }],
        searchInput: [{ type: ViewChild, args: ['searchInput', { static: false },] }],
        selectedListElem: [{ type: ViewChild, args: ['selectedList', { static: false },] }],
        dropdownListElem: [{ type: ViewChild, args: ['dropdownList', { static: false },] }],
        onEscapeDown: [{ type: HostListener, args: ['document:keyup.escape', ['$event'],] }],
        virtualScroller: [{ type: ViewChild, args: [VirtualScrollerComponent, { static: false },] }]
    };
    return AngularMultiSelect;
}());
export { AngularMultiSelect };
if (false) {
    /** @type {?} */
    AngularMultiSelect.prototype.data;
    /** @type {?} */
    AngularMultiSelect.prototype.settings;
    /** @type {?} */
    AngularMultiSelect.prototype.loading;
    /** @type {?} */
    AngularMultiSelect.prototype.onSelect;
    /** @type {?} */
    AngularMultiSelect.prototype.onDeSelect;
    /** @type {?} */
    AngularMultiSelect.prototype.onSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.onDeSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.onOpen;
    /** @type {?} */
    AngularMultiSelect.prototype.onClose;
    /** @type {?} */
    AngularMultiSelect.prototype.onScrollToEnd;
    /** @type {?} */
    AngularMultiSelect.prototype.onFilterSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.onFilterDeSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.onAddFilterNewItem;
    /** @type {?} */
    AngularMultiSelect.prototype.onGroupSelect;
    /** @type {?} */
    AngularMultiSelect.prototype.onGroupDeSelect;
    /** @type {?} */
    AngularMultiSelect.prototype.itemTempl;
    /** @type {?} */
    AngularMultiSelect.prototype.badgeTempl;
    /** @type {?} */
    AngularMultiSelect.prototype.searchTempl;
    /** @type {?} */
    AngularMultiSelect.prototype.searchInput;
    /** @type {?} */
    AngularMultiSelect.prototype.selectedListElem;
    /** @type {?} */
    AngularMultiSelect.prototype.dropdownListElem;
    /** @type {?} */
    AngularMultiSelect.prototype.virtualdata;
    /** @type {?} */
    AngularMultiSelect.prototype.searchTerm$;
    /** @type {?} */
    AngularMultiSelect.prototype.filterPipe;
    /** @type {?} */
    AngularMultiSelect.prototype.selectedItems;
    /** @type {?} */
    AngularMultiSelect.prototype.isActive;
    /** @type {?} */
    AngularMultiSelect.prototype.isSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.isFilterSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.isInfiniteFilterSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.groupedData;
    /** @type {?} */
    AngularMultiSelect.prototype.filter;
    /** @type {?} */
    AngularMultiSelect.prototype.chunkArray;
    /** @type {?} */
    AngularMultiSelect.prototype.scrollTop;
    /** @type {?} */
    AngularMultiSelect.prototype.chunkIndex;
    /** @type {?} */
    AngularMultiSelect.prototype.cachedItems;
    /** @type {?} */
    AngularMultiSelect.prototype.groupCachedItems;
    /** @type {?} */
    AngularMultiSelect.prototype.totalRows;
    /** @type {?} */
    AngularMultiSelect.prototype.itemHeight;
    /** @type {?} */
    AngularMultiSelect.prototype.screenItemsLen;
    /** @type {?} */
    AngularMultiSelect.prototype.cachedItemsLen;
    /** @type {?} */
    AngularMultiSelect.prototype.totalHeight;
    /** @type {?} */
    AngularMultiSelect.prototype.scroller;
    /** @type {?} */
    AngularMultiSelect.prototype.maxBuffer;
    /** @type {?} */
    AngularMultiSelect.prototype.lastScrolled;
    /** @type {?} */
    AngularMultiSelect.prototype.lastRepaintY;
    /** @type {?} */
    AngularMultiSelect.prototype.selectedListHeight;
    /** @type {?} */
    AngularMultiSelect.prototype.filterLength;
    /** @type {?} */
    AngularMultiSelect.prototype.infiniteFilterLength;
    /** @type {?} */
    AngularMultiSelect.prototype.viewPortItems;
    /** @type {?} */
    AngularMultiSelect.prototype.item;
    /** @type {?} */
    AngularMultiSelect.prototype.dropdownListYOffset;
    /** @type {?} */
    AngularMultiSelect.prototype.subscription;
    /** @type {?} */
    AngularMultiSelect.prototype.defaultSettings;
    /** @type {?} */
    AngularMultiSelect.prototype.randomSize;
    /** @type {?} */
    AngularMultiSelect.prototype.parseError;
    /** @type {?} */
    AngularMultiSelect.prototype.filteredList;
    /** @type {?} */
    AngularMultiSelect.prototype.virtualScroollInit;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.virtualScroller;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.onTouchedCallback;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.onChangeCallback;
    /** @type {?} */
    AngularMultiSelect.prototype._elementRef;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.cdr;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.ds;
}
var AngularMultiSelectModule = /** @class */ (function () {
    function AngularMultiSelectModule() {
    }
    AngularMultiSelectModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule, FormsModule, VirtualScrollerModule],
                    declarations: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, CIcon],
                    exports: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, CIcon],
                    providers: [DataService]
                },] }
    ];
    return AngularMultiSelectModule;
}());
export { AngularMultiSelectModule };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlzZWxlY3QuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24vIiwic291cmNlcyI6WyJsaWIvbXVsdGlzZWxlY3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFVLFlBQVksRUFBcUMsUUFBUSxFQUE0QixpQkFBaUIsRUFBb0IsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFzQyxNQUFNLGVBQWUsQ0FBQztBQUNqVCxPQUFPLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUF3QixhQUFhLEVBQTBCLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0gsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVsRCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3BELE9BQU8sRUFBZ0IsT0FBTyxFQUFHLE1BQU0sTUFBTSxDQUFDO0FBQzlDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ2xHLE9BQU8sRUFBTyxZQUFZLEVBQUUsb0JBQW9CLEVBQWEsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7O0FBR3pGLE1BQU0sS0FB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LEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUM7b0JBQ2hLLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQztpQkFDM0I7O0lBQ3VDLCtCQUFDO0NBQUEsQUFOekMsSUFNeUM7U0FBNUIsd0JBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIEhvc3RMaXN0ZW5lciwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksT25EZXN0cm95LCBOZ01vZHVsZSwgU2ltcGxlQ2hhbmdlcywgT25DaGFuZ2VzLCBDaGFuZ2VEZXRlY3RvclJlZiwgQWZ0ZXJWaWV3Q2hlY2tlZCwgVmlld0VuY2Fwc3VsYXRpb24sIENvbnRlbnRDaGlsZCwgVmlld0NoaWxkLCBmb3J3YXJkUmVmLCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIEVsZW1lbnRSZWYsIEFmdGVyVmlld0luaXQsIFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZvcm1zTW9kdWxlLCBOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTElEQVRPUlMsIFZhbGlkYXRvciwgRm9ybUNvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTXlFeGNlcHRpb24gfSBmcm9tICcuL211bHRpc2VsZWN0Lm1vZGVsJztcbmltcG9ydCB7IERyb3Bkb3duU2V0dGluZ3MgfSBmcm9tICcuL211bHRpc2VsZWN0LmludGVyZmFjZSc7XG5pbXBvcnQgeyBDbGlja091dHNpZGVEaXJlY3RpdmUsIFNjcm9sbERpcmVjdGl2ZSwgc3R5bGVEaXJlY3RpdmUsIHNldFBvc2l0aW9uIH0gZnJvbSAnLi9jbGlja091dHNpZGUnO1xuaW1wb3J0IHsgTGlzdEZpbHRlclBpcGUgfSBmcm9tICcuL2xpc3QtZmlsdGVyJztcbmltcG9ydCB7IEl0ZW0sIEJhZGdlLCBTZWFyY2gsIFRlbXBsYXRlUmVuZGVyZXIsIENJY29uIH0gZnJvbSAnLi9tZW51LWl0ZW0nO1xuaW1wb3J0IHsgRGF0YVNlcnZpY2UgfSBmcm9tICcuL211bHRpc2VsZWN0LnNlcnZpY2UnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uLCBTdWJqZWN0ICB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgVmlydHVhbFNjcm9sbGVyTW9kdWxlLCBWaXJ0dWFsU2Nyb2xsZXJDb21wb25lbnQgfSBmcm9tICcuL3ZpcnR1YWwtc2Nyb2xsL3ZpcnR1YWwtc2Nyb2xsJztcbmltcG9ydCB7IG1hcCwgZGVib3VuY2VUaW1lLCBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgc3dpdGNoTWFwLCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7IFxuaW1wb3J0IHsgVGhyb3dTdG10IH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuXG5leHBvcnQgY29uc3QgRFJPUERPV05fQ09OVFJPTF9WQUxVRV9BQ0NFU1NPUjogYW55ID0ge1xuICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IEFuZ3VsYXJNdWx0aVNlbGVjdCksXG4gICAgbXVsdGk6IHRydWVcbn07XG5leHBvcnQgY29uc3QgRFJPUERPV05fQ09OVFJPTF9WQUxJREFUSU9OOiBhbnkgPSB7XG4gICAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBBbmd1bGFyTXVsdGlTZWxlY3QpLFxuICAgIG11bHRpOiB0cnVlLFxufVxuY29uc3Qgbm9vcCA9ICgpID0+IHtcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYW5ndWxhcjItbXVsdGlzZWxlY3QnLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9tdWx0aXNlbGVjdC5jb21wb25lbnQuaHRtbCcsXG4gICAgaG9zdDogeyAnW2NsYXNzXSc6ICdkZWZhdWx0U2V0dGluZ3MuY2xhc3NlcycgfSxcbiAgICBzdHlsZVVybHM6IFsnLi9tdWx0aXNlbGVjdC5jb21wb25lbnQuc2NzcyddLFxuICAgIHByb3ZpZGVyczogW0RST1BET1dOX0NPTlRST0xfVkFMVUVfQUNDRVNTT1IsIERST1BET1dOX0NPTlRST0xfVkFMSURBVElPTl0sXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0pXG5cbmV4cG9ydCBjbGFzcyBBbmd1bGFyTXVsdGlTZWxlY3QgaW1wbGVtZW50cyBPbkluaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkNoYW5nZXMsIFZhbGlkYXRvciwgQWZ0ZXJWaWV3Q2hlY2tlZCwgT25EZXN0cm95IHtcblxuICAgIEBJbnB1dCgpXG4gICAgZGF0YTogQXJyYXk8YW55PjtcblxuICAgIEBJbnB1dCgpXG4gICAgc2V0dGluZ3M6IERyb3Bkb3duU2V0dGluZ3M7XG5cbiAgICBASW5wdXQoKVxuICAgIGxvYWRpbmc6IGJvb2xlYW47XG5cbiAgICBAT3V0cHV0KCdvblNlbGVjdCcpXG4gICAgb25TZWxlY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAT3V0cHV0KCdvbkRlU2VsZWN0JylcbiAgICBvbkRlU2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gICAgQE91dHB1dCgnb25TZWxlY3RBbGwnKVxuICAgIG9uU2VsZWN0QWxsOiBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4gPSBuZXcgRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+KCk7XG5cbiAgICBAT3V0cHV0KCdvbkRlU2VsZWN0QWxsJylcbiAgICBvbkRlU2VsZWN0QWxsOiBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4gPSBuZXcgRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+KCk7XG5cbiAgICBAT3V0cHV0KCdvbk9wZW4nKVxuICAgIG9uT3BlbjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAgIEBPdXRwdXQoJ29uQ2xvc2UnKVxuICAgIG9uQ2xvc2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAT3V0cHV0KCdvblNjcm9sbFRvRW5kJylcbiAgICBvblNjcm9sbFRvRW5kOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gICAgQE91dHB1dCgnb25GaWx0ZXJTZWxlY3RBbGwnKVxuICAgIG9uRmlsdGVyU2VsZWN0QWxsOiBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4gPSBuZXcgRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+KCk7XG5cbiAgICBAT3V0cHV0KCdvbkZpbHRlckRlU2VsZWN0QWxsJylcbiAgICBvbkZpbHRlckRlU2VsZWN0QWxsOiBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4gPSBuZXcgRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+KCk7XG5cbiAgICBAT3V0cHV0KCdvbkFkZEZpbHRlck5ld0l0ZW0nKVxuICAgIG9uQWRkRmlsdGVyTmV3SXRlbTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAgIEBPdXRwdXQoJ29uR3JvdXBTZWxlY3QnKVxuICAgIG9uR3JvdXBTZWxlY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAT3V0cHV0KCdvbkdyb3VwRGVTZWxlY3QnKVxuICAgIG9uR3JvdXBEZVNlbGVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAgIEBDb250ZW50Q2hpbGQoSXRlbSwgeyBzdGF0aWM6IGZhbHNlIH0pIGl0ZW1UZW1wbDogSXRlbTtcbiAgICBAQ29udGVudENoaWxkKEJhZGdlLCB7IHN0YXRpYzogZmFsc2UgfSkgYmFkZ2VUZW1wbDogQmFkZ2U7XG4gICAgQENvbnRlbnRDaGlsZChTZWFyY2gsIHsgc3RhdGljOiBmYWxzZSB9KSBzZWFyY2hUZW1wbDogU2VhcmNoO1xuXG5cbiAgICBAVmlld0NoaWxkKCdzZWFyY2hJbnB1dCcsIHsgc3RhdGljOiBmYWxzZSB9KSBzZWFyY2hJbnB1dDogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdzZWxlY3RlZExpc3QnLCB7IHN0YXRpYzogZmFsc2UgfSkgc2VsZWN0ZWRMaXN0RWxlbTogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdkcm9wZG93bkxpc3QnLCB7IHN0YXRpYzogZmFsc2UgfSkgZHJvcGRvd25MaXN0RWxlbTogRWxlbWVudFJlZjtcblxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmtleXVwLmVzY2FwZScsIFsnJGV2ZW50J10pXG4gICAgb25Fc2NhcGVEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmVzY2FwZVRvQ2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VEcm9wZG93bigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZpcnR1YWxkYXRhOiBhbnkgPSBbXTtcbiAgICBzZWFyY2hUZXJtJCA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcblxuICAgIGZpbHRlclBpcGU6IExpc3RGaWx0ZXJQaXBlO1xuICAgIHB1YmxpYyBzZWxlY3RlZEl0ZW1zOiBBcnJheTxhbnk+O1xuICAgIHB1YmxpYyBpc0FjdGl2ZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc1NlbGVjdEFsbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc0ZpbHRlclNlbGVjdEFsbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBpc0luZmluaXRlRmlsdGVyU2VsZWN0QWxsOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHVibGljIGdyb3VwZWREYXRhOiBBcnJheTxhbnk+O1xuICAgIGZpbHRlcjogYW55O1xuICAgIHB1YmxpYyBjaHVua0FycmF5OiBhbnlbXTtcbiAgICBwdWJsaWMgc2Nyb2xsVG9wOiBhbnk7XG4gICAgcHVibGljIGNodW5rSW5kZXg6IGFueVtdID0gW107XG4gICAgcHVibGljIGNhY2hlZEl0ZW1zOiBhbnlbXSA9IFtdO1xuICAgIHB1YmxpYyBncm91cENhY2hlZEl0ZW1zOiBhbnlbXSA9IFtdO1xuICAgIHB1YmxpYyB0b3RhbFJvd3M6IGFueTtcbiAgICBwdWJsaWMgaXRlbUhlaWdodDogYW55ID0gNDEuNjtcbiAgICBwdWJsaWMgc2NyZWVuSXRlbXNMZW46IGFueTtcbiAgICBwdWJsaWMgY2FjaGVkSXRlbXNMZW46IGFueTtcbiAgICBwdWJsaWMgdG90YWxIZWlnaHQ6IGFueTtcbiAgICBwdWJsaWMgc2Nyb2xsZXI6IGFueTtcbiAgICBwdWJsaWMgbWF4QnVmZmVyOiBhbnk7XG4gICAgcHVibGljIGxhc3RTY3JvbGxlZDogYW55O1xuICAgIHB1YmxpYyBsYXN0UmVwYWludFk6IGFueTtcbiAgICBwdWJsaWMgc2VsZWN0ZWRMaXN0SGVpZ2h0OiBhbnk7XG4gICAgcHVibGljIGZpbHRlckxlbmd0aDogYW55ID0gMDtcbiAgICBwdWJsaWMgaW5maW5pdGVGaWx0ZXJMZW5ndGg6IGFueSA9IDA7XG4gICAgcHVibGljIHZpZXdQb3J0SXRlbXM6IGFueTtcbiAgICBwdWJsaWMgaXRlbTogYW55O1xuICAgIHB1YmxpYyBkcm9wZG93bkxpc3RZT2Zmc2V0OiBudW1iZXIgPSAwO1xuICAgIHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuICAgIGRlZmF1bHRTZXR0aW5nczogRHJvcGRvd25TZXR0aW5ncyA9IHtcbiAgICAgICAgc2luZ2xlU2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgdGV4dDogJ1NlbGVjdCcsXG4gICAgICAgIGVuYWJsZUNoZWNrQWxsOiB0cnVlLFxuICAgICAgICBzZWxlY3RBbGxUZXh0OiAnU2VsZWN0IEFsbCcsXG4gICAgICAgIHVuU2VsZWN0QWxsVGV4dDogJ1VuU2VsZWN0IEFsbCcsXG4gICAgICAgIGZpbHRlclNlbGVjdEFsbFRleHQ6ICdTZWxlY3QgYWxsIGZpbHRlcmVkIHJlc3VsdHMnLFxuICAgICAgICBmaWx0ZXJVblNlbGVjdEFsbFRleHQ6ICdVblNlbGVjdCBhbGwgZmlsdGVyZWQgcmVzdWx0cycsXG4gICAgICAgIGVuYWJsZVNlYXJjaEZpbHRlcjogZmFsc2UsXG4gICAgICAgIHNlYXJjaEJ5OiBbXSxcbiAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXG4gICAgICAgIGJhZGdlU2hvd0xpbWl0OiA5OTk5OTk5OTk5OTksXG4gICAgICAgIGNsYXNzZXM6ICcnLFxuICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgIHNlYXJjaFBsYWNlaG9sZGVyVGV4dDogJ1NlYXJjaCcsXG4gICAgICAgIHNob3dDaGVja2JveDogdHJ1ZSxcbiAgICAgICAgbm9EYXRhTGFiZWw6ICdObyBEYXRhIEF2YWlsYWJsZScsXG4gICAgICAgIHNlYXJjaEF1dG9mb2N1czogdHJ1ZSxcbiAgICAgICAgbGF6eUxvYWRpbmc6IGZhbHNlLFxuICAgICAgICBsYWJlbEtleTogJ2l0ZW1OYW1lJyxcbiAgICAgICAgcHJpbWFyeUtleTogJ2lkJyxcbiAgICAgICAgcG9zaXRpb246ICdib3R0b20nLFxuICAgICAgICBhdXRvUG9zaXRpb246IHRydWUsXG4gICAgICAgIGVuYWJsZUZpbHRlclNlbGVjdEFsbDogdHJ1ZSxcbiAgICAgICAgc2VsZWN0R3JvdXA6IGZhbHNlLFxuICAgICAgICBhZGROZXdJdGVtT25GaWx0ZXI6IGZhbHNlLFxuICAgICAgICBhZGROZXdCdXR0b25UZXh0OiBcIkFkZFwiLFxuICAgICAgICBlc2NhcGVUb0Nsb3NlOiB0cnVlLFxuICAgICAgICBjbGVhckFsbDogdHJ1ZVxuICAgIH1cbiAgICByYW5kb21TaXplOmJvb2xlYW4gPSB0cnVlO1xuICAgIHB1YmxpYyBwYXJzZUVycm9yOiBib29sZWFuO1xuICAgIHB1YmxpYyBmaWx0ZXJlZExpc3Q6IGFueSA9IFtdO1xuICAgIHZpcnR1YWxTY3Jvb2xsSW5pdDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIEBWaWV3Q2hpbGQoVmlydHVhbFNjcm9sbGVyQ29tcG9uZW50LCB7c3RhdGljOiBmYWxzZX0pXG4gICAgcHJpdmF0ZSB2aXJ0dWFsU2Nyb2xsZXI6IFZpcnR1YWxTY3JvbGxlckNvbXBvbmVudDtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZiwgcHJpdmF0ZSBkczogRGF0YVNlcnZpY2UpIHtcbiAgICAgICAgdGhpcy5zZWFyY2hUZXJtJC5hc09ic2VydmFibGUoKS5waXBlKFxuICAgICAgICBkZWJvdW5jZVRpbWUoMTAwMCksXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgIHRhcCh0ZXJtID0+IHRlcm0pXG4gICAgICAgICkuc3Vic2NyaWJlKHZhbCA9PiB7XG4gICAgICAgICAgICB0aGlzLmZpbHRlckluZmluaXRlTGlzdCh2YWwpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHRoaXMuZGVmYXVsdFNldHRpbmdzLCB0aGlzLnNldHRpbmdzKTtcblxuICAgICAgICB0aGlzLmNhY2hlZEl0ZW1zID0gdGhpcy5jbG9uZUFycmF5KHRoaXMuZGF0YSk7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc2l0aW9uID09ICd0b3AnKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdEhlaWdodCA9IHsgdmFsOiAwIH07XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3RIZWlnaHQudmFsID0gdGhpcy5zZWxlY3RlZExpc3RFbGVtLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLmRzLmdldERhdGEoKS5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGxldCBsZW4gPSAwO1xuICAgICAgICAgICAgICAgIGRhdGEuZm9yRWFjaCgob2JqOiBhbnksIGk6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eSgnZ3JwVGl0bGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVuKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckxlbmd0aCA9IGxlbjtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRmlsdGVyQ2hhbmdlKGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlRHJvcGRvd25EaXJlY3Rpb24oKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudmlydHVhbFNjcm9vbGxJbml0ID0gZmFsc2U7XG4gICAgfVxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuZGF0YSAmJiAhY2hhbmdlcy5kYXRhLmZpcnN0Q2hhbmdlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IHRoaXMudHJhbnNmb3JtRGF0YSh0aGlzLmRhdGEsIHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0YS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cENhY2hlZEl0ZW1zID0gdGhpcy5jbG9uZUFycmF5KHRoaXMuZ3JvdXBlZERhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYWNoZWRJdGVtcyA9IHRoaXMuY2xvbmVBcnJheSh0aGlzLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLnNldHRpbmdzICYmICFjaGFuZ2VzLnNldHRpbmdzLmZpcnN0Q2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih0aGlzLmRlZmF1bHRTZXR0aW5ncywgdGhpcy5zZXR0aW5ncyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMubG9hZGluZykge1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuc2V0dGluZ3MubGF6eUxvYWRpbmcgJiYgdGhpcy52aXJ0dWFsU2Nyb29sbEluaXQgJiYgY2hhbmdlcy5kYXRhKXtcbiAgICAgICAgICAgIHRoaXMudmlydHVhbGRhdGEgPSBjaGFuZ2VzLmRhdGEuY3VycmVudFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5nRG9DaGVjaygpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJdGVtcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGggPT0gMCB8fCB0aGlzLmRhdGEubGVuZ3RoID09IDAgfHwgdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCA8IHRoaXMuZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5sYXp5TG9hZGluZykge1xuICAgICAgICAgICAgLy8gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJsYXp5Q29udGFpbmVyXCIpWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGwuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbmdBZnRlclZpZXdDaGVja2VkKCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZExpc3RFbGVtLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0ICYmIHRoaXMuc2V0dGluZ3MucG9zaXRpb24gPT0gJ3RvcCcgJiYgdGhpcy5zZWxlY3RlZExpc3RIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0SGVpZ2h0LnZhbCA9IHRoaXMuc2VsZWN0ZWRMaXN0RWxlbS5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvbkl0ZW1DbGljayhpdGVtOiBhbnksIGluZGV4OiBudW1iZXIsIGV2dDogRXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmb3VuZCA9IHRoaXMuaXNTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgbGV0IGxpbWl0ID0gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCA8IHRoaXMuc2V0dGluZ3MubGltaXRTZWxlY3Rpb24gPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MubGltaXRTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAobGltaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNlbGVjdC5lbWl0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgICAgICAgICAgdGhpcy5vblNlbGVjdC5lbWl0KGl0ZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5vbkRlU2VsZWN0LmVtaXQoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RBbGwgfHwgdGhpcy5kYXRhLmxlbmd0aCA+IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kYXRhLmxlbmd0aCA9PSB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmlzU2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUdyb3VwSW5mbyhpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgdmFsaWRhdGUoYzogRm9ybUNvbnRyb2wpOiBhbnkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcHJpdmF0ZSBvblRvdWNoZWRDYWxsYmFjazogKF86IGFueSkgPT4gdm9pZCA9IG5vb3A7XG4gICAgcHJpdmF0ZSBvbkNoYW5nZUNhbGxiYWNrOiAoXzogYW55KSA9PiB2b2lkID0gbm9vcDtcblxuICAgIHdyaXRlVmFsdWUodmFsdWU6IGFueSkge1xuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJycpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnNpbmdsZVNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IHRoaXMudHJhbnNmb3JtRGF0YSh0aGlzLmRhdGEsIHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBDYWNoZWRJdGVtcyA9IHRoaXMuY2xvbmVBcnJheSh0aGlzLmdyb3VwZWREYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW3ZhbHVlWzBdXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFt2YWx1ZVswXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE15RXhjZXB0aW9uKDQwNCwgeyBcIm1zZ1wiOiBcIlNpbmdsZSBTZWxlY3Rpb24gTW9kZSwgU2VsZWN0ZWQgSXRlbXMgY2Fubm90IGhhdmUgbW9yZSB0aGFuIG9uZSBpdGVtLlwiIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZS5ib2R5Lm1zZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmxpbWl0U2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHZhbHVlLnNsaWNlKDAsIHRoaXMuc2V0dGluZ3MubGltaXRTZWxlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoID09PSB0aGlzLmRhdGEubGVuZ3RoICYmIHRoaXMuZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLnRyYW5zZm9ybURhdGEodGhpcy5kYXRhLCB0aGlzLnNldHRpbmdzLmdyb3VwQnkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwQ2FjaGVkSXRlbXMgPSB0aGlzLmNsb25lQXJyYXkodGhpcy5ncm91cGVkRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL0Zyb20gQ29udHJvbFZhbHVlQWNjZXNzb3IgaW50ZXJmYWNlXG4gICAgcmVnaXN0ZXJPbkNoYW5nZShmbjogYW55KSB7XG4gICAgICAgIHRoaXMub25DaGFuZ2VDYWxsYmFjayA9IGZuO1xuICAgIH1cblxuICAgIC8vRnJvbSBDb250cm9sVmFsdWVBY2Nlc3NvciBpbnRlcmZhY2VcbiAgICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KSB7XG4gICAgICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2sgPSBmbjtcbiAgICB9XG4gICAgdHJhY2tCeUZuKGluZGV4OiBudW1iZXIsIGl0ZW06IGFueSkge1xuICAgICAgICByZXR1cm4gaXRlbVt0aGlzLnNldHRpbmdzLnByaW1hcnlLZXldO1xuICAgIH1cbiAgICBpc1NlbGVjdGVkKGNsaWNrZWRJdGVtOiBhbnkpIHtcbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyAmJiB0aGlzLnNlbGVjdGVkSXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIGlmIChjbGlja2VkSXRlbVt0aGlzLnNldHRpbmdzLnByaW1hcnlLZXldID09PSBpdGVtW3RoaXMuc2V0dGluZ3MucHJpbWFyeUtleV0pIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgfVxuICAgIGFkZFNlbGVjdGVkKGl0ZW06IGFueSkge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zaW5nbGVTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlRHJvcGRvd24oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICB9XG4gICAgcmVtb3ZlU2VsZWN0ZWQoY2xpY2tlZEl0ZW06IGFueSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgJiYgdGhpcy5zZWxlY3RlZEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICBpZiAoY2xpY2tlZEl0ZW1bdGhpcy5zZXR0aW5ncy5wcmltYXJ5S2V5XSA9PT0gaXRlbVt0aGlzLnNldHRpbmdzLnByaW1hcnlLZXldKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zLnNwbGljZSh0aGlzLnNlbGVjdGVkSXRlbXMuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgdGhpcy5vblRvdWNoZWRDYWxsYmFjayh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgIH1cbiAgICB0b2dnbGVEcm9wZG93bihldnQ6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSAhdGhpcy5pc0FjdGl2ZTtcbiAgICAgICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnNlYXJjaEF1dG9mb2N1cyAmJiB0aGlzLnNlYXJjaElucHV0ICYmIHRoaXMuc2V0dGluZ3MuZW5hYmxlU2VhcmNoRmlsdGVyICYmICF0aGlzLnNlYXJjaFRlbXBsKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbk9wZW4uZW1pdCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25DbG9zZS5lbWl0KGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlRHJvcGRvd25EaXJlY3Rpb24oKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIGlmKHRoaXMuc2V0dGluZ3MubGF6eUxvYWRpbmcpe1xuICAgICAgICAgICAgdGhpcy52aXJ0dWFsZGF0YSA9IHRoaXMuZGF0YTtcbiAgICAgICAgICAgIHRoaXMudmlydHVhbFNjcm9vbGxJbml0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gICAgcHVibGljIG9wZW5Ecm9wZG93bigpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2VhcmNoQXV0b2ZvY3VzICYmIHRoaXMuc2VhcmNoSW5wdXQgJiYgdGhpcy5zZXR0aW5ncy5lbmFibGVTZWFyY2hGaWx0ZXIgJiYgIXRoaXMuc2VhcmNoVGVtcGwpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbk9wZW4uZW1pdCh0cnVlKTtcbiAgICB9XG4gICAgcHVibGljIGNsb3NlRHJvcGRvd24oKSB7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaElucHV0ICYmIHRoaXMuc2V0dGluZ3MubGF6eUxvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoSW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maWx0ZXIgPSBcIlwiO1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25DbG9zZS5lbWl0KGZhbHNlKTtcbiAgICB9XG4gICAgcHVibGljIGNsb3NlRHJvcGRvd25PbkNsaWNrT3V0KCkge1xuICAgICAgICBpZiAodGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2VhcmNoSW5wdXQgJiYgdGhpcy5zZXR0aW5ncy5sYXp5TG9hZGluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zZWFyY2hJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5wdXQubmF0aXZlRWxlbWVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZpbHRlciA9IFwiXCI7XG4gICAgICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmNsZWFyU2VhcmNoKCk7XG4gICAgICAgICAgICB0aGlzLm9uQ2xvc2UuZW1pdChmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9nZ2xlU2VsZWN0QWxsKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNTZWxlY3RBbGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEuZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwQ2FjaGVkSXRlbXMuZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHRoaXMuZGF0YS5zbGljZSgpO1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcblxuICAgICAgICAgICAgdGhpcy5vblNlbGVjdEFsbC5lbWl0KHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YS5mb3JFYWNoKChvYmopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cENhY2hlZEl0ZW1zLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW107XG4gICAgICAgICAgICB0aGlzLmlzU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcblxuICAgICAgICAgICAgdGhpcy5vbkRlU2VsZWN0QWxsLmVtaXQodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmaWx0ZXJHcm91cGVkTGlzdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyID09IFwiXCIgfHwgdGhpcy5maWx0ZXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhclNlYXJjaCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLmNsb25lQXJyYXkodGhpcy5ncm91cENhY2hlZEl0ZW1zKTtcbiAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IHRoaXMuZ3JvdXBlZERhdGEuZmlsdGVyKG9iaiA9PiB7XG4gICAgICAgICAgICBsZXQgYXJyID0gW107XG4gICAgICAgICAgICBpZihvYmpbdGhpcy5zZXR0aW5ncy5sYWJlbEtleV0udG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMuZmlsdGVyLnRvTG93ZXJDYXNlKCkpID4gLTEpe1xuICAgICAgICAgICAgICAgIGFyciA9IG9iai5saXN0O1xuICAgICAgICAgICAgfSAgIFxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyID0gb2JqLmxpc3QuZmlsdGVyKHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdFt0aGlzLnNldHRpbmdzLmxhYmVsS2V5XS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5maWx0ZXIudG9Mb3dlckNhc2UoKSkgPiAtMTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLmxpc3QgPSBhcnI7XG4gICAgICAgICAgICBpZihvYmpbdGhpcy5zZXR0aW5ncy5sYWJlbEtleV0udG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMuZmlsdGVyLnRvTG93ZXJDYXNlKCkpID4gLTEpe1xuICAgICAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyLnNvbWUoY2F0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhdFt0aGlzLnNldHRpbmdzLmxhYmVsS2V5XS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5maWx0ZXIudG9Mb3dlckNhc2UoKSkgPiAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b2dnbGVGaWx0ZXJTZWxlY3RBbGwoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0ZpbHRlclNlbGVjdEFsbCkge1xuICAgICAgICAgICAgbGV0IGFkZGVkID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4vKiAgICAgICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ubGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5saXN0LmZvckVhY2goKGVsOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNTZWxlY3RlZChlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRTZWxlY3RlZChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGVkLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlR3JvdXBJbmZvKGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgfSk7ICovXG5cbiAgICAgICAgICAgICAgICB0aGlzLmRzLmdldEZpbHRlcmVkRGF0YSgpLmZvckVhY2goKGVsOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQoZWwpICYmICFlbC5oYXNPd25Qcm9wZXJ0eSgnZ3JwVGl0bGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRTZWxlY3RlZChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRlZC5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRzLmdldEZpbHRlcmVkRGF0YSgpLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNTZWxlY3RlZChpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZGVkLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmlzRmlsdGVyU2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMub25GaWx0ZXJTZWxlY3RBbGwuZW1pdChhZGRlZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IFtdO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuLyogICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubGlzdC5mb3JFYWNoKChlbDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVTZWxlY3RlZChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsgKi9cbiAgICAgICAgICAgICAgICB0aGlzLmRzLmdldEZpbHRlcmVkRGF0YSgpLmZvckVhY2goKGVsOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlU2VsZWN0ZWQoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcy5nZXRGaWx0ZXJlZERhdGEoKS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmlzRmlsdGVyU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm9uRmlsdGVyRGVTZWxlY3RBbGwuZW1pdChyZW1vdmVkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b2dnbGVJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzSW5maW5pdGVGaWx0ZXJTZWxlY3RBbGwpIHtcbiAgICAgICAgICAgIHRoaXMudmlydHVhbGRhdGEuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5pc0luZmluaXRlRmlsdGVyU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xlYXJTZWFyY2goKSB7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLmNsb25lQXJyYXkodGhpcy5ncm91cENhY2hlZEl0ZW1zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbHRlciA9IFwiXCI7XG4gICAgICAgIHRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwgPSBmYWxzZTtcblxuICAgIH1cbiAgICBvbkZpbHRlckNoYW5nZShkYXRhOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyICYmIHRoaXMuZmlsdGVyID09IFwiXCIgfHwgZGF0YS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5pc0ZpbHRlclNlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjbnQgPSAwO1xuICAgICAgICBkYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoIWl0ZW0uaGFzT3duUHJvcGVydHkoJ2dycFRpdGxlJykgJiYgdGhpcy5pc1NlbGVjdGVkKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgY250Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjbnQgPiAwICYmIHRoaXMuZmlsdGVyTGVuZ3RoID09IGNudCkge1xuICAgICAgICAgICAgdGhpcy5pc0ZpbHRlclNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY250ID4gMCAmJiB0aGlzLmZpbHRlckxlbmd0aCAhPSBjbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgfVxuICAgIGNsb25lQXJyYXkoYXJyOiBhbnkpIHtcbiAgICAgICAgbGV0IGksIGNvcHk7XG5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYXJyKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRocm93ICdDYW5ub3QgY2xvbmUgYXJyYXkgY29udGFpbmluZyBhbiBvYmplY3QhJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXBkYXRlR3JvdXBJbmZvKGl0ZW06IGFueSkge1xuICAgICAgICBsZXQga2V5ID0gdGhpcy5zZXR0aW5ncy5ncm91cEJ5O1xuICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZvckVhY2goKG9iajogYW55KSA9PiB7XG4gICAgICAgICAgICBsZXQgY250ID0gMDtcbiAgICAgICAgICAgIGlmIChvYmouZ3JwVGl0bGUgJiYgKGl0ZW1ba2V5XSA9PSBvYmpba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmxpc3QuZm9yRWFjaCgoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9iai5saXN0ICYmIChjbnQgPT09IG9iai5saXN0Lmxlbmd0aCkgJiYgKGl0ZW1ba2V5XSA9PSBvYmpba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2JqLmxpc3QgJiYgKGNudCAhPSBvYmoubGlzdC5sZW5ndGgpICYmIChpdGVtW2tleV0gPT0gb2JqW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdyb3VwQ2FjaGVkSXRlbXMuZm9yRWFjaCgob2JqOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGxldCBjbnQgPSAwO1xuICAgICAgICAgICAgaWYgKG9iai5ncnBUaXRsZSAmJiAoaXRlbVtrZXldID09IG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgIGlmIChvYmoubGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBvYmoubGlzdC5mb3JFYWNoKChlbDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JqLmxpc3QgJiYgKGNudCA9PT0gb2JqLmxpc3QubGVuZ3RoKSAmJiAoaXRlbVtrZXldID09IG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvYmoubGlzdCAmJiAoY250ICE9IG9iai5saXN0Lmxlbmd0aCkgJiYgKGl0ZW1ba2V5XSA9PSBvYmpba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRyYW5zZm9ybURhdGEoYXJyOiBBcnJheTxhbnk+LCBmaWVsZDogYW55KTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGdyb3VwZWRPYmo6IGFueSA9IGFyci5yZWR1Y2UoKHByZXY6IGFueSwgY3VyOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmICghcHJldltjdXJbZmllbGRdXSkge1xuICAgICAgICAgICAgICAgIHByZXZbY3VyW2ZpZWxkXV0gPSBbY3VyXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJldltjdXJbZmllbGRdXS5wdXNoKGN1cik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJldjtcbiAgICAgICAgfSwge30pO1xuICAgICAgICBjb25zdCB0ZW1wQXJyOiBhbnkgPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMoZ3JvdXBlZE9iaikubWFwKCh4OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGxldCBvYmo6IGFueSA9IHt9O1xuICAgICAgICAgICAgb2JqW1wiZ3JwVGl0bGVcIl0gPSB0cnVlO1xuICAgICAgICAgICAgb2JqW3RoaXMuc2V0dGluZ3MubGFiZWxLZXldID0geDtcbiAgICAgICAgICAgIG9ialt0aGlzLnNldHRpbmdzLmdyb3VwQnldID0geDtcbiAgICAgICAgICAgIG9ialsnc2VsZWN0ZWQnXSA9IGZhbHNlO1xuICAgICAgICAgICAgb2JqWydsaXN0J10gPSBbXTtcbiAgICAgICAgICAgIGxldCBjbnQgPSAwO1xuICAgICAgICAgICAgZ3JvdXBlZE9ialt4XS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpdGVtWydsaXN0J10gPSBbXTtcbiAgICAgICAgICAgICAgICBvYmoubGlzdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY250Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY250ID09IG9iai5saXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlbXBBcnIucHVzaChvYmopO1xuICAgICAgICAgICAgLy8gb2JqLmxpc3QuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyAgICAgdGVtcEFyci5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGVtcEFycjtcbiAgICB9XG4gICAgcHVibGljIGZpbHRlckluZmluaXRlTGlzdChldnQ6IGFueSkge1xuICAgICAgICBsZXQgZmlsdGVyZWRFbGVtczogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy5ncm91cENhY2hlZEl0ZW1zLnNsaWNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmNhY2hlZEl0ZW1zLnNsaWNlKCk7XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhID0gdGhpcy5jYWNoZWRJdGVtcy5zbGljZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChldnQgIT0gbnVsbCB8fCBldnQgIT0gJycpICYmICF0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnNlYXJjaEJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IHRoaXMuc2V0dGluZ3Muc2VhcmNoQnkubGVuZ3RoOyB0KyspIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhLmZpbHRlcigoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsW3RoaXMuc2V0dGluZ3Muc2VhcmNoQnlbdF0udG9TdHJpbmcoKV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZXZ0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkRWxlbXMucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aXJ0dWFsZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGVsOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcCBpbiBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsW3Byb3BdLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGV2dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEVsZW1zLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhID0gW107XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhID0gZmlsdGVyZWRFbGVtcztcbiAgICAgICAgICAgIHRoaXMuaW5maW5pdGVGaWx0ZXJMZW5ndGggPSB0aGlzLnZpcnR1YWxkYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZ0LnRvU3RyaW5nKCkgIT0gJycgJiYgdGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZpbHRlcihmdW5jdGlvbiAoZWw6IGFueSkge1xuICAgICAgICAgICAgICAgIGlmIChlbC5oYXNPd25Qcm9wZXJ0eSgnZ3JwVGl0bGUnKSkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEVsZW1zLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcCBpbiBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsW3Byb3BdLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGV2dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEVsZW1zLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gW107XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gZmlsdGVyZWRFbGVtcztcbiAgICAgICAgICAgIHRoaXMuaW5maW5pdGVGaWx0ZXJMZW5ndGggPSB0aGlzLmdyb3VwZWREYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChldnQudG9TdHJpbmcoKSA9PSAnJyAmJiB0aGlzLmNhY2hlZEl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMudmlydHVhbGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHRoaXMudmlydHVhbGRhdGEgPSB0aGlzLmNhY2hlZEl0ZW1zO1xuICAgICAgICAgICAgdGhpcy5pbmZpbml0ZUZpbHRlckxlbmd0aCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXJ0dWFsU2Nyb2xsZXIucmVmcmVzaCgpO1xuICAgIH1cbiAgICByZXNldEluZmluaXRlU2VhcmNoKCkge1xuICAgICAgICB0aGlzLmZpbHRlciA9IFwiXCI7XG4gICAgICAgIHRoaXMuaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpcnR1YWxkYXRhID0gW107XG4gICAgICAgIHRoaXMudmlydHVhbGRhdGEgPSB0aGlzLmNhY2hlZEl0ZW1zO1xuICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy5ncm91cENhY2hlZEl0ZW1zO1xuICAgICAgICB0aGlzLmluZmluaXRlRmlsdGVyTGVuZ3RoID0gMDtcbiAgICB9XG4gICAgb25TY3JvbGxFbmQoZTogYW55KSB7XG4gICAgICAgIGlmKGUuZW5kSW5kZXggPT09IHRoaXMuZGF0YS5sZW5ndGggLSAxIHx8IGUuc3RhcnRJbmRleCA9PT0gMCl7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uU2Nyb2xsVG9FbmQuZW1pdChlKTtcbiAgICAgICAgXG4gICAgfVxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy5zdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBzZWxlY3RHcm91cChpdGVtOiBhbnkpIHtcbiAgICAgICAgaWYgKGl0ZW0uc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGl0ZW0ubGlzdC5mb3JFYWNoKChvYmo6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlU2VsZWN0ZWQob2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVHcm91cEluZm8oaXRlbSk7XG4gICAgICAgICAgICB0aGlzLm9uR3JvdXBTZWxlY3QuZW1pdChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaXRlbS5saXN0LmZvckVhY2goKG9iajogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKG9iaik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlR3JvdXBJbmZvKGl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5vbkdyb3VwRGVTZWxlY3QuZW1pdChpdGVtKTtcbiAgICAgICAgfVxuXG5cbiAgICB9XG4gICAgYWRkRmlsdGVyTmV3SXRlbSgpIHtcbiAgICAgICAgdGhpcy5vbkFkZEZpbHRlck5ld0l0ZW0uZW1pdCh0aGlzLmZpbHRlcik7XG4gICAgICAgIHRoaXMuZmlsdGVyUGlwZSA9IG5ldyBMaXN0RmlsdGVyUGlwZSh0aGlzLmRzKTtcbiAgICAgICAgdGhpcy5maWx0ZXJQaXBlLnRyYW5zZm9ybSh0aGlzLmRhdGEsIHRoaXMuZmlsdGVyLCB0aGlzLnNldHRpbmdzLnNlYXJjaEJ5KTtcbiAgICB9XG4gICAgY2FsY3VsYXRlRHJvcGRvd25EaXJlY3Rpb24oKSB7XG4gICAgICAgIGxldCBzaG91bGRPcGVuVG93YXJkc1RvcCA9IHRoaXMuc2V0dGluZ3MucG9zaXRpb24gPT0gJ3RvcCc7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmF1dG9Qb3NpdGlvbikge1xuICAgICAgICAgICAgY29uc3QgZHJvcGRvd25IZWlnaHQgPSB0aGlzLmRyb3Bkb3duTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBjb25zdCB2aWV3cG9ydEhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZExpc3RCb3VuZHMgPSB0aGlzLnNlbGVjdGVkTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgY29uc3Qgc3BhY2VPblRvcDogbnVtYmVyID0gc2VsZWN0ZWRMaXN0Qm91bmRzLnRvcDtcbiAgICAgICAgICAgIGNvbnN0IHNwYWNlT25Cb3R0b206IG51bWJlciA9IHZpZXdwb3J0SGVpZ2h0IC0gc2VsZWN0ZWRMaXN0Qm91bmRzLnRvcDtcbiAgICAgICAgICAgIGlmIChzcGFjZU9uQm90dG9tIDwgc3BhY2VPblRvcCAmJiBkcm9wZG93bkhlaWdodCA8IHNwYWNlT25Ub3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5Ub3dhcmRzVG9wKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuVG93YXJkc1RvcChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBLZWVwIHByZWZlcmVuY2UgaWYgdGhlcmUgaXMgbm90IGVub3VnaCBzcGFjZSBvbiBlaXRoZXIgdGhlIHRvcCBvciBib3R0b21cbiAgICAgICAgICAgIC8qIFx0XHRcdGlmIChzcGFjZU9uVG9wIHx8IHNwYWNlT25Cb3R0b20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2hvdWxkT3BlblRvd2FyZHNUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkT3BlblRvd2FyZHNUb3AgPSBzcGFjZU9uVG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZE9wZW5Ub3dhcmRzVG9wID0gIXNwYWNlT25Cb3R0b207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSAqL1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgb3BlblRvd2FyZHNUb3AodmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHZhbHVlICYmIHRoaXMuc2VsZWN0ZWRMaXN0RWxlbS5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5kcm9wZG93bkxpc3RZT2Zmc2V0ID0gMTUgKyB0aGlzLnNlbGVjdGVkTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRyb3Bkb3duTGlzdFlPZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyU2VsZWN0aW9uKGU6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwQ2FjaGVkSXRlbXMuZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xlYXJTZWFyY2goKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW107XG4gICAgICAgIHRoaXMub25EZVNlbGVjdEFsbC5lbWl0KHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgfVxufVxuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIEZvcm1zTW9kdWxlLCBWaXJ0dWFsU2Nyb2xsZXJNb2R1bGVdLFxuICAgIGRlY2xhcmF0aW9uczogW0FuZ3VsYXJNdWx0aVNlbGVjdCwgQ2xpY2tPdXRzaWRlRGlyZWN0aXZlLCBTY3JvbGxEaXJlY3RpdmUsIHN0eWxlRGlyZWN0aXZlLCBMaXN0RmlsdGVyUGlwZSwgSXRlbSwgVGVtcGxhdGVSZW5kZXJlciwgQmFkZ2UsIFNlYXJjaCwgc2V0UG9zaXRpb24sIENJY29uXSxcbiAgICBleHBvcnRzOiBbQW5ndWxhck11bHRpU2VsZWN0LCBDbGlja091dHNpZGVEaXJlY3RpdmUsIFNjcm9sbERpcmVjdGl2ZSwgc3R5bGVEaXJlY3RpdmUsIExpc3RGaWx0ZXJQaXBlLCBJdGVtLCBUZW1wbGF0ZVJlbmRlcmVyLCBCYWRnZSwgU2VhcmNoLCBzZXRQb3NpdGlvbiwgQ0ljb25dLFxuICAgIHByb3ZpZGVyczogW0RhdGFTZXJ2aWNlXVxufSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFyTXVsdGlTZWxlY3RNb2R1bGUgeyB9XG4iXX0=