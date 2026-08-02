import api from "./reqInterceptor.js";

// 1. Create Initial Order Request
const createRequest = async (requestData) => {
  const response = await api.post("/requests", requestData);
  return response.data;
};

// 2. Add Proposal / Counter-Offer
const addProposal = async (requestId, proposalData) => {
  const response = await api.post(`/requests/${requestId}/proposals`, proposalData);
  return response.data;
};

// 3. Convert Request to Order
const convertToOrder = async (requestId) => {
  const response = await api.post(`/requests/${requestId}/convert`, {});
  return response.data;
};

const requestService = {
  createRequest,
  addProposal,
  convertToOrder,
};

export default requestService;
