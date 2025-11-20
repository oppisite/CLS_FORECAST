import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbDropdownModule , NgbNavModule, NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
// Select Droup down
import { NgSelectModule } from '@ng-select/ng-select';
// Ui Switch
import { UiSwitchModule } from 'ngx-ui-switch';
// FlatPicker
import { FlatpickrModule } from 'angularx-flatpickr';
// Color Picker
import { ColorPickerModule } from 'ngx-color-picker';
// Mask
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask, IConfig } from 'ngx-mask';
// Ngx Sliders
import { NgxSliderModule } from 'ngx-slider-v2';
//Wizard
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
// Ck Editer
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// Drop Zone
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
// Auto Complate
import {AutocompleteLibModule} from 'angular-ng-autocomplete';

// Load Icons
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

// Component pages

import { SharedModule } from '../../shared/shared.module';
import { BasicComponent } from '../form/basic/basic.component';
import { SelectComponent } from '../form/select/select.component';
import { CheckboxsRadiosComponent } from '../form/checkboxs-radios/checkboxs-radios.component';
import { PickersComponent } from '../form/pickers/pickers.component';
import { MasksComponent } from '../form/masks/masks.component';
import { AdvancedComponent } from '../form/advanced/advanced.component';
import { RangeSlidersComponent } from '../form/range-sliders/range-sliders.component';
import { ValidationComponent } from '../form/validation/validation.component';
import { WizardComponent } from '../form/wizard/wizard.component';
import { EditorsComponent } from '../form/editors/editors.component';
import { FileUploadsComponent } from '../form/file-uploads/file-uploads.component';
import { LayoutsComponent } from '../form/layouts/layouts.component';
import { CustomCaptchaComponent } from '../form/custom-capcha/custom-captcha.component';

import { manageMenuComponent } from './manageMenu/manageMenu.component';
import { managePersonComponent } from './managePerson/mangaePerson.component';
import { ManageMasterRoutingModule } from './manageMaster-routing.module';
const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};

@NgModule({
    declarations: [
        manageMenuComponent,
        managePersonComponent
    ],
  imports: [
    CommonModule,
    FormsModule,
    NgbPaginationModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbNavModule,
    NgSelectModule,
    UiSwitchModule,
    FlatpickrModule,
    ColorPickerModule,
    NgxMaskDirective, 
    NgxMaskPipe,
    NgxSliderModule,
    CdkStepperModule,
    NgStepperModule,
    CKEditorModule,
    DropzoneModule,
    AutocompleteLibModule,
    NgbAccordionModule,
    SharedModule,
    ManageMasterRoutingModule
  ],
  providers:[
    provideNgxMask(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class manageMasterModule { 
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
