import { Component, signal, Renderer2, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private renderer = inject(Renderer2);

  isDark = signal(false);

  constructor() {
    // Restore saved preference, then fall back to system preference
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;

    this.isDark.set(dark);
    this.applyTheme(dark);
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
    this.applyTheme(this.isDark());
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }

  private applyTheme(dark: boolean): void {
    // Set on <html> — DaisyUI 5 reads data-theme from the root element
    this.renderer.setAttribute(document.documentElement, 'data-theme', dark ? 'dark' : 'light');
  }
}
