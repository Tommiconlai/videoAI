export async function apiRequest(method, url, data, file) {
    const config = {
      method,
      credentials: 'include',
    };
  
    if (file) {
      const formData = new FormData();
      if (data) {
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
      }
      formData.append('image', file);
      config.body = formData;
    } else if (data) {
      config.headers = { 'Content-Type': 'application/json' };
      config.body = JSON.stringify(data);
    }
  
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
  
      return response;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
  
  export async function generateVideo(imageFile, params) {
    return apiRequest('POST', '/api/generate', params, imageFile);
  }
  
  export async function getVideoStatus(videoId) {
    const response = await apiRequest('GET', `/api/video/${videoId}`);
    return response.json();
  }
  
  export async function getAllVideos() {
    const response = await apiRequest('GET', '/api/videos');
    return response.json();
  }
  
  export async function mergeVideos(settings) {
    const response = await apiRequest('POST', '/api/merge', settings);
    return response;
  }
  
  export async function clearCompleted() {
    const response = await apiRequest('POST', '/api/clear-completed');
    return response.json();
  }
  
  export function getDownloadUrl(videoId) {
    return `/api/download/${videoId}`;
  }
  