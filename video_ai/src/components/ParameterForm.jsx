import { useState, useEffect } from 'react';

function ParameterForm({ params, onChange, onGenerate, isLoading, video, onRemove }) {
  const [formParams, setFormParams] = useState(params);

  useEffect(() => {
    setFormParams(params);
  }, [params]);

  const handleParamChange = (field, value) => {
    const updated = { ...formParams, [field]: value };
    setFormParams(updated);
    onChange(updated);
  };

  const handleGenerate = () => {
    if (formParams.prompt.trim()) {
      onGenerate();
    }
  };

  const getButtonContent = () => {
    if (video) {
      switch (video.status) {
        case 'processing':
          return {
            text: 'Processing...',
            icon: 'fa-clock',
            className: 'bg-amber-600 hover:bg-amber-700',
            disabled: true
          };
        case 'completed':
          return {
            text: 'Completed',
            icon: 'fa-check',
            className: 'bg-emerald-600 hover:bg-emerald-700',
            disabled: true
          };
        case 'failed':
          return {
            text: 'Retry',
            icon: 'fa-redo',
            className: 'bg-red-600 hover:bg-red-700',
            disabled: false
          };
        default:
          return {
            text: 'Generate Video',
            icon: 'fa-play',
            className: 'bg-blue-600 hover:bg-blue-700',
            disabled: false
          };
      }
    }
    return {
      text: 'Generate Video',
      icon: 'fa-play',
      className: 'bg-blue-600 hover:bg-blue-700',
      disabled: false
    };
  };

  const buttonProps = getButtonContent();

  return (
    <>
      {/* Parameters Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Prompt</label>
          <textarea 
            rows="2" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Describe the video motion..."
            value={formParams.prompt}
            onChange={(e) => handleParamChange('prompt', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Negative Prompt</label>
          <textarea 
            rows="2" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="What to avoid..."
            value={formParams.negativePrompt}
            onChange={(e) => handleParamChange('negativePrompt', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Duration (seconds)</label>
          <input 
            type="number" 
            min="1" 
            max="30" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formParams.duration}
            onChange={(e) => handleParamChange('duration', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Seed</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formParams.seed}
            onChange={(e) => handleParamChange('seed', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Steps</label>
          <input 
            type="number" 
            min="1" 
            max="100" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formParams.steps}
            onChange={(e) => handleParamChange('steps', parseInt(e.target.value))}
          />
        </div>
        <div className="flex items-end">
          <button 
            className={`w-full ${buttonProps.className} text-white px-4 py-2 rounded-md transition-colors font-medium text-sm`}
            onClick={handleGenerate}
            disabled={buttonProps.disabled || isLoading || !formParams.prompt.trim()}
          >
            <i className={`fas ${buttonProps.icon} mr-2`}></i>
            {buttonProps.text}
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {video && (
            <>
              <div className={`flex items-center text-xs ${
                video.status === 'processing' ? 'text-amber-600' :
                video.status === 'completed' ? 'text-emerald-600' :
                video.status === 'failed' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <i className={`fas ${
                  video.status === 'processing' ? 'fa-clock' :
                  video.status === 'completed' ? 'fa-check-circle' :
                  video.status === 'failed' ? 'fa-exclamation-circle' : 'fa-clock'
                } mr-1`}></i>
                <span>{
                  video.status === 'processing' ? 'Processing...' :
                  video.status === 'completed' ? 'Video generated successfully' :
                  video.status === 'failed' ? `Failed: ${video.error}` : video.status
                }</span>
              </div>
              {video.status === 'processing' && (
                <div className="w-32 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${video.progress}%` }}
                  ></div>
                </div>
              )}
            </>
          )}
        </div>
        <button 
          className="text-red-500 hover:text-red-700 text-xs"
          onClick={onRemove}
        >
          <i className="fas fa-trash mr-1"></i>
          Remove
        </button>
      </div>
    </>
  );
}

export default ParameterForm;
