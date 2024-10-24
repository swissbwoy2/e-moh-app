'use client';

interface DocumentStatusProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800'
};

export default function DocumentStatus({ status }: DocumentStatusProps) {
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
      {status}
    </span>
  );
}
