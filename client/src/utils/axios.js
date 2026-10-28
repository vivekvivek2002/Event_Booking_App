import axios from "axios";

const api=axios.create({
    baseURL: "http://localhost:5001/api",
    headers:{
        "Content-Type": "application/json",

    },
});

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