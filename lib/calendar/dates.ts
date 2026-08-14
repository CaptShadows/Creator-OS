export type CalendarView="month"|"week";
export function parseCalendarDate(value:string|undefined,now=new Date()){const match=value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!match)return new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));return new Date(Date.UTC(+match[1],+match[2]-1,+match[3]));}
export function calendarRange(anchor:Date,view:CalendarView){if(view==="week"){const day=(anchor.getUTCDay()+6)%7;const start=new Date(anchor);start.setUTCDate(start.getUTCDate()-day);const end=new Date(start);end.setUTCDate(end.getUTCDate()+7);return{start,end};}const start=new Date(Date.UTC(anchor.getUTCFullYear(),anchor.getUTCMonth(),1));const end=new Date(Date.UTC(anchor.getUTCFullYear(),anchor.getUTCMonth()+1,1));return{start,end};}
export function dateInputToUtc(value:string){return new Date(`${value}T12:00:00.000Z`);}
export function dayKey(value:Date){return value.toISOString().slice(0,10);}
export function calendarDays(start:Date,end:Date){const days:Date[]=[];for(const current=new Date(start);current<end;current.setUTCDate(current.getUTCDate()+1))days.push(new Date(current));return days;}
export function shiftCalendar(anchor:Date,view:CalendarView,amount:number){const next=new Date(anchor);if(view==="week")next.setUTCDate(next.getUTCDate()+amount*7);else next.setUTCMonth(next.getUTCMonth()+amount);return next;}
