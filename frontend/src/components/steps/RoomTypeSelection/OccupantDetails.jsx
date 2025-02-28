import React, { useState } from 'react';
import useStore from '../../../state/store';
import Button from '../../shared/Button';

const OccupantDetails = () => {
  const { floorPlan, addOccupant, removeOccupant } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    gender: '',
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    addOccupant({
      ...formData,
      primary: floorPlan.occupants.length === 0,
    });
    setFormData({
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      gender: '',
    });
    setShowForm(false);
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Occupant Details (Optional)</h3>
        <Button 
          variant="secondary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Occupant'}
        </Button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Adding occupant details allows for personalized Feng Shui calculations based on Kua number.
      </p>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Birth Year</label>
              <input
                type="number"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                placeholder="YYYY"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Birth Month</label>
              <select
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Birth Day</label>
              <input
                type="number"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
                placeholder="DD"
                min="1"
                max="31"
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Gender</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  className="mr-2"
                  required
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Female
              </label>
            </div>
          </div>
          
          <Button type="submit">Add Occupant</Button>
        </form>
      )}
      
      {floorPlan.occupants.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Added Occupants:</h4>
          <ul className="space-y-2">
            {floorPlan.occupants.map((occupant, index) => (
              <li key={index} className="flex justify-between items-center border p-3 rounded">
                <div>
                  <span className="font-medium">
                    {occupant.primary ? 'Primary Occupant' : `Occupant ${index + 1}`}
                  </span>
                  <p className="text-sm text-gray-600">
                    {`${occupant.birthMonth}/${occupant.birthDay}/${occupant.birthYear} - ${
                      occupant.gender.charAt(0).toUpperCase() + occupant.gender.slice(1)
                    }`}
                  </p>
                </div>
                <Button variant="danger" onClick={() => removeOccupant(index)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          {floorPlan.occupants.length === 0 && (
            <p className="italic text-gray-500 mt-2">
              Your layout will be based on general feng shui principles instead of personalized luck.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OccupantDetails;