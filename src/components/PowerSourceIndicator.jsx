// Create a new file: components/PowerSourceIndicator.jsx
import { Circle } from 'lucide-react';

export const PowerSourceIndicator = ({ isActive, label }) => {
  return (
    <div className="flex items-center gap-3">
      <Circle 
        className={`w-6 h-6 ${isActive ? 'text-green-500 fill-green-500' : 'text-red-500 fill-red-500'}`} 
      />
      <span className="text-white font-medium">{label}</span>
    </div>
  );
};