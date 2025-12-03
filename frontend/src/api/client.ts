import axios from 'axios';
import { auth } from '../config/firebase';

export const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    return { headers: { Authorization: `Bearer ${token}` } };
};