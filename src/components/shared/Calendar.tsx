'use client';

import { Fragment, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'visit' | 'meeting' | 'deadline';
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface CalendarProps {
  events: Event[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Calendar({ events, onDateSelect, onEventClick }: CalendarProps) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  const previousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    onDateSelect(day);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-soft">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={previousMonth}
            className="p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, dayIdx) => {
          const dayEvents = events.filter(
            (event) => format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          );

          return (
            <div
              key={day.toString()}
              className={classNames(
                'aspect-square p-1',
                dayIdx === 0 && colStartClasses[getDay(day)],
                'relative'
              )}
            >
              <button
                onClick={() => handleDayClick(day)}
                className={classNames(
                  'w-full h-full flex flex-col items-center justify-center rounded-lg',
                  isEqual(day, selectedDay) && 'bg-primary-100',
                  isToday(day) && 'border-2 border-primary-500',
                  !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && 'hover:bg-gray-100',
                  !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && 'text-gray-400',
                  'transition-colors'
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')} className="text-sm">
                  {format(day, 'd')}
                </time>
                {dayEvents.length > 0 && (
                  <div className="flex -space-x-1 mt-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={classNames(
                          'w-2 h-2 rounded-full',
                          event.status === 'confirmed' && 'bg-green-500',
                          event.status === 'pending' && 'bg-yellow-500',
                          event.status === 'cancelled' && 'bg-red-500'
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Liste des événements du jour sélectionné */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-900">
          Événements du {format(selectedDay, 'dd MMMM yyyy', { locale: fr })}
        </h3>
        <div className="mt-2 space-y-2">
          {events
            .filter((event) => format(event.date, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd'))
            .map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className={classNames(
                  'p-3 rounded-lg cursor-pointer transition-colors',
                  event.status === 'confirmed' && 'bg-green-50 hover:bg-green-100',
                  event.status === 'pending' && 'bg-yellow-50 hover:bg-yellow-100',
                  event.status === 'cancelled' && 'bg-red-50 hover:bg-red-100'
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <span
                    className={classNames(
                      'text-xs px-2 py-1 rounded-full',
                      event.status === 'confirmed' && 'bg-green-100 text-green-800',
                      event.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                      event.status === 'cancelled' && 'bg-red-100 text-red-800'
                    )}
                  >
                    {event.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {format(event.date, 'HH:mm')}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const colStartClasses = [
  '',
  'col-start-1',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];

export type { Event };
