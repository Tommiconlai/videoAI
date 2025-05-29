function ProcessingQueue({ videos, onClearCompleted }) {
    const processingVideos = videos.filter(video => 
      video.status === 'processing' || video.status === 'failed'
    );
    const completedVideos = videos.filter(video => video.status === 'completed');
  
    const formatTimeAgo = (dateString) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes === 1) return '1 minute ago';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours === 1) return '1 hour ago';
      return `${diffInHours} hours ago`;
    };
  
    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <i className="fas fa-tasks mr-2 text-amber-600"></i>
              Processing Queue
            </h2>
            {completedVideos.length > 0 && (
              <button 
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={onClearCompleted}
              >
                <i className="fas fa-broom mr-1"></i>
                Clear Completed
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">Monitor video generation progress</p>
        </div>
        
        <div className="p-6">
          {videos.length > 0 ? (
            <div className="space-y-3">
              {/* Processing Jobs */}
              {processingVideos.map(video => (
                <div 
                  key={video.id} 
                  className={`flex items-center space-x-4 p-4 rounded-lg border ${
                    video.status === 'processing' 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      video.status === 'processing' 
                        ? 'bg-amber-100' 
                        : 'bg-red-100'
                    }`}>
                      <i className={`fas ${
                        video.status === 'processing' 
                          ? 'fa-clock text-amber-600 animate-pulse' 
                          : 'fa-exclamation-triangle text-red-600'
                      }`}></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{video.filename}</p>
                      <span className={`text-xs ${
                        video.status === 'processing' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {video.status === 'processing' ? 'Processing' : 'Failed'}
                      </span>
                    </div>
                    {video.status === 'processing' ? (
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Sending to Framepack API...</span>
                          <span>{video.progress}%</span>
                        </div>
                        <div className="w-full bg-amber-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${video.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-600">{video.error}</p>
                    )}
                  </div>
                  {video.status === 'failed' && (
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      <i className="fas fa-redo mr-1"></i>
                      Retry
                    </button>
                  )}
                </div>
              ))}
  
              {/* Completed Jobs */}
              {completedVideos.map(video => (
                <div 
                  key={video.id} 
                  className="flex items-center space-x-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-check text-emerald-600"></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{video.filename}</p>
                      <span className="text-xs text-emerald-600">Completed</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Completed {formatTimeAgo(video.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-tasks text-4xl text-gray-300 mb-4"></i>
              <p className="text-sm">No jobs in queue</p>
              <p className="text-xs">Upload images and start generating videos to see progress here</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export default ProcessingQueue;
  