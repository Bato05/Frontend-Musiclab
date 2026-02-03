import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GetUsers } from '../../../services/getUsers';

@Component({
  selector: 'app-search-users',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './searchUsers.html',
  styleUrl: '../../../app.css'
})
export class SearchUsers implements OnInit {
  // --- Propiedades de Datos ---
  public allArtists: any[] = [];      
  public filteredArtists: any[] = []; 
  public loading: boolean = true;

  // --- Modelos para Filtros ---
  public searchText: string = '';
  public selectedCategory: string = 'All';

  public categories: string[] = [
    'All', 'Vocalist', 'Guitarist', 'Bassist', 'Drummer', 
    'Pianist', 'Violinist', 'Saxophonist', 'Trumpeter', 'DJ', 'Other'
  ];

  // --- Inyecciones ---
  private usersService = inject(GetUsers);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // Elemento para detectar cambios manualmente

  ngOnInit(): void {
    this.cargarArtistas();
  }

  /**
   * Carga la lista de usuarios y fuerza la detección de cambios
   */
  cargarArtistas(): void {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (res: any) => {
        this.allArtists = Array.isArray(res) ? res : [];
        this.filteredArtists = [...this.allArtists];
        this.loading = false;
        
        // Forzamos a Angular a renderizar los perfiles inmediatamente
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error("Error al cargar artistas:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    const text = this.searchText.toLowerCase().trim();
    this.filteredArtists = this.allArtists.filter(artist => {
      const nombreCompleto = `${artist.first_name} ${artist.last_name}`.toLowerCase();
      const cumpleNombre = nombreCompleto.includes(text);
      const cumpleCategoria = this.selectedCategory === 'All' || 
                              (artist.artist_type && artist.artist_type.includes(this.selectedCategory));
      return cumpleNombre && cumpleCategoria;
    });
    this.cdr.detectChanges(); // Asegurar que la lista filtrada se vea al instante
  }

  logout(): void {
    localStorage.clear(); 
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}