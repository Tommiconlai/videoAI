import { useState } from 'react';

function ExportSection({ videos, onExport, isMerging }) {
  const [settings, setSettings] = useState({
    quality: 'high',
    frameRate: 30
  });

  const completedVideos = videos.filter(video => video.status === 'completed');
  const totalDuration = completedVideos.reduce((sum, video) => sum + video.duration, 0);
  const estimatedSize = Math.round(totalDuration * 0.8); // Rough estimate

  const handleExport = () => {
    if (completedVideos.length > 0) {
      onExport(settings);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="fas fa-file-export mr-2 text-emerald-600"></i>
          Export Final Video
        </h2>
        <p className="text-sm text-gray-600 mt-1">Combine all clips into one video</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {/* Export Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Final Video Settings</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Quality</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={settings.quality}
                  onChange={(e) => setSettings({...settings, quality: e.target.value})}
                >
                  <option value="high">High (1080p)</option>
                  <option value="medium">Medium (720p)</option>
                  <option value="low">Low (480p)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Frame Rate</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={settings.frameRate}
                  onChange={(e) => setSettings({...settings, frameRate: parseInt(e.target.value)})}
                >
                  <option value={30}>30 fps</option>
                  <option value={24}>24 fps</option>
                  <option value={60}>60 fps</option>
                </select>
              </div>
            </div>
          </div>

          {/* Video Order */}
          {completedVideos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clip Order</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {completedVideos.map((video, index) => (
                  <div key={video.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-grip-vertical text-gray-400"></i>
                      <span className="text-sm text-gray-700">
                        {index + 1}. {video.filename.replace(/\.(jpg|jpeg|png)$/i, '.mp4')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{video.duration}s</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Drag to reorder clips</p>
            </div>
          )}

          {/* Export Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <i className="fas fa-info-circle text-blue-600"></i>
              <span className="text-sm font-medium text-blue-900">Export Summary</span>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <div className="flex justify-between">
                <span>Total clips:</span>
                <span>{completedVideos.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total duration:</span>
                <span>{totalDuration} seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated size:</span>
                <span>~{estimatedSize} MB</span>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button 
            className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleExport}
            disabled={completedVideos.length === 0 || isMerging}
          >
            <i className={`fas ${isMerging ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
            <span>{isMerging ? 'Merging Videos...' : 'Merge & Export Video'}</span>
          </button>

          {/* Export Progress */}
          {isMerging && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Merging videos...</span>
                <span className="text-gray-900">Processing</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300 animate-pulse" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-500">Using FFmpeg to concatenate video clips...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExportSection;
