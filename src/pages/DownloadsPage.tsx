import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DownloadCenter from '../components/DownloadCenter';
import { DownloadedItem } from '../types';

export default function DownloadsPage() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [downloads, setDownloads] = useState<DownloadedItem[]>(() => {
    try {
      const saved = localStorage.getItem('sabbay_downloads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
    localStorage.setItem('sabbay_downloads', JSON.stringify(updated));
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
    localStorage.removeItem('sabbay_downloads');
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
