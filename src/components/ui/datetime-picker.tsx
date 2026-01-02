
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface DateTimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    disabled?: boolean;
}

export function DateTimePicker({ date, setDate, disabled }: DateTimePickerProps) {
    const [year, setYear] = useState<number | undefined>(date?.getFullYear());
    const [month, setMonth] = useState<number | undefined>(date?.getMonth());
    const [day, setDay] = useState<number | undefined>(date?.getDate());
    const [hour, setHour] = useState<number | undefined>(date ? date.getHours() % 12 || 12 : undefined);
    const [minute, setMinute] = useState<number | undefined>(date?.getMinutes());
    const [amPm, setAmPm] = useState<string | undefined>(date && date.getHours() >= 12 ? "pm" : "am");

    // This effect SYNCS the external `date` prop TO the internal state
    useEffect(() => {
        if (date) {
            setYear(date.getFullYear());
            setMonth(date.getMonth());
            setDay(date.getDate());
            const hours24 = date.getHours();
            setAmPm(hours24 >= 12 ? 'pm' : 'am');
            setHour(hours24 % 12 || 12);
            setMinute(date.getMinutes());
        } else {
            setYear(undefined);
            setMonth(undefined);
            setDay(undefined);
            setHour(undefined);
            setMinute(undefined);
            setAmPm(undefined);
        }
    }, [date]);


    // This function handles user interaction and updates the parent state
    const handleValueChange = (part: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'amPm', value: string | number) => {
        let newYear = part === 'year' ? Number(value) : year;
        let newMonth = part === 'month' ? Number(value) : month;
        let newDay = part === 'day' ? Number(value) : day;
        let newHour = part === 'hour' ? Number(value) : hour;
        let newMinute = part === 'minute' ? Number(value) : minute;
        let newAmPm = part === 'amPm' ? String(value) : amPm;
        
        // Update local state immediately for responsiveness
        if (part === 'year') setYear(Number(value));
        if (part === 'month') setMonth(Number(value));
        if (part === 'day') setDay(Number(value));
        if (part === 'hour') setHour(Number(value));
        if (part === 'minute') setMinute(Number(value));
        if (part === 'amPm') setAmPm(String(value));


        if (newYear !== undefined && newMonth !== undefined && newDay !== undefined && newHour !== undefined && newMinute !== undefined && newAmPm !== undefined) {
             let fullHour = newHour;
            if (newAmPm === "pm" && newHour < 12) {
                fullHour = newHour + 12;
            } else if (newAmPm === "am" && newHour === 12) {
                fullHour = 0;
            }
            const newDate = new Date(newYear, newMonth, newDay, fullHour, newMinute);
            setDate(newDate);
        } else {
            setDate(undefined);
        }
    }


    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: new Date(0, i).toLocaleString('default', { month: 'long' }),
    }));
    const daysInMonth = (year !== undefined && month !== undefined) ? new Date(year, month + 1, 0).getDate() : 31;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-2", disabled && "opacity-50")}>
            {/* Year */}
            <Select
                value={year?.toString()}
                onValueChange={(value) => handleValueChange('year', value)}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
            </Select>

            {/* Month */}
            <Select
                value={month?.toString()}
                onValueChange={(value) => handleValueChange('month', value)}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                </SelectContent>
            </Select>
            
            {/* Day */}
            <Select
                value={day?.toString()}
                onValueChange={(value) => handleValueChange('day', value)}
                disabled={disabled || year === undefined || month === undefined}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                    {days.map(d => <SelectItem key={d} value={d.toString()}>{d}</SelectItem>)}
                </SelectContent>
            </Select>

            {/* Hour */}
            <Select
                value={hour?.toString()}
                onValueChange={(value) => handleValueChange('hour', value)}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                    {hours.map(h => <SelectItem key={h} value={h.toString()}>{h}</SelectItem>)}
                </SelectContent>
            </Select>

            {/* Minute */}
             <Select
                value={minute?.toString()}
                onValueChange={(value) => handleValueChange('minute', value)}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                    {minutes.map(m => <SelectItem key={m} value={m.toString()}>{m.toString().padStart(2, '0')}</SelectItem>)}
                </SelectContent>
            </Select>

            {/* AM/PM */}
            <Select value={amPm} onValueChange={(value) => handleValueChange('amPm', value)} disabled={disabled}>
                <SelectTrigger>
                    <SelectValue placeholder="AM/PM"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="am">AM</SelectItem>
                    <SelectItem value="pm">PM</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
