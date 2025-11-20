import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { manageMenuComponent } from './manageMenu/manageMenu.component';
import { managePersonComponent } from './managePerson/mangaePerson.component';

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
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ManageMasterRoutingModule{}