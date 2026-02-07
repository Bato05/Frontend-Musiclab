import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GetUsers } from '../../../services/getUsers';
import { FollowService } from '../../../services/followService';

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
  public followedIds: number[] = []; 
  public loadingFollow: number | null = null; 

  // --- Modelos para Filtros ---
  public searchText: string = '';
  public selectedCategory: string = 'All';

  public categories: string[] = [
    'All', 'Vocalist', 'Guitarist', 'Bassist', 'Drummer', 
    'Pianist', 'Violinist', 'Saxophonist', 'Trumpeter', 'DJ', 'Another'
  ];

  // --- Inyecciones ---
  private usersService = inject(GetUsers);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private followService = inject(FollowService);

  ngOnInit(): void {
    this.cargarArtistas();
    this.cargarSeguidos(); 
  }

  // --- FUNCIÓN QUE FALTABA ---
  cargarArtistas(): void {
  this.loading = true;
  this.usersService.getUsers().subscribe({
    next: (res: any) => {
      // TRUCO DE ORO: Convertimos el ID a número inmediatamente
      // Esto evita que '5' (texto) se compare con 5 (numero) y falle
      const usuariosLimpios = res.map((u: any) => ({ ...u, id: Number(u.id) }));
      
      this.allArtists = usuariosLimpios;
      this.filteredArtists = usuariosLimpios;
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Error al cargar artistas:", err);
      this.loading = false;
    }
  });
}

  cargarSeguidos(): void {
    const sesion = JSON.parse(localStorage.getItem('user_session') || '{}');
    const miId = sesion.user?.id || sesion.id; 

    if (miId) {
      this.followService.getFollowing(miId).subscribe({
        next: (res: any) => {
          if (res && res.following) {
            // Convertimos a números para asegurar que .includes() funcione bien
            this.followedIds = res.following.map((f: any) => Number(f.id));
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al obtener seguidos:", err);
        }
      });
    }
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
    this.cdr.detectChanges();
  }

  isFollowing(id: number): boolean {
    return this.followedIds.includes(id);
  }

  toggleFollow(artistId: number): void {
    // artistId ya viene como número gracias al map de arriba
    this.loadingFollow = artistId; 
    
    if (this.isFollowing(artistId)) {
      this.followService.unfollow(artistId).subscribe({
        next: () => {
          this.followedIds = this.followedIds.filter(id => id !== artistId);
          this.loadingFollow = null;
          this.cdr.detectChanges();
        },
        error: () => this.loadingFollow = null
      });
    } else {
      this.followService.follow(artistId).subscribe({
        next: () => {
          this.followedIds.push(artistId);
          this.loadingFollow = null;
          this.cdr.detectChanges();
        },
        error: () => this.loadingFollow = null
      });
    }
  }

  logout(): void {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}