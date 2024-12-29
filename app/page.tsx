import { ImageUploadForm } from '@/components/ui/image-upload-form';

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Image Upload Form
        </h1>
        <ImageUploadForm />
      </div>
    </main>
  );
}