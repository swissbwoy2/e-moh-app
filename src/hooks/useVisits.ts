import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Visit } from '../types';

export const useVisits = (userId: string, role: 'agent' | 'client') => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const visitsRef = collection(db, 'visits');
      const visitsQuery = query(
        visitsRef,
        where(role === 'agent' ? 'agentId' : 'clientId', '==', userId),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(visitsQuery, (snapshot) => {
        const visitsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Visit[];

        setVisits(visitsList);
        setLoading(false);
      }, (err) => {
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [userId, role]);

  const scheduleVisit = async (visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const visitsRef = collection(db, 'visits');
      await addDoc(visitsRef, {
        ...visit,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'scheduled'
      });
    } catch (err: any) {
      throw new Error(`Failed to schedule visit: ${err.message}`);
    }
  };

  const updateVisitStatus = async (visitId: string, status: Visit['status']) => {
    try {
      const visitRef = doc(db, 'visits', visitId);
      await updateDoc(visitRef, {
        status,
        updatedAt: new Date()
      });
    } catch (err: any) {
      throw new Error(`Failed to update visit status: ${err.message}`);
    }
  };

  const addVisitNotes = async (visitId: string, notes: string) => {
    try {
      const visitRef = doc(db, 'visits', visitId);
      await updateDoc(visitRef, {
        notes,
        updatedAt: new Date()
      });
    } catch (err: any) {
      throw new Error(`Failed to add visit notes: ${err.message}`);
    }
  };

  return {
    visits,
    loading,
    error,
    scheduleVisit,
    updateVisitStatus,
    addVisitNotes
  };
};
