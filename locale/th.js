import 'moment/locale/th';
import * as FullCalendar from 'fullcalendar';


/* Thai initialisation for the jQuery UI date picker plugin. */
/* Written by pipo (pipo@sixhead.com). */
FullCalendar.datepickerLocale('th', 'th', {
  closeText: "ปิด",
  prevText: "ก่อนหน้า",
  nextText: "ถัดไป",
  currentText: "วันนี้",
  monthNames: [ "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม" ],
  monthNamesShort: [ "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค." ],
  dayNames: [ "อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์" ],
  dayNamesShort: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"],
  dayNamesMin: ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],
  weekHeader: "สัปดาห์",
  dateFormat: "dd/mm/yy",
  firstDay: 0,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: "" });


FullCalendar.locale("th", {
  buttonText: {
    month: "เดือน",
    week: "สัปดาห์",
    day: "วัน",
    list: "กำหนดการ"
  },
  allDayText: "ตลอดวัน",
  eventLimitText: "เพิ่มเติม",
  noEventsMessage: "ไม่มีกิจกรรมที่จะแสดง"
});
