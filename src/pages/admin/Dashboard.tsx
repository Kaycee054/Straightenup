import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, MessageSquare, TrendingUp, MapPin, Plus, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { useContactStore } from '../../lib/store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const stats = [
  { name: 'Total Users', value: '1,234', icon: Users, change: '+12%' },
  { name: 'Total Orders', value: '456', icon: ShoppingBag, change: '+8%' },
  { name: 'Forum Posts', value: '789', icon: MessageSquare, change: '+15%' },
  { name: 'Revenue', value: '$12,345', icon: TrendingUp, change: '+10%' },
];

interface LocationFormData {
  name: string;
  address: string;
  lat: string;
  lng: string;
}

const Dashboard = () => {
  const { contactInfo, officeLocations, updateContactInfo, addOfficeLocation, removeOfficeLocation, updateOfficeLocation } = useContactStore();
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState<LocationFormData>({
    name: '',
    address: '',
    lat: '',
    lng: ''
  });
  const [locationVisibility, setLocationVisibility] = useState<Record<string, boolean>>({});
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, LocationFormData>>({});
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Initialize visibility state for existing locations
    const initialVisibility = officeLocations.reduce((acc, location) => {
      acc[location.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setLocationVisibility(initialVisibility);
  }, []);

  const handleContactInfoUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateContactInfo({ [name]: value });
  };

  const handleWorkingHoursUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateContactInfo({
      workingHours: {
        ...contactInfo.workingHours,
        [name]: value
      }
    });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>, locationId?: string) => {
    const { name, value } = e.target;
    
    if (locationId) {
      // Update existing location
      setUnsavedChanges(prev => ({
        ...prev,
        [locationId]: {
          ...prev[locationId],
          [name]: value
        }
      }));
    } else {
      // New location
      setNewLocation(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.address && newLocation.lat && newLocation.lng) {
      const lat = parseFloat(newLocation.lat);
      const lng = parseFloat(newLocation.lng);
      
      if (isNaN(lat) || isNaN(lng)) {
        setSaveMessage('Please enter valid latitude and longitude values');
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setSaveMessage('Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values');
        return;
      }

      addOfficeLocation({
        name: newLocation.name,
        address: newLocation.address,
        lat,
        lng
      });

      // Set initial visibility for the new location
      setLocationVisibility(prev => ({
        ...prev,
        [crypto.randomUUID()]: true
      }));

      setNewLocation({ name: '', address: '', lat: '', lng: '' });
      setSaveMessage('Location added successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleEditLocation = (locationId: string) => {
    const location = officeLocations.find(loc => loc.id === locationId);
    if (!location) return;

    setEditingLocation(locationId);
    setUnsavedChanges(prev => ({
      ...prev,
      [locationId]: {
        name: location.name,
        address: location.address,
        lat: location.lat.toString(),
        lng: location.lng.toString()
      }
    }));
  };

  const handleSaveLocations = async () => {
    try {
      const updates = Object.entries(unsavedChanges).map(([id, data]) => {
        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);

        if (isNaN(lat) || isNaN(lng)) {
          throw new Error(`Invalid coordinates for location: ${data.name}`);
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error(`Invalid coordinate range for location: ${data.name}`);
        }

        return updateOfficeLocation(id, {
          name: data.name,
          address: data.address,
          lat,
          lng
        });
      });

      await Promise.all(updates);
      setUnsavedChanges({});
      setEditingLocation(null);
      setSaveMessage('All locations saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Error saving locations');
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const toggleLocationVisibility = (locationId: string) => {
    setLocationVisibility(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };

  const center = officeLocations.length > 0 
    ? [officeLocations[0].lat, officeLocations[0].lng] 
    : [40.7128, -74.0060];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className="ml-2 text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Office Locations</h2>
        </div>
        <div className="p-6">
          <div className="h-[400px] rounded-lg overflow-hidden mb-6">
            <MapContainer
              center={center as [number, number]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {officeLocations.map((location) => (
                locationVisibility[location.id] && (
                  <Marker
                    key={location.id}
                    position={[location.lat, location.lng]}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-bold">{location.name}</h3>
                        <p>{location.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>

          {saveMessage && (
            <div className={`mb-4 p-3 rounded-md ${
              saveMessage.includes('Error') 
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {saveMessage}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Add New Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Location Name"
                name="name"
                value={newLocation.name}
                onChange={handleLocationChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Address"
                name="address"
                value={newLocation.address}
                onChange={handleLocationChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="Latitude"
                name="lat"
                value={newLocation.lat}
                onChange={handleLocationChange}
                step="any"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="Longitude"
                name="lng"
                value={newLocation.lng}
                onChange={handleLocationChange}
                step="any"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handleAddLocation}
              className="mt-4 flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </button>
          </div>

          <div className="space-y-4">
            {officeLocations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex-1">
                  {editingLocation === location.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Location Name"
                        name="name"
                        defaultValue={unsavedChanges[location.id]?.name || location.name}
                        onChange={(e) => handleLocationChange(e, location.id)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        name="address"
                        defaultValue={unsavedChanges[location.id]?.address || location.address}
                        onChange={(e) => handleLocationChange(e, location.id)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Latitude"
                        name="lat"
                        defaultValue={unsavedChanges[location.id]?.lat || location.lat}
                        onChange={(e) => handleLocationChange(e, location.id)}
                        step="any"
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Longitude"
                        name="lng"
                        defaultValue={unsavedChanges[location.id]?.lng || location.lng}
                        onChange={(e) => handleLocationChange(e, location.id)}
                        step="any"
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-sm text-gray-500">{location.address}</p>
                      <p className="text-sm text-gray-500">
                        Lat: {location.lat}, Lng: {location.lng}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleLocationVisibility(location.id)}
                    className={`text-gray-600 hover:text-gray-800 ${!locationVisibility[location.id] && 'text-gray-400'}`}
                    title={locationVisibility[location.id] ? 'Hide location' : 'Show location'}
                  >
                    {locationVisibility[location.id] ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => editingLocation === location.id ? setEditingLocation(null) : handleEditLocation(location.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeOfficeLocation(location.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(unsavedChanges).length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveLocations}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="w-5 h-5 mr-2" />
                Save All Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;