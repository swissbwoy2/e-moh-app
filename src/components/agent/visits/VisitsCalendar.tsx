import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar, DateLocalizer, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import frCH from 'date-fns/locale/fr-CH';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface Visit {
  id: string;
  propertyAddress: string;
  clientName: string;
  datetime: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

interface CalendarEvent extends Visit {
  title: string;
  start: Date;
  end: Date;
}

const locales = {
  'fr-CH': frCH,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const VisitsCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchVisits = async () => {
      if (!user) return;

      try {
        const visitsQuery = query(
          collection(db, 'visits'),
          where('agentId', '==', user.uid)
        );
        const snapshot = await getDocs(visitsQuery);
        const visitsData = snapshot.docs.map(doc => {
          const data = doc.data() as Visit;
          const datetime = data.datetime.toDate();
          return {
            id: doc.id,
            title: `Visite - ${data.propertyAddress}`,
            start: datetime,
            end: new Date(datetime.getTime() + 3600000), // +1 hour
            propertyAddress: data.propertyAddress,
            clientName: data.clientName,
            datetime: datetime,
            status: data.status,
          };
        });
        setEvents(visitsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des visites:', error);
      }
    };

    fetchVisits();
  }, [user]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const updateVisitStatus = async (status: Visit['status']) => {
    if (!selectedEvent) return;

    try {
      await updateDoc(doc(db, 'visits', selectedEvent.id), {
        status: status
      });

      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, status: status }
          : event
      ));

      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la visite:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">
          Please login to view calendar
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 100px)' }}
        onSelectEvent={handleSelectEvent}
        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour"
        }}
      />

      {/* Visit details modal */}
      {showModal && selectedEvent && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
            <div className="relative bg-white rounded-lg p-8 max-w-lg w-full">
              <h3 className="text-lg font-medium mb-4">
                Détails de la visite
              </h3>
              <div className="space-y-4">
                <p><strong>Adresse:</strong> {selectedEvent.propertyAddress}</p>
                <p><strong>Client:</strong> {selectedEvent.clientName}</p>
                <p><strong>Date:</strong> {format(selectedEvent.start, 'Pp', { locale: frCH })}</p>
                <p>
                  <strong>Statut:</strong>{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedEvent.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : selectedEvent.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEvent.status === 'completed'
                      ? 'Effectuée'
                      : selectedEvent.status === 'cancelled'
                      ? 'Annulée'
                      : 'En attente'}
                  </span>
                </p>
                
                <div className="flex space-x-4">
                  {selectedEvent.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateVisitStatus('completed')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        Marquer comme effectuée
                      </button>
                      <button
                        onClick={() => updateVisitStatus('cancelled')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                      >
                        Annuler
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
