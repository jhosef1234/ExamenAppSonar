import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { ServiciosService } from '../../core/services/servicios.service';
import { AuthService } from '../../core/services/auth.service';
import { forkJoin, map, of, switchMap, tap } from 'rxjs';
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-misfavoritos',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './misfavoritos.component.html',
  styleUrl: './misfavoritos.component.css'
})
export class MisfavoritosComponent implements OnInit {
  favoritos: any[] = [];

  constructor(
    private serviciosService: ServiciosService,
    private emprendimientosService: EmprendimientoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  private cargarFavoritos() {
    const usuarioId = this.authService.getUsuarioId();

    this.serviciosService.listarFavoritos(usuarioId).pipe(
      // switchMap: reemplaza el observable de favoritos por uno que emite los servicios enriquecidos
      switchMap((servicios: any[]) => {
        // Para cada servicio, preparamos un Observable que trae el emprendimiento
        const enriquecidos$ = servicios.map(servicio => {
          // asumimos que serviciosEmprendedores[0].emprendimientoId existe
          const empId = servicio.serviciosEmprendedores[0]?.emprendimientoId;
          if (!empId) {
            // si no hay id, devolvemos directamente el servicio
            return of({ ...servicio, emprendimientoNombre: '—' });
          }
          return this.emprendimientosService.verEmprendimiento(empId).pipe(
            map(emp => ({
              ...servicio,
              emprendimientoNombre: emp.nombre  // añadimos el nombre
            }))
          );
        });
        // forkJoin espera a todos los observables y devuelve un array con los servicios enriquecidos
        return forkJoin(enriquecidos$);
      })
    ).subscribe({
      next: (res) => {
        this.favoritos = res;
        console.log('Favoritos enriquecidos:', this.favoritos);
      },
      error: (err) => {
        console.error('Error cargando favoritos:', err);
      }
    });
  }
  mostrarMapa(lat: number, lng: number) {
    const src = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    Swal.fire({
      title: 'Ubicación en el mapa',
      html: `<div style="width:100%;height:0;padding-bottom:56%;position:relative">
               <iframe 
                 src="${src}"
                 style="border:0; position:absolute; top:0; left:0; width:100%; height:100%;"
                 allowfullscreen=""
                 loading="lazy">
               </iframe>
             </div>`,
      width: '600px',
      showConfirmButton: false,
      showCloseButton: true
    });
  }
}
