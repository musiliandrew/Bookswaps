import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../hooks/useNotifications';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Common/Button';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const NotificationToast = () => {
  // Disabled complex notification toasts to reduce screen clutter
  // Users can see notifications in the notification badge/dropdown instead
  return null; // Renderless component
};

export default NotificationToast;