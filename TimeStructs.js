//group of classes used to constrain time inputs to be valid
export class Hour
{
    constructor(value)
    {
        this.value = parseInt(value);
        if(isNaN(this.value) || this.value < 1)
            this.value = 1;
        else if(this.value > 12)
            this.value = 12;
    }
    valueOf() { return this.value; }
    toString() { return String(this.value); }
}
export class Minute
{
    constructor(value)
    {
        this.value = parseInt(value);
        if(isNaN(this.value) || this.value < 0)
            this.value = 0;
        else if(this.value > 59)
            this.value = 59;
    }
    valueOf() { return this.value; }
    toString() { return String(this.value).padStart(2, '0'); }
}
export class Ampm
{
    constructor(str)
    { this.value = str.toLowerCase() != "pm" ? "AM" : "PM"; }
    toString() { return this.value; }
}


//time of day ex: 9:00 AM, 5:00 PM
export class Time
{
    constructor(hour, minute, ampm, totalSecs = null)
    {
        this.hour = new Hour(hour);
        this.minute = new Minute(minute);
        this.ampm = new Ampm(ampm);
        if(totalSecs != null)
            this.totalSecs = totalSecs;
        else
            this.totalSecs = (hour == 12 && ampm == "AM" ? 0 : hour * 3600)
                + (minute * 60)
                + (ampm == "PM" && hour != 12 ? 43200 : 0);
    }

    toString()
    { return `${this.hour}:${String(this.minute).padStart(2, '0')} ${this.ampm}` }
    
    valueOf()
    { return this.totalSecs }
}
//alternate Time constructor
export function TimeFromSecs(totalSecs)
{
    let hour = totalSecs / 3600;
    let ampm = hour >= 12 ? "PM" : "AM";
    hour = (hour % 12) || 12;
    let minute = (totalSecs % 3600) / 60;
    return new Time(hour, minute, ampm, totalSecs);
}


//start Time and end Time within a day, ex: 9:00 AM - 5:00 PM
export class TimePeriod
{
    constructor(start, end)
    {
        this.start = start;
        this.end = end;
        if(start > end)
        {
            this.start = end;
            this.end = start;
        }
        this.length = this.end - this.start;
    }

    toString()
    { return String(this.start) + " - " + String(this.end) }
    
    valueOf()
    { return this.length }
}


//gets the current amount of seconds since the start of the current day
export function SecsSinceMidnight()
{
    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return (now - today) / 1000;
}