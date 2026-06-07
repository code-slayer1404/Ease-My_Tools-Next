import BackgroundRemover from '@/components/BackgroundRemover';

export const metadata = {
    title: 'Remove Image Background | Tool Suite',
    description: 'RAM cached client-side background removal utility.',
};

export default function RemoveBackgroundPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div className="max-w-5xl mx-auto w-full">
                <BackgroundRemover />
            </div>
        </main>
    );
}