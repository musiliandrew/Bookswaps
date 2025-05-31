import { useState } from 'react';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { EventForm } from './EventForm';

const SocietyEventCard = ({ event, onRSVP, onDelete, onEdit }) => {
  const { id, title, description, date, location, rsvp_count = 0, user_rsvped = false, creator } = event;
  const { user, isAuthenticated } = useAuth();
  const [isRsvped, setIsRsvped] = useState(user_rsvped);
  const [rsvpCount, setRsvpCount] = useState(rsvp_count);
  const [isEditing, setIsEditing] = useState(false);

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to RSVP');
      return;
    }
    try {
      await onRSVP(id);
      setIsRsvped(true);
      setRsvpCount((prev) => prev + 1);
    } catch {
      toast.error('Failed to RSVP');
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to delete events');
      return;
    }
    try {
      await onDelete(id);
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const handleEdit = async (formData) => {
    try {
      await onEdit(id, formData);
      setIsEditing(false);
    } catch {
      toast.error('Failed to update event');
    }
  };

  const canManage = isAuthenticated && creator?.id === user?.id;

  return (
    <div className="bookish-shadow p-4 bg-white rounded-lg relative">
      {isEditing ? (
        <div className="absolute inset-0 bg-white bg-opacity-90 p-4 rounded-lg z-10">
          <EventForm
            onSubmit={handleEdit}
            initialData={{ title, description, date: new Date(date).toISOString().slice(0, 16), location }}
            isLoading={false}
          />
          <Button
            onClick={() => setIsEditing(false)}
            className="bookish-button bg-gray-500 hover:bg-gray-600 mt-2"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-600">{description || 'No description'}</p>
          <p className="text-sm text-gray-500 mt-2">Date: {new Date(date).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Location: {location || 'TBD'}</p>
          <p className="text-sm text-gray-500">RSVPs: {rsvpCount}</p>
          <div className="flex space-x-2 mt-2">
            <Button
              onClick={handleRSVP}
              className="bookish-button-enhanced"
              disabled={isRsvped || !isAuthenticated}
            >
              {isRsvped ? 'RSVPed' : 'RSVP'}
            </Button>
            {canManage && (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bookish-button bg-primary hover:bg-blue-600"
                  disabled={!isAuthenticated}
                >
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bookish-button bg-danger hover:bg-red-600"
                  disabled={!isAuthenticated}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SocietyEventCard;