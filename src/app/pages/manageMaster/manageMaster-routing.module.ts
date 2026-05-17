import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { manageMenuComponent } from './manageMenu/manageMenu.component';
import { managePersonComponent } from './managePerson/mangaePerson.component';
import { manageDrugComponent } from './manageDrug/manageDrug.component';
import { manageSubGroupDrugComponent } from './manageSubGroupDrug/manageSubGroupDrug.component';
import { manageEmailSendComponent } from './mangeEmailSend/manageEmailSend.component';
import { manageDemandDrugComponent } from './manageDemandDrug/manageDemandDrug.component';
const routes: Routes = [
    {
        path:"",
        component: manageMenuComponent
    },
    {
    path:"manageMenu",
    component: manageMenuComponent
    },
    {
    path:"managePerson",
    component: managePersonComponent
    },
    {
    path:"manageDrug",
    component: manageDrugComponent
    },
    {
    path:"manageSubGroupDrug",
    component: manageSubGroupDrugComponent
    },
    {
    path:"manageEmailSend",
    component: manageEmailSendComponent
    },
    {
    path:"manageDemandDrug",
    component: manageDemandDrugComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManageMasterRoutingModule{}