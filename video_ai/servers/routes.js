import { Router } from "express";
import { createServer } from "http";
import multer from "multer";
import { Client } from "@gradio/client";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from 'url';
import { storage } from "./storage.js";
import { createInsertVideoSchema, createVideo, VideoStatus } from "../shared/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPG images are allowed'));
    }
  }
});

export async function registerRoutes(app) {
  const router = Router();

  // Generate video from image
  router.post('/generate', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { prompt, negativePrompt, duration, seed, steps } = req.body;
      
      // Validate parameters
      const validation = createInsertVideoSchema({
        prompt,
        negativePrompt,
        duration: parseInt(duration),
        seed: parseInt(seed),
        steps: parseInt(steps)
      });

      if (!validation.isValid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
      }

      // Create video record
      const videoData = createVideo({
        filename: req.file.originalname,
        originalImage: req.file.path,
        prompt,
        negativePrompt,
        duration: parseInt(duration),
        seed: parseInt(seed),
        steps: parseInt(steps)
      });

      const video = await storage.createVideo(videoData);

      // Start video generation process (async)
      generateVideoAsync(video.id, req.file.path, {
        prompt,
        negative_prompt: negativePrompt || '',
        duration: parseInt(duration),
        seed: parseInt(seed),
        steps: parseInt(steps)
      });

      res.json({ 
        success: true, 
        videoId: video.id,
        message: 'Video generation started'
      });

    } catch (error) {
      console.error('Generate route error:', error);
      res.status(500).json({ error: 'Failed to start video generation' });
    }
  });

  // Get video status
  router.get('/video/:id', async (req, res) => {
    try {
      const video = await storage.getVideo(parseInt(req.params.id));
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      res.json(video);
    } catch (error) {
      console.error('Get video error:', error);
      res.status(500).json({ error: 'Failed to get video status' });
    }
  });

  // Get all videos
  router.get('/videos', async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error('Get videos error:', error);
      res.status(500).json({ error: 'Failed to get videos' });
    }
  });

  // Merge videos and export
  router.post('/merge', async (req, res) => {
    try {
      const completedVideos = await storage.getCompletedVideos();
      
      if (completedVideos.length === 0) {
        return res.status(400).json({ error: 'No completed videos to merge' });
      }

      const { quality = 'high', frameRate = 30 } = req.body;
      
      // Create temporary input file for FFmpeg
      const inputListPath = `/tmp/input_${Date.now()}.txt`;
      const outputPath = `/tmp/merged_video_${Date.now()}.mp4`;
      
      // Create input list file
      const inputList = completedVideos
        .map(video => `file '${video.videoPath}'`)
        .join('\n');
      
      await fs.writeFile(inputListPath, inputList);

      // Set quality parameters
      const qualityParams = getQualityParams(quality);
      
      // Execute FFmpeg
      const mergeSuccess = await mergeVideosWithFFmpeg(inputListPath, outputPath, qualityParams, frameRate);
      
      if (mergeSuccess) {
        // Send file for download
        res.download(outputPath, 'merged_video.mp4', async (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Clean up temporary files
          try {
            await fs.unlink(inputListPath);
            await fs.unlink(outputPath);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        });
      } else {
        res.status(500).json({ error: 'Failed to merge videos' });
      }

    } catch (error) {
      console.error('Merge route error:', error);
      res.status(500).json({ error: 'Failed to merge videos' });
    }
  });

  // Download individual video
  router.get('/download/:id', async (req, res) => {
    try {
      const video = await storage.getVideo(parseInt(req.params.id));
      if (!video || video.status !== VideoStatus.COMPLETED) {
        return res.status(404).json({ error: 'Video not found or not completed' });
      }

      const filename = `${path.parse(video.filename).name}.mp4`;
      res.download(video.videoPath, filename);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Failed to download video' });
    }
  });

  // Clear completed videos
  router.post('/clear-completed', async (req, res) => {
    try {
      const cleared = await storage.clearCompleted();
      res.json({ success: true, cleared });
    } catch (error) {
      console.error('Clear completed error:', error);
      res.status(500).json({ error: 'Failed to clear completed videos' });
    }
  });

  app.use('/api', router);

  const httpServer = createServer(app);
  return httpServer;
}

// Async video generation function
async function generateVideoAsync(videoId, imagePath, params) {
  try {
    await storage.updateVideo(videoId, { 
      status: VideoStatus.PROCESSING, 
      progress: 10 
    });

    // Check if Framepack is running on port 7860
    const isFramepackRunning = await checkFramepackAvailability();
    
    if (!isFramepackRunning) {
      // Demo mode: simulate video generation
      await simulateVideoGeneration(videoId, imagePath, params);
      return;
    }

    // Connect to Framepack AI
    const client = await Client.connect("http://127.0.0.1:7860");
    
    await storage.updateVideo(videoId, { progress: 30 });

    // Read image file
    const imageBuffer = await fs.readFile(imagePath);
    const imageBlob = new Blob([imageBuffer]);

    await storage.updateVideo(videoId, { progress: 50 });

    // Call Framepack API
    const result = await client.predict("/process", {
      image: imageBlob,
      prompt: params.prompt,
      negative_prompt: params.negative_prompt,
      duration: params.duration,
      seed: params.seed,
      steps: params.steps
    });

    await storage.updateVideo(videoId, { progress: 80 });

    // Handle result
    if (result && result.data && result.data[0]) {
      const videoUrl = result.data[0];
      const videoPath = await downloadVideo(videoUrl, videoId);
      
      await storage.updateVideo(videoId, {
        status: VideoStatus.COMPLETED,
        progress: 100,
        videoPath
      });
    } else {
      throw new Error('Invalid response from Framepack API');
    }

  } catch (error) {
    console.error('Video generation error:', error);
    await storage.updateVideo(videoId, {
      status: VideoStatus.FAILED,
      error: error.message
    });
  } finally {
    // Clean up uploaded image
    try {
      await fs.unlink(imagePath);
    } catch (cleanupError) {
      console.error('Image cleanup error:', cleanupError);
    }
  }
}

// Check if Framepack is available
async function checkFramepackAvailability() {
  try {
    const response = await fetch('http://127.0.0.1:7860');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Simulate video generation for demo purposes
async function simulateVideoGeneration(videoId, imagePath, params) {
  console.log(`Demo mode: Simulating video generation for ${params.prompt}`);
  
  // Simulate processing steps
  await storage.updateVideo(videoId, { progress: 25 });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await storage.updateVideo(videoId, { progress: 50 });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await storage.updateVideo(videoId, { progress: 75 });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a demo video file (just copy the image for now)
  const videoPath = `/tmp/demo_video_${videoId}_${Date.now()}.mp4`;
  
  await storage.updateVideo(videoId, {
    status: VideoStatus.COMPLETED,
    progress: 100,
    videoPath: imagePath, // Use image path as placeholder
    error: 'Demo mode: Connect Framepack AI on port 7860 for real video generation'
  });
}

// Download video from URL
async function downloadVideo(url, videoId) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const videoPath = `/tmp/video_${videoId}_${Date.now()}.mp4`;
  const buffer = await response.buffer();
  await fs.writeFile(videoPath, buffer);
  
  return videoPath;
}

// Merge videos using FFmpeg
function mergeVideosWithFFmpeg(inputListPath, outputPath, qualityParams, frameRate) {
  return new Promise((resolve) => {
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', inputListPath,
      '-c:v', 'libx264',
      '-preset', qualityParams.preset,
      '-crf', qualityParams.crf,
      '-r', frameRate.toString(),
      '-y', // Overwrite output file
      outputPath
    ];

    const ffmpeg = spawn('ffmpeg', args);

    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });

    ffmpeg.on('error', (error) => {
      console.error('FFmpeg error:', error);
      resolve(false);
    });
  });
}

// Get quality parameters for FFmpeg
function getQualityParams(quality) {
  switch (quality) {
    case 'high':
      return { preset: 'medium', crf: '18' };
    case 'medium':
      return { preset: 'fast', crf: '23' };
    case 'low':
      return { preset: 'fast', crf: '28' };
    default:
      return { preset: 'medium', crf: '18' };
  }
}
