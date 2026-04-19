import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ChatResponse } from '../../core/services/api.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked {
  private apiService = inject(ApiService);

  @ViewChild('scrollMe') private scrollContainer!: ElementRef;
  @ViewChild('chatTextarea') private chatTextarea!: ElementRef;

  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isTyping = signal(false);
  copiedIndex = signal<number | null>(null);

  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch (_) {}
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(): void {
    const el = this.chatTextarea?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    // Re-enable scroll once max height reached
    el.style.overflowY = el.scrollHeight > 160 ? 'auto' : 'hidden';
  }

  private resetTextarea(): void {
    const el = this.chatTextarea?.nativeElement;
    if (el) {
      el.style.height = 'auto';
      el.style.overflowY = 'hidden';
    }
  }

  sendMessage(): void {
    const text = this.userInput().trim();
    if (!text || this.isTyping()) return;

    this.messages.update(m => [...m, { role: 'user', content: text, timestamp: new Date() }]);
    this.userInput.set('');
    this.resetTextarea();
    this.isTyping.set(true);
    this.shouldScroll = true;

    this.apiService.sendMessage(text).subscribe({
      next: (res: ChatResponse) => {
        this.messages.update(m => [...m, { role: 'assistant', content: res.response, timestamp: new Date() }]);
        this.isTyping.set(false);
        this.shouldScroll = true;
      },
      error: (err) => {
        const errorMsg = err.status === 500
          ? 'Llama model is offline or still loading. Please ensure Ollama is running with the Llama model.'
          : 'Could not reach the server. Please check your connection and try again.';
        this.messages.update(m => [...m, { role: 'assistant', content: errorMsg, timestamp: new Date(), error: true }]);
        this.isTyping.set(false);
        this.shouldScroll = true;
      }
    });
  }

  async copyMessage(content: string, index: number): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    } catch (_) {}
  }

  clearChat(): void {
    this.messages.set([]);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  get charCount(): number {
    return this.userInput().length;
  }
}
