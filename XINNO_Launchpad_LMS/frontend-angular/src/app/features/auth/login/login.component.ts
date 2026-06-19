import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import * as THREE from 'three';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles: THREE.Points[] = [];
  private lines: THREE.Line[] = [];
  private animationId: number = 0;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.initThreeJS();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = null;
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 50;
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create spider web particles
    this.createSpiderWeb();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createSpiderWeb(): void {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ));
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x4f46e5,
      size: 2,
      transparent: true,
      opacity: 0.8
    });
    
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.particles.push(points);
    
    // Store velocities for animation
    (points as any).velocities = velocities;
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Animate particles
    this.particles.forEach(particle => {
      const positions = particle.geometry.attributes['position'].array as Float32Array;
      const velocities = (particle as any).velocities as THREE.Vector3[];
      
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;
        
        // Bounce particles within bounds
        if (Math.abs(positions[i * 3]) > 50) velocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 50) velocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 50) velocities[i].z *= -1;
      }
      
      particle.geometry.attributes['position'].needsUpdate = true;
    });
    
    // Remove old lines
    this.lines.forEach(line => this.scene.remove(line));
    this.lines = [];
    
    // Create connecting lines between nearby particles
    if (this.particles.length > 0) {
      const positions = this.particles[0].geometry.attributes['position'].array as Float32Array;
      const maxDistance = 15;
      
      for (let i = 0; i < positions.length / 3; i++) {
        for (let j = i + 1; j < positions.length / 3; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance < maxDistance) {
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = new Float32Array([
              positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
              positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
            ]);
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
              color: 0x4f46e5,
              transparent: true,
              opacity: 0.3 * (1 - distance / maxDistance)
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
            this.lines.push(line);
          }
        }
      }
    }
    
    // Rotate camera slightly
    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 5;
    this.camera.position.y = Math.cos(Date.now() * 0.0001) * 5;
    this.camera.lookAt(this.scene.position);
    
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        this.isLoading = false;
        if (response.success) {
          console.log('Login successful, navigating to dashboard...');
          this.router.navigate(['/dashboard']).then(
            () => console.log('Navigation successful'),
            (err) => console.error('Navigation failed:', err)
          );
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Login failed. Please try again.';
      },
    });
  }

  closeModal(): void {
    this.modalService.closeModal();
  }

  switchToRegister(): void {
    this.modalService.openModal('register');
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
