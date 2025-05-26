import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { NavbarComponent } from '../navbar/navbar.component';
import { SlidersService } from '../../core/services/sliders.service';
import { ServiciosService } from '../../core/services/servicios.service';
import { PaqueteTuristicoService } from '../../core/services/paquetes-turisticos.service';
import { ResenaService } from '../../core/services/resenas.service';

import { initFlowbite } from 'flowbite';
import { register } from 'swiper/element/bundle';
import Swal from 'sweetalert2';

register();

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent implements OnInit {
  sliders: any[] = [];
  paquetesTuristicos: any[] = [];
  serviciosAlojamiento: any[] = [];
  serviciosExperiencia: any[] = [];
  isLoading: boolean = false;

  constructor(
    private slidersService: SlidersService,
    private servicioService: ServiciosService,
    private paqueteTuristicoService: PaqueteTuristicoService,
    private resenaService: ResenaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSliders();
    this.obtenerServiciosConReseñas();
    this.obtenerServiciosPorTipoExperiencia();
    this.obtenerPaquetesTuristicos();
  }

  private inicializarFavoritos(servicios: any[]) {
    servicios.forEach(s => s.isFavorito = s.isFavorito ?? false);
  }

  cargarSliders(): void {
    this.slidersService.listarSliders().subscribe({
      next: (res: any) => {
        this.sliders = res.data ?? res;
        setTimeout(() => initFlowbite(), 0);
      },
      error: err => console.error('Error al cargar sliders:', err)
    });
  }

  obtenerServiciosConReseñas(): void {
    this.isLoading = true;
    this.servicioService.listarServiciosPorTipo('3').subscribe({
      next: (res: any[]) => {
        this.serviciosAlojamiento = res;
        this.inicializarFavoritos(this.serviciosAlojamiento);

        this.serviciosAlojamiento.forEach(servicio => {
          this.resenaService.obtenerPromedioDeCalificacion(servicio.id)
            .subscribe(prom => {
              servicio.promedioCalificacion = prom.promedioCalificacion;
              servicio.totalResenas = prom.totalResenas;
            });

        });

        this.isLoading = false;
      },
      error: err => {
        console.error('Error al cargar servicios de alojamiento:', err);
        this.isLoading = false;
      }
    });
  }

  obtenerServiciosPorTipoExperiencia(): void {
    this.servicioService.listarServiciosPorTipo('8').subscribe({
      next: (res: any[]) => {
        this.serviciosExperiencia = res;
        this.inicializarFavoritos(this.serviciosExperiencia);
      },
      error: err => console.error('Error al cargar servicios de experiencia:', err)
    });
  }

  obtenerPaquetesTuristicos(): void {
    this.isLoading = true;
    this.paqueteTuristicoService.listarPaquetesTuristicos().subscribe({
      next: (res: any[]) => {
        this.paquetesTuristicos = res;
      },
      error: err => console.error('Error al cargar paquetes turísticos:', err),
      complete: () => this.isLoading = false
    });
  }

  toggleFavorito(servicio: any, event: MouseEvent) {
    event.stopPropagation();
    if (servicio.isFavorito) {
      this.servicioService.desmarcarFavorito(servicio.id).subscribe({
        next: () => servicio.isFavorito = false,
        error: () => Swal.fire('Error', 'No se pudo quitar de favoritos', 'error')
      });
    } else {
      this.servicioService.marcarFavorito(servicio.id).subscribe({
        next: () => servicio.isFavorito = true,
        error: () => Swal.fire('Error', 'No se pudo añadir a favoritos', 'error')
      });
    }
  }

  verDetallesPaquete(id: number): void {
    this.router.navigate([`/paquetesdetalle/${id}`]);
  }

  verDetallesServicios(id: number): void {
    this.router.navigate([`/serviciosdetalle/${id}`]);
  }
}
