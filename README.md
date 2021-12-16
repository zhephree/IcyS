# 🧊 IcyS
I couldn't find any actively maintained JavaScript-based libraries that would parse an .ics file, so I made one. No required dependencies (MomentJS is optional). Vanilla JS, so it'll work anywhere probably.

The ICS format is sort of standardized, but companies like Google and Microsoft and Apple like to add their own bits to the format, so some things might break. I did little to nothing to prevent this.

This will take the raw ICS file and parse out known fields and clean them up, and any unknown fields it'll just pass along back to you in the resulting array of objects so you can deal with them.

## Limitations
This does not handle multi-line fields like `DESCRIPTION` at all. It will eventually, but it doesn't right right now.

Because each file can be formatted differently depending on the source, it might not work 100% correctly with your file. IcyS should silently ignore things that confuse it, but it may just give up.

Canceled events will still appear, unless they are deleted from the source calendar.

## Usage
You'll need to read in your .ics file on your own, either from the file system or by `fetch`ing it from a server.

### Instantiate the class:

`const icy = new IcyS(data, true)`

The second parameter determines whether the data is parsed immediately. `false` will just load in the data, but not parse it until you call the `parse()` method.

### Methods
#### parse()
Takes the raw file and generates several arrays of `IcyEvent`s available on the `IcyS.events` property

#### sortEvents(array: events)
Given an array of IcyEvents, this will return a copy of that array with the IcyEvents sorted in ascending order by start time.

#### daysBetween(a, b)
Calculates the number of days between two dates. Dates can be given as a string, an integer timestamp, or a Date object

### Properties
#### data (string)
The raw string of the original .ics file you provided

#### useMoment (boolean)
If `true`, MomentJS was detected

#### days (array)
The list of abbreviations the .ics file uses for the days of the week, in order.

#### events (object)
Maintains all of the parsed events, as well as some special sorted arrays.

##### events.all (array: IcyEvent)
All events detected, in the order in which they were read from the file

##### events.recurring (array: IcyEvent)
All events that repeat. Can be weekly, monthly, or yearly.

##### events.oneTime (array: IcyEvent)
All events that do *not* repeat

##### events.past (array: IcyEvent)
All events that have already happened at the time of parsing

##### events.upcoming (array: IcyEvent)
All events that have not yet happened at the time of parsing

##### events.happening (array: IcyEvent)
All events that are occurring at the time of parsing (start time is before now, and end time is after now)

##### events.today (array: IcyEvent)
All events that are happening on the current date

## IcyEvent
### Methods
#### isToday()
Returns `true` if the event's start time is on today, or the start time is before today and the end time is on today

#### happened()
Returns `true` if the event's start time and end time are before the current time

#### happening()
Returns `true` if the event's start time is before the current time but the end time is after the current time

### Properties
#### repeats (boolean)
If `true`, the event is recurring

#### data (string)
The raw string that defined the event in the .ics file

#### start (object)
The start information. 
```
date: string,
time: string,
timestamp: number,
tz: string
```

#### end (object)
The end information. 
```
date: string,
time: string,
timestamp: number,
tz: string
```

#### summary (string)
The title of the event

#### others....
All other properties from the event are parsed as strings, unless they are numbery or booleany, then they are parsed as such. For example, `PRIORITY: 5` would parse the 5 as a number, and `X-MICROSOFT-DONOTFORWARDMEETING: FALSE` would parse the FALSE as a boolean `false`.

All fields are returned as all lowercase, with any dashes intact.