import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { initializeSocket, getSocket } from './socketService.js';

const Notification = () => {
  useEffect(() => {
    // Initialize socket connection
    initializeSocket();
    const socket = getSocket();

    // Set up event listeners
    socket.on('job_created', (data) => {
      toast.info(data.message, {
        onClick: () => window.location.href = `/jobs/${data.data._id}`,
        autoClose: 5000
      });
    });

    socket.on('job_updated', (data) => {
      toast.info(data.message, {
        onClick: () => window.location.href = `/jobs/${data.data._id}`,
        autoClose: 5000
      });
    });

    socket.on('job_deleted', (data) => {
      toast.warning(data.message);
    });

    return () => {
      // Clean up on unmount
      socket.off('job_created');
      socket.off('job_updated');
      socket.off('job_deleted');
    };
  }, []);

  return null; // This component doesn't render anything
};
export default Notification;