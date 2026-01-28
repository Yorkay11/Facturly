"use client";

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';
import './circular-gallery.css';

interface CircularGalleryItem {
  image: string;
  text: string;
}

interface CircularGalleryProps {
  items?: CircularGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  autoSpeed?: number; // Vitesse automatique de l'animation (par défaut 0.04 = très lent)
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createTextTexture(
  gl: Renderer['gl'] | any,
  text: string,
  font: string = 'bold 30px monospace',
  color: string = 'black'
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context');
  
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(parseInt(font, 10) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl as any, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  gl: Renderer['gl'];
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh?: Mesh;

  constructor({
    gl,
    plane,
    renderer,
    text,
    textColor = '#545050',
    font = '30px sans-serif'
  }: {
    gl: Renderer['gl'];
    plane: Mesh;
    renderer: Renderer;
    text: string;
    textColor?: string;
    font?: string;
  }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh(): void {
    const gl = this.gl as any;
    const { texture, width, height } = createTextTexture(gl, this.text, this.font, this.textColor);
    const geometry = new Plane(gl);
    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.15;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

interface MediaParams {
  geometry: Plane;
  gl: Renderer['gl'];
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: { width: number; height: number };
  text: string;
  viewport: { width: number; height: number };
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: Renderer['gl'];
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: { width: number; height: number };
  text: string;
  viewport: { width: number; height: number };
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
  program?: Program;
  plane?: Mesh;
  title?: Title;
  scale: number = 1;
  padding: number = 2;
  width: number = 0;
  widthTotal: number = 0;
  x: number = 0;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;

  constructor(params: MediaParams) {
    this.geometry = params.geometry;
    this.gl = params.gl;
    this.image = params.image;
    this.index = params.index;
    this.length = params.length;
    this.renderer = params.renderer;
    this.scene = params.scene;
    this.screen = params.screen;
    this.text = params.text;
    this.viewport = params.viewport;
    this.bend = params.bend;
    this.textColor = params.textColor;
    this.borderRadius = params.borderRadius;
    this.font = params.font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader(): void {
    const gl = this.gl as any;
    const texture = new Texture(gl, {
      generateMipmaps: true
    });
    this.program = new Program(gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          // Calcul pour contain (l'image s'adapte entièrement dans le conteneur)
          float imageAspect = uImageSizes.x / uImageSizes.y;
          float planeAspect = uPlaneSizes.x / uPlaneSizes.y;
          
          vec2 scale;
          if (imageAspect > planeAspect) {
            // L'image est plus large, on scale selon la largeur
            scale = vec2(1.0, planeAspect / imageAspect);
          } else {
            // L'image est plus haute, on scale selon la hauteur
            scale = vec2(imageAspect / planeAspect, 1.0);
          }
          
          // Centrer l'image
          vec2 uv = (vUv - 0.5) / scale + 0.5;
          
          // Fond blanc
          vec3 backgroundColor = vec3(1.0, 1.0, 1.0);
          
          // Échantillonner la texture
          vec4 color = texture2D(tMap, uv);
          
          // Calculer le masque pour les bords arrondis
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          // Calcul de l'ombre portée
          vec2 shadowOffset = vec2(0.01, -0.01); // Décalage de l'ombre (bas droite)
          float shadowDistance = roundedBoxSDF(vUv - 0.5 + shadowOffset, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          // Ombre douce
          float shadowSmooth = 0.015;
          float shadowAlpha = 1.0 - smoothstep(-shadowSmooth, shadowSmooth, shadowDistance);
          shadowAlpha *= 0.15; // Opacité de l'ombre (15%)
          
          // Smooth antialiasing for edges
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          // Calcul de la bordure violette fine
          float borderWidth = 0.008; // Largeur de la bordure (fine)
          float borderInner = d + borderWidth;
          float borderOuter = d;
          float borderMask = smoothstep(borderInner, borderOuter, 0.0);
          
          // Couleur violette (couleur primaire de l'app)
          vec3 borderColor = vec3(0.322, 0.153, 1.0); // #5227FF en RGB normalisé
          
          // Mélanger le fond blanc avec l'image
          // Si l'image est transparente ou en dehors des limites, utiliser le fond blanc
          vec3 finalColor = mix(backgroundColor, color.rgb, color.a);
          
          // Ajouter la bordure violette
          finalColor = mix(finalColor, borderColor, borderMask * alpha);
          
          // Ajouter l'ombre (noir avec transparence)
          vec3 shadowColor = vec3(0.0, 0.0, 0.0);
          finalColor = mix(finalColor, shadowColor, shadowAlpha * (1.0 - alpha));
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      if (this.program?.uniforms?.uImageSizes) {
        this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
      }
    };
  }

  createMesh(): void {
    if (!this.program) return;
    const gl = this.gl as any;
    this.plane = new Mesh(gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  createTitle(): void {
    if (!this.plane) return;
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }

  update(scroll: { current: number; last: number }, direction: string): void {
    if (!this.plane) return;
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    if (this.program?.uniforms) {
      this.program.uniforms.uTime.value += 0.04;
      this.program.uniforms.uSpeed.value = this.speed;
    }

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: { width: number; height: number }; viewport?: { width: number; height: number } } = {}): void {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
    }
    if (!this.plane) return;
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    if (this.program?.uniforms?.uPlaneSizes) {
      this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    }
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

interface AppParams {
  items?: CircularGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  autoSpeed?: number; // Vitesse automatique (par défaut lente)
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  autoSpeed: number; // Vitesse automatique de base
  scroll: { ease: number; current: number; target: number; last: number; position?: number };
  onCheckDebounce: () => void;
  renderer?: Renderer;
  gl?: WebGLRenderingContext;
  camera?: Camera;
  scene?: Transform;
  screen: { width: number; height: number } = { width: 0, height: 0 };
  viewport: { width: number; height: number } = { width: 0, height: 0 };
  planeGeometry?: Plane;
  mediasImages?: CircularGalleryItem[];
  medias?: Media[];
  isDown: boolean = false;
  start: number = 0;
  raf?: number;
  boundOnResize?: () => void;
  boundOnWheel?: (e: WheelEvent) => void;
  boundOnTouchDown?: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove?: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp?: () => void;

  constructor(container: HTMLElement, params: AppParams = {}) {
    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = params.scrollSpeed || 2;
    this.autoSpeed = params.autoSpeed || 0.05; // Vitesse automatique lente par défaut
    this.scroll = { ease: params.scrollEase || 0.05, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(
      params.items,
      params.bend ?? 3,
      params.textColor ?? '#ffffff',
      params.borderRadius ?? 0.05,
      params.font ?? 'bold 30px Figtree'
    );
    this.update();
    this.addEventListeners();
  }

  createRenderer(): void {
    if (!this.container) return;
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    const canvas = this.gl.canvas;
    if (canvas instanceof HTMLCanvasElement) {
      this.container.appendChild(canvas);
    }
  }

  createCamera(): void {
    if (!this.renderer) return;
    // Use renderer.gl directly to get the correct OGL context type
    this.camera = new Camera(this.renderer.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene(): void {
    this.scene = new Transform();
  }

  createGeometry(): void {
    if (!this.gl) return;
    this.planeGeometry = new Plane(this.gl as Renderer['gl'], {
      heightSegments: 50,
      widthSegments: 100
    });
  }

  createMedias(items: CircularGalleryItem[] | undefined, bend: number, textColor: string, borderRadius: number, font: string): void {
    if (!this.gl || !this.planeGeometry || !this.renderer || !this.scene) return;
    
    const defaultItems: CircularGalleryItem[] = [
      { image: `https://picsum.photos/seed/1/800/600?grayscale`, text: 'Bridge' },
      { image: `https://picsum.photos/seed/2/800/600?grayscale`, text: 'Desk Setup' },
      { image: `https://picsum.photos/seed/3/800/600?grayscale`, text: 'Waterfall' },
      { image: `https://picsum.photos/seed/4/800/600?grayscale`, text: 'Strawberries' },
      { image: `https://picsum.photos/seed/5/800/600?grayscale`, text: 'Deep Diving' },
      { image: `https://picsum.photos/seed/16/800/600?grayscale`, text: 'Train Track' },
      { image: `https://picsum.photos/seed/17/800/600?grayscale`, text: 'Santorini' },
      { image: `https://picsum.photos/seed/8/800/600?grayscale`, text: 'Blurry Lights' },
      { image: `https://picsum.photos/seed/9/800/600?grayscale`, text: 'New York' },
      { image: `https://picsum.photos/seed/10/800/600?grayscale`, text: 'Good Boy' },
      { image: `https://picsum.photos/seed/21/800/600?grayscale`, text: 'Coastline' },
      { image: `https://picsum.photos/seed/12/800/600?grayscale`, text: 'Palm Trees' }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    if (!this.gl || !this.planeGeometry || !this.renderer || !this.scene) return;
    
    const gl = this.gl as any;
    const planeGeometry = this.planeGeometry;
    const renderer = this.renderer;
    const scene = this.scene;
    
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: planeGeometry,
        gl: gl,
        image: data.image,
        index,
        length: this.mediasImages!.length,
        renderer: renderer,
        scene: scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font
      });
    });
  }

  onTouchDown(e: MouseEvent | TouchEvent): void {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent): void {
    if (!this.isDown) return;
    const x = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    if (this.scroll.position !== undefined) {
      this.scroll.target = this.scroll.position + distance;
    }
  }

  onTouchUp(): void {
    this.isDown = false;
    this.onCheck();
  }

  onWheel(e: WheelEvent): void {
    const delta = e.deltaY || (e as any).wheelDelta || (e as any).detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  onCheck(): void {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize(): void {
    if (!this.container) return;
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    if (this.renderer) {
      this.renderer.setSize(this.screen.width, this.screen.height);
    }
    if (this.camera) {
      this.camera.perspective({
        aspect: this.screen.width / this.screen.height
      });
      const fov = (this.camera.fov * Math.PI) / 180;
      const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
      const width = height * this.camera.aspect;
      this.viewport = { width, height };
    }
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update(): void {
    // Ajouter la vitesse automatique de base (animation continue même sans scroll)
    this.scroll.target += this.autoSpeed;
    
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render({ scene: this.scene, camera: this.camera });
    }
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners(): void {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousewheel', this.boundOnWheel as any);
    window.addEventListener('wheel', this.boundOnWheel);
    window.addEventListener('mousedown', this.boundOnTouchDown as any);
    window.addEventListener('mousemove', this.boundOnTouchMove as any);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchstart', this.boundOnTouchDown as any);
    window.addEventListener('touchmove', this.boundOnTouchMove as any);
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy(): void {
    if (this.raf) window.cancelAnimationFrame(this.raf);
    if (this.boundOnResize) window.removeEventListener('resize', this.boundOnResize);
    if (this.boundOnWheel) {
      window.removeEventListener('mousewheel', this.boundOnWheel as any);
      window.removeEventListener('wheel', this.boundOnWheel);
    }
    if (this.boundOnTouchDown) {
      window.removeEventListener('mousedown', this.boundOnTouchDown as any);
      window.removeEventListener('touchstart', this.boundOnTouchDown as any);
    }
    if (this.boundOnTouchMove) {
      window.removeEventListener('mousemove', this.boundOnTouchMove as any);
      window.removeEventListener('touchmove', this.boundOnTouchMove as any);
    }
    if (this.boundOnTouchUp) {
      window.removeEventListener('mouseup', this.boundOnTouchUp);
      window.removeEventListener('touchend', this.boundOnTouchUp);
    }
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.01,
  font = 'bold 20px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05,
  autoSpeed = 0.04
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const app = new App(containerRef.current, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
      autoSpeed
    });
    
    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, autoSpeed]);
  
  return <div className="circular-gallery" ref={containerRef} />;
}

export type { CircularGalleryItem, CircularGalleryProps };
