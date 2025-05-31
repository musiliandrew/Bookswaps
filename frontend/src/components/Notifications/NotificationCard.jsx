import { Button } from '../components/common/Button';

const NotificationCard = ({ notification, onRead }) => {
  const { id, message, is_read, timestamp } = notification;

  return (
    <div className="bookish-shadow p-4 mb-2 bg-white rounded-lg flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">{new Date(timestamp).toLocaleString()}</p>
        <p className={is_read ? 'text-gray-500' : 'text-gray-700'}>{message}</p>
      </div>
      {!is_read && (
        <Button
          onClick={() => onRead(id)}
          className="bookish-button-enhanced"
        >
          Mark as Read
        </Button>
      )}
    </div>
  );
};

export default NotificationCard;
