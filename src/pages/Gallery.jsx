import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase, TABLES } from '../utils/supabase';
import { 
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // Fetch images from Supabase
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(TABLES.GALLERY)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setImages(data || []);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      setError('Failed to load gallery images. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open lightbox for image
  const openLightbox = (image) => {
    setSelectedImage(image);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  // Close lightbox
  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showLightbox) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox]);

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-64 bg-gray-200"></div>
        </div>
      ))}
    </div>
  );

  // Error message component
  const ErrorMessage = () => (
    <div className="text-center py-12">
      <div className="text-red-500 text-lg mb-4">Error Loading Gallery</div>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={fetchImages}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  // No images component
  const NoImages = () => (
    <div className="text-center py-12">
      <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <div className="text-gray-500 text-lg mb-4">No images available</div>
      <p className="text-gray-400">
        Images will appear here once they are added to the gallery.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take a visual journey through our yoga studio, classes, and community events.
          </p>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorMessage />
        ) : images.length === 0 ? (
          <NoImages />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {images.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                  onClick={() => openLightbox(image)}
                >
                  {/* Image */}
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.title || 'Gallery image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Simple Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-6xl w-full max-h-[90vh]">
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              {/* Image */}
              <div className="flex items-center justify-center h-full">
                {selectedImage.url ? (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title || 'Gallery image'}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <PhotoIcon className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery; 