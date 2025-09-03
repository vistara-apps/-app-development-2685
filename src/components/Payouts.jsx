import React, { useState } from 'react';
import { Plus, Calendar, Users, DollarSign } from 'lucide-react';

const Payouts = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [recipients, setRecipients] = useState([
    { address: '', amount: '' }
  ]);

  const payoutBatches = [
    {
      id: 'batch_001',
      creationDate: '2024-01-15',
      totalAmount: '25.5 SOL',
      recipientCount: 12,
      status: 'completed'
    },
    {
      id: 'batch_002',
      creationDate: '2024-01-14',
      totalAmount: '18.2 SOL',
      recipientCount: 8,
      status: 'processing'
    },
    {
      id: 'batch_003',
      creationDate: '2024-01-13',
      totalAmount: '42.1 SOL',
      recipientCount: 25,
      status: 'scheduled'
    }
  ];

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };

  const updateRecipient = (index, field, value) => {
    const updated = recipients.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value } : recipient
    );
    setRecipients(updated);
  };

  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Automated Payouts</h1>
          <p className="text-white/70">Distribute funds to multiple recipients efficiently</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Payout Batch</span>
        </button>
      </div>

      {/* Create Payout Form */}
      {showCreateForm && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Create New Payout Batch</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Batch Name</label>
              <input
                type="text"
                placeholder="Enter batch name"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Recipients</label>
              <div className="space-y-3">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Recipient address"
                      value={recipient.address}
                      onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Amount (SOL)"
                      value={recipient.amount}
                      onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                      className="w-32 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {recipients.length > 1 && (
                      <button
                        onClick={() => removeRecipient(index)}
                        className="px-4 py-3 text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addRecipient}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                + Add Recipient
              </button>
            </div>

            <div className="flex space-x-4 pt-4">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                Create Batch
              </button>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">15</h3>
              <p className="text-white/70 text-sm">Total Batches</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">247</h3>
              <p className="text-white/70 text-sm">Recipients Paid</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">156.8 SOL</h3>
              <p className="text-white/70 text-sm">Total Distributed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Batches Table */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Payout Batches</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/70 font-medium py-3">Batch ID</th>
                <th className="text-left text-white/70 font-medium py-3">Date</th>
                <th className="text-left text-white/70 font-medium py-3">Recipients</th>
                <th className="text-left text-white/70 font-medium py-3">Total Amount</th>
                <th className="text-left text-white/70 font-medium py-3">Status</th>
                <th className="text-left text-white/70 font-medium py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payoutBatches.map((batch) => (
                <tr key={batch.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4">
                    <span className="text-blue-400 font-mono text-sm">{batch.id}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white/70">{batch.creationDate}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white">{batch.recipientCount}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-white font-semibold">{batch.totalAmount}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      batch.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payouts;