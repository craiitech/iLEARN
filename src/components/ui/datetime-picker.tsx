
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

     useEffect(() => {
        // Sync internal state with external prop change
        setYear(date?.getFullYear());
        setMonth(date?.getMonth());
        setDay(date?.getDate());
        const dateHour = date ? date.getHours() : undefined;
        setHour(dateHour !== undefined ? dateHour % 12 || 12 : undefined);
        setMinute(date?.getMinutes());
        setAmPm(dateHour !== undefined && dateHour >= 12 ? "pm" : "am");
    }, [date]);


    useEffect(() => {
        if (year !== undefined && month !== undefined && day !== undefined && hour !== undefined && minute !== undefined && amPm !== undefined) {
            let fullHour = hour;
            if (amPm === "pm" && hour < 12) {
                fullHour = hour + 12;
            } else if (amPm === "am" && hour === 12) {
                fullHour = 0;
            }
            const newDate = new Date(year, month, day, fullHour, minute);

            // Prevent infinite loop by checking if date is different
            if (date?.getTime() !== newDate.getTime()) {
                setDate(newDate);
            }
        } else if (date !== undefined) {
            // If date is defined but internal state is not, clear external state
            setDate(undefined);
        }
    }, [year, month, day, hour, minute, amPm, setDate, date]);

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
                onValueChange={(value) => setYear(parseInt(value))}
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
                onValueChange={(value) => setMonth(parseInt(value))}
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
                onValueChange={(value) => setDay(parseInt(value))}
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
                onValueChange={(value) => setHour(parseInt(value))}
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
                onValueChange={(value) => {
                    const newMinute = parseInt(value);
                    setMinute(newMinute);
                }}
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
            <Select value={amPm} onValueChange={setAmPm} disabled={disabled}>
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
