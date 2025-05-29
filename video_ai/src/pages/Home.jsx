import StatsOverview from "src/components/StatsOverview";
import ImageUpload from "src/components/ImageUpload";
import ParameterForm from "src/components/ParameterForm";
import VideoPreview from "src/components/VideoPreview";
import ExportSection from "src/components/ExportSection";
import ProcessingQueue from ".src/components/ProcessingQueue";

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <i className="fas fa-video text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Framepack Video Generator</h1>
                <p className="text-sm text-gray-500">Transform images into AI-generated videos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Framepack API Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Section */}
          <ImageUpload 
            onGenerate={startGeneration}
            isLoading={isLoading}
            videos={videos}
          />

          {/* Preview and Export Section */}
          <div className="xl:col-span-1">
            <div className="space-y-6">
              <VideoPreview videos={videos} />
              <ExportSection 
                videos={videos}
                onExport={exportVideo}
                isMerging={isMerging}
              />
            </div>
          </div>
        </div>

        {/* Processing Queue */}
        <ProcessingQueue 
          videos={videos}
          onClearCompleted={clearCompletedVideos}
        />
      </main>
    </div>
  );
}

export default Home;
