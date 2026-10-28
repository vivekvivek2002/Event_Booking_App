import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api=axios.create({
    baseURL: API_URL,
    headers:{
        "Content-Type": "application/json",

    },
});

export const getImageUrl = (image) => {
    if (!image?.startsWith("/uploads/")) return image;
    if (!/^https?:\/\//i.test(API_URL)) return image;
    return new URL(image, API_URL).href;
};

api.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    const token=localStorage.getItem("token");
    if (token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
});

export default api;
