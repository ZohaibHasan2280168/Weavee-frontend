import React, { useState, useEffect } from 'react';
import { FiImage, FiPlus, FiTrash2, FiLink, FiAlignLeft, FiX, FiCheckCircle, FiUploadCloud, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../services/reqInterceptor';
import { uploadCarouselImageToCloudinary } from '../../../utils/uploadToCloudinary';

const CarouselManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    priority: 0,
  });

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/carousel');
      setSlides(data);
    } catch (err) {
      toast.error('Failed to load carousel slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select an image for the slide');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please provide a title');
      return;
    }

    setIsSubmitting(true);
    try {
      toast.loading('Uploading image...', { id: 'addSlide' });
      const { url, publicId } = await uploadCarouselImageToCloudinary(imageFile);

      toast.loading('Saving slide...', { id: 'addSlide' });
      await api.post('/carousel', {
        imageUrl: url,
        publicId: publicId,
        title: formData.title,
        description: formData.description,
        link: formData.link,
        priority: Number(formData.priority) || 0,
      });

      toast.success('Slide added successfully!', { id: 'addSlide' });
      setIsModalOpen(false);
      resetForm();
      fetchSlides();
    } catch (err) {
      toast.error(err.message || 'Failed to add slide', { id: 'addSlide' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;

    try {
      toast.loading('Deleting slide...', { id: 'deleteSlide' });
      await api.delete(`/carousel/${id}`);
      toast.success('Slide deleted successfully', { id: 'deleteSlide' });
      setSlides((prev) => prev.filter((slide) => slide._id !== id));
    } catch (err) {
      toast.error('Failed to delete slide', { id: 'deleteSlide' });
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      title: '',
      description: '',
      link: '',
      priority: 0,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden font-sans relative">
      {/* Header Section */}
      <div className="shrink-0 bg-white dark:bg-[#0d1936] border-b border-slate-200 dark:border-slate-800 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Carousel Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage the slides displayed on the public landing page</p>
        </div>
        <button 
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 hover:-translate-y-0.5" 
          onClick={() => setIsModalOpen(true)}
        >
          <FiPlus size={16} /> <span>Add New Slide</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500 dark:text-slate-400">
              <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
              <span className="font-medium text-sm">Loading slides...</span>
            </div>
          ) : slides.length === 0 ? (
            <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <FiImage size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No slides found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6 max-w-sm">You haven't added any carousel slides yet. Create your first one!</p>
              <button 
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                onClick={() => setIsModalOpen(true)}
              >
                <FiPlus size={16} /> <span>Add Slide</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide) => (
                <div key={slide._id} className="group bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                  {/* Image Section */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <img 
                      src={slide.imageUrl} 
                      alt={slide.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/90 hover:bg-rose-600 text-white shadow-sm backdrop-blur-sm transition-colors"
                        onClick={() => handleDeleteSlide(slide._id)}
                        title="Delete Slide"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-5 flex-1 flex flex-col bg-slate-50/60 dark:bg-[#0d1936]">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                        {slide.title}
                      </h3>
                      <span className="shrink-0 inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                        P{slide.priority}
                      </span>
                    </div>
                    
                    {slide.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 flex items-start gap-2 line-clamp-2">
                        <FiAlignLeft className="mt-1 shrink-0 opacity-70" size={14} /> 
                        <span>{slide.description}</span>
                      </p>
                    )}
                    
                    {slide.link && (
                      <div className="mt-auto pt-3 flex items-center gap-2 text-sm text-brand-primary hover:text-brand-secondary transition-colors">
                        <FiLink size={14} className="shrink-0" />
                        <span className="truncate">{slide.link}</span>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                        <FiCheckCircle size={12} /> Active
                      </span>
                      <span className="text-slate-500 dark:text-slate-500">
                        Added {new Date(slide.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Slide</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload an image and set carousel details</p>
              </div>
              <button 
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all" 
                onClick={closeModal}
              >
                <FiX size={18} />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleAddSlide} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                
                {/* Image Upload Zone */}
                <div>
                  <label className="block mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Slide Image <span className="text-rose-500">*</span>
                  </label>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      id="slide-image-input"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl overflow-hidden transition-all ${
                      imagePreview 
                        ? 'border-brand-primary/50 bg-brand-primary/5' 
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/50 hover:border-brand-primary/40'
                    }`}>
                      {imagePreview ? (
                        <div className="relative w-full aspect-video">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                              <FiUploadCloud /> Change Image
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-10 px-4 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 mb-3 text-brand-primary">
                            <FiUploadCloud size={24} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload slide image</span>
                          <span className="text-xs mt-1">1920x1080px (16:9) recommended</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all placeholder:text-slate-400"
                    placeholder="e.g. Summer Collection 2026"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all placeholder:text-slate-400 resize-none"
                    placeholder="e.g. Get up to 50% off on all items..."
                    rows="3"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Link URL */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Link URL
                    </label>
                    <input 
                      type="text" 
                      name="link" 
                      value={formData.link} 
                      onChange={handleInputChange} 
                      className="w-full rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all placeholder:text-slate-400"
                      placeholder="e.g. /shop/summer"
                    />
                  </div>
                  
                  {/* Priority */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Priority
                    </label>
                    <input 
                      type="number" 
                      name="priority" 
                      value={formData.priority} 
                      onChange={handleInputChange} 
                      className="w-full rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all placeholder:text-slate-400"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-primary hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/25 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none disabled:hover:translate-y-0 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <><FiLoader className="animate-spin" size={16} /> Saving...</>
                  ) : 'Save Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselManagement;
