import { Routes } from '@angular/router';
import { authGuard } from './services/guardService'; // Importamos el guard

import { Login } from './components/forms/login/login';
import { Register } from './components/forms/register/register';
import { Home } from './components/dashboard/home/home';
import { UploadContent } from './components/dashboard/uploadContent/uploadContent';

export const routes: Routes = [
    // Redirecciones...
    { path: '', redirectTo: 'login', pathMatch: 'full'},
    { path: 'login', component: Login},
    { path: 'register', component: Register},
    { path: 'home', 
      component: Home,
      canActivate: [authGuard]},
    { path: 'upload', 
      component: UploadContent,
      canActivate: [authGuard]}
];
