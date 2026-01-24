import { Routes } from '@angular/router';

import { Login } from './components/forms/login/login';
import { Register } from './components/forms/register/register';

export const routes: Routes = [
    // Redirecciones...
    { path: '', redirectTo: 'login', pathMatch: 'full'},
    { path: 'login', component: Login},
    { path: 'register', component: Register},
];
