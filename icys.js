class IcyS {
    /**
     * Create a new ICS instance
     * @param {string} data - a string containing the contents of an ics file
     * @param {boolean} parse - should the file be parsed immediately or no?
     */
    constructor(data, parse){
        if(!window.moment || typeof window.moment !== 'function'){
            this.useMoment = false;
            console.warn('MomentJS not installed. Some features may not be available.')
        }else{
            this.useMoment = true;
        }
    
        this.days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        this.events = {
            all: [],
            recurring: [],
            oneTime: [],
            past: [],
            upcoming: [],
            today: [],
            happening: []
        }
        this.data = data;
        
        if(parse === true){
            this.parse()
        }
    }

    /**
     * Convert a date to a timestamp
     * @param {string} datestring - a string containing a valid date
     * @returns integer (timestamp)
     */
    _getTimestampFromString(datestring){
        if(this.useMoment === true){
            return parseInt(moment(datestring).format('x'))
        }else{
            const d = this._parseDate(datestring);
            return d.getTime();
        }
    }

    /**
     * Convert a date to the proper format
     * @param {string} datestring - a string containing a valid date
     * @returns string (date in YYYY-MM-DD format)
     */
    _getDateFromString(datestring){
        if(this.useMoment === true){
            return (moment(datestring).format('YYYY-MM-DD'))
        }else{
            const d = this._parseDate(datestring);
            const m = d.getMonth() + 1 < 10? '0' + (d.getMonth() + 1): d.getMonth() + 1;
            const dt = d.getDate() < 10? '0' + d.getDate(): d.getDate();
            return d.getFullYear() + '-' + m + '-' + dt;
        }
    }

    /**
     * Get the time from a full date/time string
     * @param {string} datestring - a string containing a valid datetime
     * @returns string (in HH:MM format)
     */
    _getTimeFromString(datestring){
        if(this.useMoment === true){
            return (moment(datestring).format('h:mma'))
        }else{
            const d = this._parseDate(datestring);
            const h = d.getHours() < 10? '0' + (d.getHours()): d.getHours();
            const m = d.getMinutes() < 10? '0' + d.getMinutes(): d.getMinutes();
            return h + ':' + m;
        }
    }

    /**
     * Convert a complex date/time string into a Date object
     * @param {string} datestring - a string containing a valid date
     * @returns Date
     */
    _parseDate(datestring){
        let year, month, day, hours = 0, minutes = 0, offset = 0;

        if(!datestring || typeof datestring !== 'string'){
            throw new Error('Cannot parse date string -- not a valid type');
        }
        if(datestring.indexOf('T') > -1 && datestring.indexOf('Z') === datestring.length - 1){
            const parts = datestring.match(/(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z/);
            year = parts[1];
            month = parseInt(parts[2]);
            day = parseInt(parts[3]);
            hours = parseInt(parts[4]);
            minutes = parseInt(parts[5]);
            offset = parseInt(parts[6]);
        }else if(datestring.indexOf('T') > -1){
            const parts = datestring.match(/(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)/);
            year = parts[1];
            month = parseInt(parts[2]);
            day = parseInt(parts[3]);
            hours = parseInt(parts[4]);
            minutes = parseInt(parts[5]);
            offset = parseInt(parts[6]);
        }else if(datestring.match(/^\d{8}$/)){
            const parts = datestring.match(/(\d{4})(\d\d)(\d\d)/);
            year = parts[1];
            month = parseInt(parts[2]);
            day = parseInt(parts[3]);
        }

        const d = new Date();
        d.setFullYear(year);
        d.setMonth(month - 1);
        d.setDate(day);
        d.setHours(hours); //todo
        d.setMinutes(minutes);
        d.setSeconds(0);
        d.setMilliseconds(0);

        return d;
    }

    /**
     * Given a day of the week and a number, returns the full date object for 
     * that Nth DOW of the current Month. Ex: the 3rd Tuesday of the month
     * @param {string} day - one of SU, MO, TU, WE, TH, FR, SA
     * @param {integer} number - which day of the week of the month
     * @returns Date
     */
    _getNthDayOfMonth(day, number){
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const firstDayDate = new Date();
        firstDayDate.setFullYear(thisYear);
        firstDayDate.setMonth(thisMonth);
        firstDayDate.setDate(1);
        const firstDay = firstDayDate.getDay(); 
        const want = this.days.indexOf(day);
        const diff = firstDay - want;
        let forwardDays;

        if(diff < 0){
            forwardDays = Math.abs(diff);
        }else if(diff === 0){
            forwardDays = 0;
        }else{
            forwardDays = (7 - diff);
        }

        const firstDate = new Date();
        firstDate.setMonth(thisMonth);
        firstDate.setFullYear(thisYear);
        firstDate.setDate(forwardDays + 1);
        if(number === 1){
            return firstDate;
        }else{
            const addDays = (number - 1) * 7;
            const nextDate = new Date();
            nextDate.setFullYear(thisYear);
            nextDate.setMonth(thisMonth);
            nextDate.setDate(firstDate.getDate() + addDays);
            return nextDate
        }
    }

    /**
     * Given a date, returns whether that date is today
     * @param {string|number|Date} date - a string containing a valid date, a number containing a valid timestamp, or a complete Date object
     * @returns boolean
     */
    _isDateToday(date){
        const now = new Date();
        date = (date instanceof Date)? date: new Date(date);
        
        return (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate())
    }

    /**
     * Calculates the number of days between two dates (always returns positive)
     * @param {string|number|Date} a - a string containing a valid date, a number containing a valid timestamp, or a complete Date object
     * @param {string|number|Date} b - a string containing a valid date, a number containing a valid timestamp, or a complete Date object
     * @returns number
     */
    daysBetween(a, b){
        const day = 24 * 60 * 60 * 1000;
        a = (a instanceof Date)? new Date(a.getTime()): new Date(a);
        b = (b instanceof Date)? new Date(b.getTime()): new Date(b);

        a.setHours(0);
        a.setMinutes(0);
        a.setSeconds(0);
        a.setMilliseconds(0);
        b.setHours(0);
        b.setMinutes(0);
        b.setSeconds(0);
        b.setMilliseconds(0);

        const diff = Math.abs(a.getTime() - b.getTime());
        return diff / day;
    }

    /**
     * Sorts the given array of IcyEvents by start time in ascending order
     * @param {IcyEvent[]} events - the events to sort
     * @returns array
     */
    sortEvents(events){
        events.sort((a, b) => {
            const aStart = new Date(a.start.timestamp)
            const bStart = new Date(b.start.timestamp)
            if(aStart.getHours() < bStart.getHours()){
                return -1
            }else if(aStart.getHours() > bStart.getHours()){
                return 1
            }else{
                if(aStart.getMinutes() < bStart.getMinutes()){
                    return -1
                }else if(aStart.getMinutes() > bStart.getMinutes()){
                    return 1
                }else{
                    return 0
                }
            }
        })

        return events
    }

    /**
     * Big daddy ICS file parser
     */
    parse(){
        let events = [];
        let upcomingEvents = [];
        let pastEvents = [];
        let happeningEvents = [];
        let todayEvents = [];
        let repeatEvents = [];
        let onetimeEvents = [];
        const now = (new Date).getTime();

        let ical = this.data.match(/BEGIN:VEVENT(.*?)END:VEVENT/gms);

        ical.forEach((event) => {
            let yearly = false;
            let newEvent = new IcyEvent({ics: this, data: event});
            if(event.indexOf('RRULE') > -1){
                let hasInterval = true;
                let r = event.match(/RRULE\:FREQ=(\w+);UNTIL=(.+?);INTERVAL=(\d);/ms);
                if(!r){
                    r = event.match(/RRULE\:FREQ=(\w+);UNTIL=(.+?)[;\r]/ms);
                    hasInterval = false;
                }
                if(r && r[1]){
                    newEvent.repeat = {
                        frequency: r[1],
                        until: this._getTimestampFromString(r[2]),
                        interval: hasInterval? parseInt(r[3]): null,
                    }

                    switch(r[1]){
                        case 'WEEKLY':
                            const war = event.match(/;BYDAY=(.+?)[;\r]/ms);
                            if(war){
                                newEvent.repeat.days = war[1].split(',')
                            }else{
                                newEvent.repeat.days = ['SU'];
                            }
                            break;
                        case 'MONTHLY':
                            const mar = event.match(/;BYDAY=(.+?)[;\r]/ms);
                            if(mar){
                                newEvent.repeat.days = mar[1].split(',');
                            }
                            break;
                        case 'YEARLY':
                            yearly = true;
                            break;
                    }
                }
            }

            let summary = event.match(/SUMMARY\:(.+?)[\r\n]/ms)[1];
            newEvent.summary = summary;

            let start = event.match(/DTSTART\;TZID=(.+?)\:(.+?)[\r\n]/ms);
            let stz, dtstart;
            if(!start || start.length === 0){
                start = event.match(/DTSTART\;(.+?)[\r\n]/ms);
                if(!start || start.length === 0){
                    start = event.match(/DTSTART\:(.+?)[\r\n]/ms)
                }
                stz = undefined;
                dtstart = start[1].replace('VALUE=DATE:', '');
            }else{
                stz = start[1];
                dtstart = start[2];
            }
            newEvent.start = {
                tz: stz,
                timestamp: this._getTimestampFromString(dtstart),
                date: this._getDateFromString(dtstart),
                time: this._getTimeFromString(dtstart)
            }

            if(yearly){
                newEvent.repeat.month = (new Date(newEvent.start.timestamp)).getMonth();
                newEvent.repeat.humanMonth = (new Date(newEvent.start.timestamp)).getMonth() + 1;
                newEvent.repeat.date = (new Date(newEvent.start.timestamp)).getDate();
            }

            let end = event.match(/DTEND\;TZID=(.+?)\:(.+?)[\r\n]/ms);
            let etz, dtend;
            if(!end || end.length === 0){
                end = event.match(/DTEND\;(.+?)[\r\n]/ms);
                if(!end){
                    end = event.match(/DTEND\:(.+?)[\r\n]/ms);
                    if(!end){
                        end = [];
                    }
                }
                etz = undefined;
                dtend = end[1]? end[1].replace('VALUE=DATE:', ''): {};
            }else{
                etz = end[1];
                dtend = end[2];
            }
            newEvent.end = {
                tz: etz,
                timestamp: this._getTimestampFromString(dtend),
                date: this._getDateFromString(dtend),
                time: this._getTimeFromString(dtend)
            }

            const lines = event.match(/(.+?)\:(.+?)[\r\n]/gms);
            const ignore = ['BEGIN', 'RRULE', 'DTSTART', 'DTEND', 'SUMMARY'];
            lines.forEach(line => {
                const parts = line.match(/(.+?)\:(.+?)?[\r\n]/m);
                if(!ignore.includes(parts[1]) && parts[1].indexOf('DTSTART') === -1 && parts[1].indexOf('DTEND') === -1){
                    if(parts[2] && parts[2] == parseInt(parts[2])){
                        parts[2] = parseInt(parts[2]);
                    }
                    if(parts[2] && parts[2] === 'FALSE'){
                        parts[2] = false;
                    }
                    if(parts[2] && parts[2] === 'TRUE'){
                        parts[2] = true;
                    }

                    newEvent[parts[1].toLowerCase()] = parts[2];
                }
            })

            events.push(newEvent);

            if(newEvent.start.timestamp < now && newEvent.end.timestamp > now){
                happeningEvents.push(newEvent);
            }else if(newEvent.end.timestamp < now){
                pastEvents.push(newEvent);
            }else if(newEvent.start.timestamp > now){
                upcomingEvents.push(newEvent);
            }

            if(newEvent.isToday()){
                todayEvents.push(newEvent);
            }

            if(newEvent.repeats){
                repeatEvents.push(newEvent);
            }else{
                onetimeEvents.push(newEvent);
            }
        })

        this.events.all = this.sortEvents(events);
        this.events.happening = this.sortEvents(happeningEvents);
        this.events.past = this.sortEvents(pastEvents);
        this.events.upcoming = this.sortEvents(upcomingEvents);
        this.events.today = this.sortEvents(todayEvents);
        this.events.recurring = this.sortEvents(repeatEvents);
        this.events.oneTime = this.sortEvents(onetimeEvents);
    }
}

class IcyEvent {
    /**
     * Creates a new event
     * @param {object} data - initial data for the event
     */
    constructor(data){
        if(data){
            Object.keys(data).forEach((key) => {
                this[key] = data[key]
            }) 
        }else{
            this.start = {};
            this.end = {};
            this.summary = null;
        }
    }

    /**
     * Determines whether the event is occurring today or not
     * @returns boolean
     */
    isToday(){
        const now = new Date();
        let result = false;


        if(this.ics._isDateToday(this.start.timestamp)){
            result = true;
        }

        if(this.repeat && this.repeat.until > now.getTime() && this.start.timestamp <= now.getTime()){
            if(this.repeat.frequency === 'WEEKLY'){
                this.repeat.days.forEach((day) => {
                    if(this.ics.days.indexOf(day) === now.getDay()){
                        result = true
                    }
                })
            }else if(this.repeat.frequency === 'MONTHLY'){
                if(this.repeat.days){
                    this.repeat.days.forEach((day) => {
                        const num = parseInt(day.substr(0, 1));
                        const dow = day.substr(1);
                        const nthday = this.ics._getNthDayOfMonth(dow, num);
                        if(this.ics._isDateToday(nthday)){
                            result = true
                        }
                    })
                }else{
                    if(this.repeat.interval && this.repeat.interval !== 1){
                        const start = new Date(this.start.timestamp);
                        const startYear = start.getFullYear();
                        const startMonth = start.getMonth();
                        const startDate = start.getDate();
                        const thisYear = now.getFullYear();
                        const thisMonth = now.getMonth();
                        const thisDate = now.getDate();

                        if(thisDate !== startDate){
                            return false;
                        }else{
                            const yearDiff = thisYear - startYear;
                            const yearDiffMonths = yearDiff * 12;
                            const monthDiff = thisMonth - startMonth;
                            const monthsSince = yearDiffMonths + monthDiff;
                            const intervalsPassed = Math.floor(monthsSince / this.repeat.interval);
                            const monthsNeeded = intervalsPassed * this.repeat.interval;

                            if(monthsNeeded === monthsSince){
                                return true;
                            }
                        }
                    }else{
                        const start = new Date(this.start.timestamp);
                        const startDate = start.getDate();
                        const thisDate = now.getDate();

                        return thisDate === startDate;
                    }
                }
            }else if(this.repeat.frequency === 'YEARLY'){
                if(now.getMonth() === this.repeat.month && now.getDate() === this.repeat.date){
                    result = true;
                }
            }
        }

        return result
    }

    /**
     * Determines whether the event has already happened or not
     * @returns boolean
     */
    happened(){
        const day = 24 * 60 * 60 * 1000;
        const now = new Date();
        const end = new Date(this.end.timestamp);
        const daysBetween = this.ics.daysBetween(this.start.timestamp, end);
        const newStart = new Date(now.getTime() + (daysBetween * day));

        console.log(this, this.end, now, end, daysBetween, newStart)

        if(this.repeat){
            end.setFullYear(newStart.getFullYear());
            end.setMonth(newStart.getMonth());
            end.setDate(newStart.getDate());
        }

        return end.getTime() < now.getTime()
    }

    /**
     * Determines if the event is happening at this moment
     * @returns boolean
     */
    happening(){
        const day = 24 * 60 * 60 * 1000;
        const now = new Date();
        const end = new Date(this.end.timestamp);
        const start = new Date(this.start.timestamp);
        const daysBetween = this.ics.daysBetween(this.start.timestamp, end);
        const newEnd = new Date(now.getTime() + (daysBetween * day));

        if(this.start.timestamp < now.getTime() && this.end.timestamp > now.getTime()){
            return true;
        }

        if(this.repeats && this.isToday()){
            end.setFullYear(newEnd.getFullYear());
            end.setMonth(newEnd.getMonth());
            end.setDate(newEnd.getDate());
            start.setFullYear(now.getFullYear());
            start.setMonth(now.getMonth());
            start.setDate(now.getDate());

            return start.getTime() < now.getTime() && end.getTime() > now.getTime()
        }

        return false;
    }

    /**
     * Determines if the event is recurring
     * @returns boolean
     */
    get repeats(){
        return this.repeat !== undefined && this.repeat !== null
    }
}