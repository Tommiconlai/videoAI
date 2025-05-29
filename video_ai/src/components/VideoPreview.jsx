import { getDownloadUrl } from '../lib/api';

function VideoPreview({ videos }) {
  const completedVideos = videos.filter(video => video.status === 'completed');

  const handleDownload = (videoId, filename) => {
    const url = getDownloadUrl(videoId);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="fas fa-eye mr-2 text-purple-600"></i>
          Video Preview
        </h2>
        <p className="text-sm text-gray-600 mt-1">Review generated video clips</p>
      </div>
      
      <div className="p-6">
        {completedVideos.length > 0 ? (
          <div className="space-y-4">
            {completedVideos.map(video => (
              <div key={video.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="aspect-video bg-black rounded-lg mb-3 relative overflow-hidden">
                  <video 
                    controls 
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    <source src={getDownloadUrl(video.id)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}s
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {video.filename.replace(/\.(jpg|jpeg|png)$/i, '.mp4')}
                    </p>
                    <p className="text-xs text-gray-500">{video.prompt}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-xs"
                      onClick={() => handleDownload(video.id, video.filename.replace(/\.(jpg|jpeg|png)$/i, '.mp4'))}
                    >
                      <i className="fas fa-download mr-1"></i>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-video text-4xl text-gray-300 mb-4"></i>
            <p className="text-sm">No videos generated yet</p>
            <p className="text-xs">Upload images and generate videos to see previews here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPreview;
