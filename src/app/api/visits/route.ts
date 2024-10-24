import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { propertyId, clientId, preferredDate } = await request.json();

    // Validate the client exists and is authorized
    const clientDoc = await getDoc(doc(db, 'users', clientId));
    if (!clientDoc.exists()) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const userData = clientDoc.data();
    if (!userData.subscriptionStatus || userData.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Subscription required to schedule visits' },
        { status: 403 }
      );
    }

    // Get assigned agent
    const assignmentsQuery = query(
      collection(db, 'agent-assignments'),
      where('clientId', '==', clientId)
    );
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    
    if (assignmentsSnapshot.empty) {
      return NextResponse.json(
        { error: 'No agent assigned to client' },
        { status: 400 }
      );
    }

    const agentId = assignmentsSnapshot.docs[0].data().agentId;

    // Create visit document
    const visitDoc = await addDoc(collection(db, 'visits'), {
      propertyId,
      clientId,
      agentId,
      status: 'pending',
      preferredDate: preferredDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create notification for agent
    await addDoc(collection(db, 'notifications'), {
      userId: agentId,
      type: 'visit',
      title: 'New Visit Request',
      content: `A client has requested to visit a property`,
      read: false,
      createdAt: new Date(),
      data: {
        visitId: visitDoc.id,
        propertyId,
      },
    });

    return NextResponse.json({
      id: visitDoc.id,
      status: 'pending',
    });
  } catch (error: any) {
    console.error('Error scheduling visit:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { visitId, status, date, notes } = await request.json();

    // Update visit status
    const visitRef = doc(db, 'visits', visitId);
    const visitDoc = await getDoc(visitRef);

    if (!visitDoc.exists()) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    const visitData = visitDoc.data();

    await visitDoc.ref.update({
      status,
      date: date || visitData.date,
      notes: notes || visitData.notes,
      updatedAt: new Date(),
    });

    // Create notification for client
    await addDoc(collection(db, 'notifications'), {
      userId: visitData.clientId,
      type: 'visit',
      title: 'Visit Status Updated',
      content: `Your visit request has been ${status}`,
      read: false,
      createdAt: new Date(),
      data: {
        visitId,
        status,
      },
    });

    return NextResponse.json({
      status: 'updated',
    });
  } catch (error: any) {
    console.error('Error updating visit:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}