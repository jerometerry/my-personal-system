import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import { initializeRum, recordPageView } from './rum';

export default function RumTracker() {
  const location = useLocation();

  useEffect(() => {
    initializeRum();
  }, []);

  useEffect(() => {
    recordPageView(location.pathname);
  }, [location]);

  return null;
}