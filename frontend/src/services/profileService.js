import { api } from './api';

export async function getProfile(lecturerId) {
  const response = await api.get(`/lecturers/${lecturerId}/profile`);
  return response.data;
}

export async function updateProfile(lecturerId, profile) {
  const response = await api.put(`/lecturers/${lecturerId}/profile`, profile);
  return response.data;
}
