declare module "@fullcalendar/moment" {
    import moment from "moment";
    import { Calendar, Duration } from "@fullcalendar/core";
    export function toMoment(date: Date, calendar: Calendar): moment.Moment;
    export function toDuration(fcDuration: Duration): moment.Duration;
    const _default_10: import("@fullcalendar/core/plugin-system").PluginDef;
    export default _default_10;
}