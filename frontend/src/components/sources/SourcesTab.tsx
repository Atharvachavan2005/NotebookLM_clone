import { FileUpload } from './FileUpload';
import { UrlInput } from './UrlInput';
import { YouTubeInput } from './YouTubeInput';
import { TextInput } from './TextInput';
import { SourcesList } from './SourcesList';

export function SourcesTab() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input Methods */}
          <div className="space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">
              Add Knowledge Sources
            </h2>
            <FileUpload />
            <UrlInput />
            <YouTubeInput />
            <TextInput />
          </div>
          
          {/* Right Column - Sources List */}
          <div>
            <SourcesList />
          </div>
        </div>
      </div>
    </div>
  );
}
