import React from 'react';

interface PrescriptionCardProps {
  name: string;
  id: string;
  section: string;
  prescriptions: Array<{
    medication: string;
    dosage: string;
    time: string;
  }>;
}

const PrescriptionCard = ({ name, id, section, prescriptions }: PrescriptionCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{name}</h2>
          <p className="text-sm text-gray-500">ID: {id}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Active</span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2 underline">{section} Prescriptions</h3>
        <ul className="space-y-2">
          {prescriptions.map((item, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <div>
                <p className="font-medium text-gray-900">{item.medication}</p>
                <p className="text-xs text-gray-500">{item.dosage}</p>
              </div>
              <p className="text-xs font-semibold text-blue-600">{item.time}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PrescriptionCard;