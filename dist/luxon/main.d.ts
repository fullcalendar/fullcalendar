declare module "@fullcalendar/luxon" {
    import { DateTime as LuxonDateTime, Duration as LuxonDuration } from "luxon";
    import { Calendar, Duration } from "@fullcalendar/core";
    export function toDateTime(date: Date, calendar: Calendar): LuxonDateTime;
    export function toDuration(duration: Duration, calendar: Calendar): LuxonDuration;
    const _default_10: import("@fullcalendar/core/plugin-system").PluginDef;
    export default _default_10;
}