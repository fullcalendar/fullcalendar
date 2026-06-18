import { CalendarContext } from '../CalendarContext.js';

export interface EnhancedTodayHighlightingOptions {
  enabled?: boolean;
}

export function initEnhancedTodayHighlighting(
  context: CalendarContext,
  options: EnhancedTodayHighlightingOptions = {}
): void {
  if (!options.enabled) return;

  const calendar = context.calendarApi;

  function highlightToday(): void {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    document.querySelectorAll('.fc-timeline-slot-today-enhanced').forEach(el => {
      el.classList.remove('fc-timeline-slot-today-enhanced');
    });

    document.querySelectorAll(`.fc-timeline-slot[data-date*="${dateStr}"]`).forEach(slot => {
      slot.classList.add('fc-timeline-slot-today-enhanced');
    });
  }

  calendar.on('datesSet', () => setTimeout(highlightToday, 0));
  calendar.on('viewDidMount', () => setTimeout(highlightToday, 0));
  setTimeout(highlightToday, 100);
}
