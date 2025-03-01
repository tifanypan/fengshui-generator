// src/components/steps/PaymentPage/index.jsx
import React, { useState } from 'react';
import Button from '../../shared/Button';
import useStore from '../../../state/store';

const PaymentPage = ({ onNext, onBack }) => {
  const { payment, setPaymentOption, setLifeGoal } = useStore();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    // Simple validation
    if (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim() || !nameOnCard.trim()) {
      setError('All fields are required');
      return;
    }
    
    // Mock payment processing
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onNext(); // Proceed to results page
    }, 1500);
  };

  const calculateTotalPrice = () => {
    let total = 0;
    if (payment.baseLayout) total += 12;
    if (payment.lifeGoalOptimization) total += 5;
    if (payment.editProtection) total += 3;
    return total;
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Step 5: Payment</h2>
      
      <div className="bg-white border border-gray-300 rounded-md p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Order Summary</h3>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Feng Shui Layout Package</span>
            <span>$12.00</span>
          </div>
          
          {payment.lifeGoalOptimization && (
            <div className="flex justify-between mb-1">
              <span>Life Goal Optimization: {payment.lifeGoal ? payment.lifeGoal.charAt(0).toUpperCase() + payment.lifeGoal.slice(1) : 'None'}</span>
              <span>$5.00</span>
            </div>
          )}
          
          {payment.editProtection && (
            <div className="flex justify-between mb-1">
              <span>Edit Protection</span>
              <span>$3.00</span>
            </div>
          )}
          
          <div className="flex justify-between font-medium text-lg mt-2 pt-2 border-t">
            <span>Total</span>
            <span>${calculateTotalPrice()}.00</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name on Card</label>
            <input
              type="text"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="John Doe"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Processing Payment...' : 'Complete Payment'}
          </Button>
          
          <p className="mt-2 text-xs text-center text-gray-500">
            This is a demo. No actual payment will be processed.
          </p>
        </form>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="secondary"
          onClick={onBack}
        >
          Back to Preview
        </Button>
      </div>
    </div>
  );
};

export default PaymentPage;