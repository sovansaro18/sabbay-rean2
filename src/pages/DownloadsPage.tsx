import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DownloadCenter from '../components/DownloadCenter';
import { DownloadedItem } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function DownloadsPage() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [downloads, setDownloads] = useLocalStorage<DownloadedItem[]>('sabbay_downloads', []);

  const handleRemoveDownload = async (id: string) => {
    const itemToRemove = downloads.find(d => d.id === id);
    if (itemToRemove && 'caches' in window) {
      try {
        const cache = await caches.open('sabbay-offline-files');
        await cache.delete(itemToRemove.document.fileUrl);
      } catch (err) {
        console.warn('Error deleting cached file:', err);
      }
    }
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
  };

  const handleClearAllDownloads = async () => {
    if ('caches' in window) {
      try {
        await caches.delete('sabbay-offline-files');
      } catch (err) {
        console.warn('Error deleting offline cache:', err);
      }
    }
    setDownloads([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <DownloadCenter
        downloads={downloads}
        onRemoveDownload={handleRemoveDownload}
        onClearAllDownloads={handleClearAllDownloads}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
