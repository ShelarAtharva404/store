import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress } from '../api/hooks';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: addresses, isLoading } = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    is_default: false,
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAddress) {
      updateAddress.mutate(
        { id: editingAddress.id, ...formData },
        {
          onSuccess: () => {
            setShowAddressForm(false);
            setEditingAddress(null);
            resetForm();
          },
        }
      );
    } else {
      addAddress.mutate(formData, {
        onSuccess: () => {
          setShowAddressForm(false);
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'USA',
      is_default: false,
    });
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddressForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddress.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* User Info */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-2">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Account Type:</strong> {user?.is_admin ? 'Admin' : 'Customer'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 btn btn-secondary"
        >
          Logout
        </button>
      </div>

      {/* Addresses */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Saved Addresses</h2>
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            <FaPlus /> Add Address
          </button>
        </div>

        {showAddressForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">
              {editingAddress ? 'Edit Address' : 'New Address'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Address Line 1"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                className="input md:col-span-2"
                required
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="input md:col-span-2"
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="input"
                required
              />
            </div>
            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Set as default address</span>
            </label>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={addAddress.isLoading || updateAddress.isLoading}>
                {editingAddress ? 'Update' : 'Add'} Address
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddressForm(false);
                  setEditingAddress(null);
                  resetForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {addresses && addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold">{address.full_name}</p>
                      {address.is_default && (
                        <span className="badge badge-success flex items-center gap-1">
                          <FaCheck size={10} /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600">{address.address_line1}</p>
                    {address.address_line2 && <p className="text-gray-600">{address.address_line2}</p>}
                    <p className="text-gray-600">
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p className="text-gray-600">{address.country}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteAddress.isLoading}
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No saved addresses yet</p>
        )}
      </div>
    </div>
  );
}
