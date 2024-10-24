import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import frCH from 'date-fns/locale/fr-CH';

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
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
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
        const visitsData = snapshot.docs.map(doc => ({
          id: doc.id,
          title: `Visite - ${doc.data().propertyAddress}`,
          start: doc.data().datetime.toDate(),
          end: new Date(doc.data().datetime.toDate().getTime() + 3600000), // +1 heure
          ...doc.data()
        }));
        setEvents(visitsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des visites:', error);
      }
    };

    fetchVisits();
  }, [user]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const updateVisitStatus = async (status) => {
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

      {/* Modal de détails de visite */}
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
                <p><strong>Statut:</strong> {selectedEvent.status}</p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => updateVisitStatus('COMPLETED')}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Marquer comme effectuée
                  </button>
                  <button
                    onClick={() => updateVisitStatus('CANCELLED')}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
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

export default VisitsCalendar;
