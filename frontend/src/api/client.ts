import { Api } from './api.ts';
import { http } from './http';

const isDevelopment = import.meta.env.DEV;
const apiBaseUrl = isDevelopment ? '/api/v1' : 'https://api.finclai.com/api/v1';

export const api = new Api({ baseURL: apiBaseUrl });
api.instance = http;

export * from '../api/api';



