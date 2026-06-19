import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as THREE from 'three';
import { ModalService } from '../../core/services/modal.service';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginComponent, RegisterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit, OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private animationId: number = 0;

  currentModal$ = this.modalService.modal$;

  constructor(private modalService: ModalService) {}

  stats = [
    { value: '5,000+', label: 'Active Students', icon: 'bi-people-fill' },
    { value: '200+', label: 'Expert Trainers', icon: 'bi-person-badge-fill' },
    { value: '50+', label: 'Courses Available', icon: 'bi-journal-bookmark-fill' },
    { value: '95%', label: 'Success Rate', icon: 'bi-trophy-fill' },
  ];

  categories = [
    { name: 'Oracle Database', icon: 'bi-database-fill', color: '#667eea' },
    { name: 'EPM Solutions', icon: 'bi-graph-up-arrow', color: '#764ba2' },
    { name: 'Full Stack Development', icon: 'bi-code-slash', color: '#f093fb' },
    { name: 'Cloud Computing', icon: 'bi-cloud-fill', color: '#14b8a6' },
    { name: 'Data Analytics', icon: 'bi-bar-chart-line-fill', color: '#ec4899' },
    { name: 'Project Management', icon: 'bi-kanban-fill', color: '#10b981' },
  ];

  courses = [
    {
      title: 'Oracle Database Administration',
      category: 'Oracle',
      instructor: 'Dr. Rajesh Kumar',
      students: 1250,
      rating: 4.8,
      image: 'assets/course1.jpg',
      level: 'Intermediate',
    },
    {
      title: 'EPM Cloud Solutions Mastery',
      category: 'EPM',
      instructor: 'Sarah Johnson',
      students: 890,
      rating: 4.9,
      image: 'assets/course2.jpg',
      level: 'Advanced',
    },
    {
      title: 'Full Stack Web Development',
      category: 'Development',
      instructor: 'Mike Chen',
      students: 2100,
      rating: 4.7,
      image: 'assets/course3.jpg',
      level: 'Beginner',
    },
    {
      title: 'AWS Cloud Architecture',
      category: 'Cloud',
      instructor: 'Emily Rodriguez',
      students: 1567,
      rating: 4.9,
      image: 'assets/course4.jpg',
      level: 'Advanced',
    },
    {
      title: 'Data Science with Python',
      category: 'Analytics',
      instructor: 'Dr. Amit Patel',
      students: 1890,
      rating: 4.8,
      image: 'assets/course5.jpg',
      level: 'Intermediate',
    },
    {
      title: 'DevOps Engineering',
      category: 'Development',
      instructor: 'John Smith',
      students: 1345,
      rating: 4.7,
      image: 'assets/course6.jpg',
      level: 'Advanced',
    },
  ];

  instructors = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Oracle Database Specialist',
      students: 5000,
      courses: 12,
    },
    {
      name: 'Sarah Johnson',
      role: 'EPM Solutions Expert',
      students: 3500,
      courses: 8,
    },
    {
      name: 'Mike Chen',
      role: 'Full Stack Developer',
      students: 8000,
      courses: 15,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Cloud Solutions Architect',
      students: 6000,
      courses: 10,
    },
  ];

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
    const canvas = document.getElementById('threejs-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x6366f1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    // Points
    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (this.particles) {
      this.particles.rotation.x += 0.0003;
      this.particles.rotation.y += 0.0005;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private onWindowResize(): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openLoginModal(): void {
    this.modalService.openModal('login');
  }

  openRegisterModal(): void {
    this.modalService.openModal('register');
  }
}
