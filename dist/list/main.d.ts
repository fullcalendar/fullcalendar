declare module "@fullcalendar/list/ListEventRenderer" {
    import { FgEventRenderer, Seg } from "@fullcalendar/core";
    import ListView from "@fullcalendar/list/ListView";
    export { ListEventRenderer as default, ListEventRenderer };
    class ListEventRenderer extends FgEventRenderer {
        listView: ListView;
        constructor(listView: ListView);
        attachSegs(segs: Seg[]): void;
        detachSegs(): void;
        renderSegHtml(seg: Seg): string;
        computeEventTimeFormat(): {
            hour: string;
            minute: string;
            meridiem: string;
        };
    }
}

declare module "@fullcalendar/list/ListView" {
    import { View, ViewProps, ScrollComponent, DateMarker, DateRange, DateProfileGenerator, ComponentContext, ViewSpec, EventUiHash, EventRenderRange, EventStore, Seg } from "@fullcalendar/core";
    export { ListView as default, ListView };
    class ListView extends View {
        scroller: ScrollComponent;
        contentEl: HTMLElement;
        dayDates: DateMarker[];
        private computeDateVars;
        private eventStoreToSegs;
        private renderContent;
        constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement);
        render(props: ViewProps): void;
        destroy(): void;
        updateSize(isResize: any, viewHeight: any, isAuto: any): void;
        computeScrollerHeight(viewHeight: any): number;
        _eventStoreToSegs(eventStore: EventStore, eventUiBases: EventUiHash, dayRanges: DateRange[]): Seg[];
        eventRangesToSegs(eventRanges: EventRenderRange[], dayRanges: DateRange[]): any[];
        eventRangeToSegs(eventRange: EventRenderRange, dayRanges: DateRange[]): any[];
        renderEmptyMessage(): void;
        renderSegList(allSegs: any): void;
        groupSegsByDay(segs: any): any[];
        buildDayHeaderRow(dayDate: any): HTMLTableRowElement;
    }
}

declare module "@fullcalendar/list" {
    import ListView from "@fullcalendar/list/ListView";
    export { ListView };
    const _default_9: import("@fullcalendar/core/plugin-system").PluginDef;
    export default _default_9;
}