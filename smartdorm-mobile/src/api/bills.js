import client from './client';

export const billsApi = {
  getMyBills: () => client.get('/bills/my'),
  getBillDetail: (id) => client.get(`/bills/${id}`),
};
