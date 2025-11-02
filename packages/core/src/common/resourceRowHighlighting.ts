import { CalendarContext } from '../CalendarContext.js';

export interface ResourceRowHighlightingOptions {
  enabled?: boolean;
}

export function initResourceRowHighlighting(
  context: CalendarContext,
  options: ResourceRowHighlightingOptions = {}
): void {
  if (!options.enabled) return;

  const calendar = context.calendarApi;
  let highlighted: { resource?: Element; slots?: Element[] } = {};

  function getResourceId(el: Element): string | null {
    return (el as HTMLElement).dataset?.resourceId || el.getAttribute('data-resource-id') || null;
  }

  function removeHighlight(): void {
    if (highlighted.resource) highlighted.resource.classList.remove('fc-resource-hover');
    highlighted.slots?.forEach(s => s.classList.remove('fc-timeline-slot-hover'));
    highlighted = {};
  }

  function highlightRow(resourceId: string): void {
    removeHighlight();

    const resource = document.querySelector(`.fc-resource[data-resource-id="${resourceId}"]`);
    const slots = Array.from(document.querySelectorAll(`.fc-timeline-lane[data-resource-id="${resourceId}"]`));

    if (resource) {
      resource.classList.add('fc-resource-hover');
      highlighted.resource = resource;
    }

    slots.forEach(slot => {
      slot.classList.add('fc-timeline-slot-hover');
    });
    highlighted.slots = slots;
  }

  function handleHover(e: MouseEvent): void {
    const target = e.target as Element;
    const resource = target.closest('.fc-resource') as Element;
    const slot = target.closest('.fc-timeline-lane') as Element;

    const resourceId = resource ? getResourceId(resource) : slot ? getResourceId(slot) : null;
    if (resourceId) highlightRow(resourceId);
  }

  function handleLeave(): void {
    removeHighlight();
  }

  const calendarEl = (calendar as any).el;
  if (!calendarEl) return;

  calendarEl.addEventListener('mouseenter', handleHover, true);
  calendarEl.addEventListener('mouseleave', handleLeave, true);

  calendar.on('eventsSet', () => setTimeout(removeHighlight, 0));
  calendar.on('datesSet', () => setTimeout(removeHighlight, 0));
}
