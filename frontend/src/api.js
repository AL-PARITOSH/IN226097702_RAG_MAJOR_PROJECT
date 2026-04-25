import axios from 'axios';

const API_URL = 'https://paritosh143-rag-backend.hf.space';

export const uploadFiles = async (sessionId, files) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const clearWorkspace = async (sessionId) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);

    const response = await axios.post(`${API_URL}/clear`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const chat = async (sessionId, query, uploadedFiles) => {
    const response = await axios.post(`${API_URL}/chat`, {
        session_id: sessionId,
        query: query,
        uploaded_files: uploadedFiles,
    });
    return response.data;
};

export const getTickets = async () => {
    const response = await axios.get(`${API_URL}/hitl/tickets`);
    return response.data.tickets;
};

export const resolveTicket = async (ticketId, resolution) => {
    const response = await axios.post(`${API_URL}/hitl/resolve`, {
        ticket_id: ticketId,
        resolution: resolution,
    });
    return response.data;
};
