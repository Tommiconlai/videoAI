import { VideoStatus } from '../shared/schema.js';

export class MemStorage {
  constructor() {
    this.videos = new Map();
    this.currentId = 1;
  }

  async createVideo(videoData) {
    const id = this.currentId++;
    const video = { ...videoData, id };
    this.videos.set(id, video);
    return video;
  }

  async getVideo(id) {
    return this.videos.get(id);
  }

  async updateVideo(id, updates) {
    const video = this.videos.get(id);
    if (video) {
      const updated = { ...video, ...updates };
      this.videos.set(id, updated);
      return updated;
    }
    return null;
  }

  async getAllVideos() {
    return Array.from(this.videos.values());
  }

  async getVideosByStatus(status) {
    return Array.from(this.videos.values()).filter(video => video.status === status);
  }

  async deleteVideo(id) {
    return this.videos.delete(id);
  }

  async getCompletedVideos() {
    return this.getVideosByStatus(VideoStatus.COMPLETED);
  }

  async clearCompleted() {
    const completed = await this.getCompletedVideos();
    completed.forEach(video => this.videos.delete(video.id));
    return completed.length;
  }
}

export const storage = new MemStorage();
