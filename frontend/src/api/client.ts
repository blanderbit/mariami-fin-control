import { Api } from './api.ts';
import { http } from './http';

export const api = new Api({ baseURL: '/api/v1' });
api.instance = http;

export * from '../api/api';



