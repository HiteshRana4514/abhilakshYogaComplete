import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, TABLES } from '../utils/supabase';
import { XMarkIcon, PlusIcon, PhotoIcon, PencilIcon, CogIcon, ChevronDownIcon, ArrowPathIcon, UserGroupIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Simple Rich Text Editor Component
const TextEditor = ({ value, onChange, placeholder = "Enter text...", id = "text-editor" }) => {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const toggleBold = () => {
    setIsBold(!isBold);
    const textarea = document.getElementById(id);
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
      onChange(newText);
    }
  };

  const toggleItalic = () => {
    setIsItalic(!isItalic);
    const textarea = document.getElementById(id);
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
      onChange(newText);
    }
  };

  const addBulletList = () => {
    const textarea = document.getElementById(id);
    if (textarea) {
      const start = textarea.selectionStart;
      const newText = value.substring(0, start) + '\n• ' + value.substring(start);
      onChange(newText);
    }
  };

  const addNumberedList = () => {
    const textarea = document.getElementById(id);
    if (textarea) {
      const start = textarea.selectionStart;
      const newText = value.substring(0, start) + '\n1. ' + value.substring(start);
      onChange(newText);
    }
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded ${isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
          title="Bold (Ctrl+B)"
        >
          <span className="text-sm font-bold">B</span>
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded ${isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
          title="Italic (Ctrl+I)"
        >
          <span className="text-sm italic">I</span>
        </button>
        <div className="w-px h-6 bg-gray-300"></div>
        <button
          type="button"
          onClick={addBulletList}
          className="p-2 rounded hover:bg-gray-200"
          title="Bullet List"
        >
          <span className="text-sm">•</span>
        </button>
        <button
          type="button"
          onClick={addNumberedList}
          className="p-2 rounded hover:bg-gray-200"
          title="Numbered List"
        >
          <span className="text-sm font-bold">1.</span>
        </button>
      </div>

      {/* Textarea */}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      {/* Help text */}
      <div className="text-sm text-gray-500">
        <p>Formatting: Use <code className="bg-gray-100 px-1 rounded">**bold**</code> and <code className="bg-gray-100 px-1 rounded">*italic*</code></p>
        <p>Lists: Use <code className="bg-gray-100 px-1 rounded">•</code> for bullets or <code className="bg-gray-100 px-1 rounded">1.</code> for numbers</p>
      </div>
    </div>
  );
};

export const ClassForm = ({ isOpen, onClose, editData = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    instructor: '',
    price: '',
    schedule: '',
    max_students: '',
    level: 'beginner',
    image_url: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
      setImagePreview(editData.image_url || '');
      setSelectedFile(null);
    } else {
      // Reset form data for new class
      setFormData({
        name: '',
        description: '',
        duration: '',
        instructor: '',
        price: '',
        schedule: '',
        max_students: '',
        level: 'beginner',
        image_url: ''
      });
      setImagePreview('');
      setSelectedFile(null);
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editData) {
        // Handle image upload if file is selected
        let imageUrl = formData.image_url;
        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `class_${Math.random()}.${fileExt}`;
          const filePath = `classes/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, selectedFile);

          if (uploadError) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        const { error } = await supabase
          .from(TABLES.CLASSES)
          .update({ ...formData, image_url: imageUrl })
          .eq('id', editData.id);

        if (error) throw error;
        toast.success('Class updated successfully');
      } else {
        // Handle image upload if file is selected
        let imageUrl = formData.image_url;
        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `class_${Math.random()}.${fileExt}`;
          const filePath = `classes/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, selectedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        // Remove id field for new class to avoid duplicate key constraint
        const { id: _id, ...newClassData } = formData;
        const { error } = await supabase
          .from(TABLES.CLASSES)
          .insert([{ ...newClassData, image_url: imageUrl }]);

        if (error) throw error;
        toast.success('Class added successfully');
      }

      onSuccess();
      onClose();
      // Reset form data after successful submission
      setFormData({
        name: '',
        description: '',
        duration: '',
        instructor: '',
        price: '',
        schedule: '',
        max_students: '',
        level: 'beginner'
      });
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Error saving class');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editData ? 'Edit Class' : 'Add New Class'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter class name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 60 minutes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor *
              </label>
              <input
                type="text"
                required
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter instructor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter price in ₹"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule *
              </label>
              <input
                type="text"
                required
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Monday, Wednesday, Friday 6:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Students
              </label>
              <input
                type="number"
                value={formData.max_students}
                onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter max students"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level *
              </label>
              <select
                required
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all-levels">All Levels</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Image
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Class preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, image_url: '' });
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* File Upload */}
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="class-image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>Upload an image</span>
                      <input
                        id="class-image-upload"
                        name="class-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onload = (e) => setImagePreview(e.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  {selectedFile && (
                    <p className="text-sm text-indigo-600">{selectedFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <TextEditor
              id="class-description-editor"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Enter class description"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : (editData ? 'Update Class' : 'Add Class')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export const CourseForm = ({ isOpen, onClose, editData = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    instructor: '',
    level: 'beginner',
    modules: '',
    certificate: false,
    image_url: '',
    learning_objectives: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [newObjective, setNewObjective] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        learning_objectives: editData.learning_objectives || []
      });
      setImagePreview(editData.image_url || '');
      setSelectedFile(null);
    } else {
      // Reset form data for new course
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        instructor: '',
        level: 'beginner',
        modules: '',
        certificate: false,
        image_url: '',
        learning_objectives: []
      });
      setImagePreview('');
      setSelectedFile(null);
    }
  }, [editData]);

  const addLearningObjective = () => {
    if (newObjective.trim()) {
      setFormData({
        ...formData,
        learning_objectives: [...formData.learning_objectives, newObjective.trim()]
      });
      setNewObjective('');
    }
  };

  const removeLearningObjective = (index) => {
    setFormData({
      ...formData,
      learning_objectives: formData.learning_objectives.filter((_, i) => i !== index)
    });
  };

  const moveObjective = (index, direction) => {
    const newObjectives = [...formData.learning_objectives];
    if (direction === 'up' && index > 0) {
      [newObjectives[index], newObjectives[index - 1]] = [newObjectives[index - 1], newObjectives[index]];
    } else if (direction === 'down' && index < newObjectives.length - 1) {
      [newObjectives[index], newObjectives[index + 1]] = [newObjectives[index + 1], newObjectives[index]];
    }
    setFormData({ ...formData, learning_objectives: newObjectives });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editData) {
        // Handle image upload if file is selected
        let imageUrl = formData.image_url;
        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `course_${Math.random()}.${fileExt}`;
          const filePath = `courses/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, selectedFile);

          if (uploadError) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        const { error } = await supabase
          .from(TABLES.COURSES)
          .update({ ...formData, image_url: imageUrl })
          .eq('id', editData.id);

        if (error) throw error;
        toast.success('Course updated successfully');
      } else {
        // Handle image upload if file is selected
        let imageUrl = formData.image_url;
        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `course_${Math.random()}.${fileExt}`;
          const filePath = `courses/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, selectedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        // Remove id field for new course to avoid duplicate key constraint
        const { id: _id, ...newCourseData } = formData;
        const { error } = await supabase
          .from(TABLES.COURSES)
          .insert([{ ...newCourseData, image_url: imageUrl }]);

        if (error) throw error;
        toast.success('Course added successfully');
      }

      onSuccess();
      onClose();
      // Reset form data after successful submission
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        instructor: '',
        level: 'beginner',
        modules: '',
        certificate: false
      });
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Error saving course');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editData ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter course name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 8 weeks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor *
              </label>
              <input
                type="text"
                required
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter instructor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter price in ₹"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level *
              </label>
              <select
                required
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all-levels">All Levels</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="certificate"
                checked={formData.certificate}
                onChange={(e) => setFormData({ ...formData, certificate: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="certificate" className="ml-2 block text-sm text-gray-700">
                Certificate included
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <TextEditor
              id="course-description-editor"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Enter course description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Objectives
            </label>
            <div className="space-y-3">
              {/* Add new objective */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLearningObjective()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter a learning objective"
                />
                <button
                  type="button"
                  onClick={addLearningObjective}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Display existing objectives */}
              {formData.learning_objectives.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Current learning objectives:</p>
                  {formData.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-sm">{objective}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveObjective(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveObjective(index, 'down')}
                          disabled={index === formData.learning_objectives.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLearningObjective(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Image
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Course preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, image_url: '' });
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* File Upload */}
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="course-image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>Upload an image</span>
                      <input
                        id="course-image-upload"
                        name="course-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onload = (e) => setImagePreview(e.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  {selectedFile && (
                    <p className="text-sm text-indigo-600">{selectedFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Modules
            </label>
            <TextEditor
              id="course-modules-editor"
              value={formData.modules}
              onChange={(value) => setFormData({ ...formData, modules: value })}
              placeholder="Enter course modules (one per line)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : (editData ? 'Update Course' : 'Add Course')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export const GalleryUploadForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from(TABLES.GALLERY)
        .insert([{
          ...formData,
          url: publicUrl,
          filename: fileName
        }]);

      if (dbError) throw dbError;

      toast.success('Image uploaded successfully');
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', category: 'general' });
      setSelectedFile(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Upload Gallery Image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image *
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Gallery preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setSelectedFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* File Upload */}
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onload = (e) => setImagePreview(e.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  {selectedFile && (
                    <p className="text-sm text-indigo-600">{selectedFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter image title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="classes">Classes</option>
                <option value="events">Events</option>
                <option value="studio">Studio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter image description"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export const TestimonialForm = ({ isOpen, onClose, editData = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Student',
    content: '',
    rating: 5,
    image_url: '',
    featured: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
      setImagePreview(editData.image_url || '');
      setSelectedFile(null);
    } else {
      // Reset form data for new testimonial
      setFormData({
        name: '',
        role: 'Student',
        content: '',
        rating: 5,
        image_url: '',
        featured: false
      });
      setImagePreview('');
      setSelectedFile(null);
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editData) {
        // Handle image upload if file is selected
        let imageUrl = formData.image_url;
        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `testimonial_${Math.random()}.${fileExt}`;
          const filePath = `testimonials/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, selectedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        const { error } = await supabase
          .from('testimonials')
          .update({ ...formData, image_url: imageUrl })
          .eq('id', editData.id);

        if (error) throw error;
        toast.success('Testimonial updated successfully');
      } else {
        // Handle image upload if file is selected
        let imageUrl = formData.image_url;
        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `testimonial_${Math.random()}.${fileExt}`;
          const filePath = `testimonials/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, selectedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        // Remove id field for new testimonial to avoid duplicate key constraint
        const { id: _id, ...newTestimonialData } = formData;
        const { error } = await supabase
          .from('testimonials')
          .insert([{ ...newTestimonialData, image_url: imageUrl }]);

        if (error) throw error;
        toast.success('Testimonial added successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Error saving testimonial');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editData ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Student, Teacher, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter testimonial content"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
                <option value={3}>⭐⭐⭐ (3 stars)</option>
                <option value={2}>⭐⭐ (2 stars)</option>
                <option value={1}>⭐ (1 star)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Featured Testimonial
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-full border-2 border-gray-300"
                  />
                </div>
              )}

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="testimonial-image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input
                        id="testimonial-image-upload"
                        name="testimonial-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onload = (e) => setImagePreview(e.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  {selectedFile && (
                    <p className="text-sm text-indigo-600">{selectedFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : (editData ? 'Update Testimonial' : 'Add Testimonial')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export const FaqForm = ({ isOpen, onClose, editData, onSuccess }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    order_index: 0,
    related_links: '',
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        question: editData.question || '',
        answer: editData.answer || '',
        category: editData.category || '',
        order_index: editData.order_index || 0,
        related_links: editData.related_links || '',
        is_active: editData.is_active !== undefined ? editData.is_active : true
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        category: '',
        order_index: 0,
        related_links: '',
        is_active: true
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editData) {
        // Update existing FAQ
        const { error } = await supabase
          .from(TABLES.FAQ)
          .update(formData)
          .eq('id', editData.id);

        if (error) throw error;
        toast.success('FAQ updated successfully');
      } else {
        // Create new FAQ
        const { error } = await supabase
          .from(TABLES.FAQ)
          .insert([formData]);

        if (error) throw error;
        toast.success('FAQ created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Error saving FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {editData ? 'Edit FAQ' : 'Add New FAQ'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question *
            </label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter the question"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer *
            </label>
            <textarea
              required
              rows={4}
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter the detailed answer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Getting Started, Classes, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Index
              </label>
              <input
                type="number"
                min="0"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Links
            </label>
            <textarea
              rows={2}
              value={formData.related_links}
              onChange={(e) => setFormData({ ...formData, related_links: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter related links (one per line)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter one URL per line for related links
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active (visible to public)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (editData ? 'Update FAQ' : 'Create FAQ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ContentEditForm = ({ isOpen, onClose, editData = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    page: '',
    section: '',
    key: '',
    value: '',
    type: 'text'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        value: editData.type === 'json' ? JSON.stringify(editData.value, null, 2) : editData.value
      });
      setPreviewUrl(editData.type === 'image_url' ? editData.value : null);
    }
    // Clean up preview URL on unmount
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [editData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalValue = formData.value;

      // Handle Image Upload
      if (formData.type === 'image_url' && selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `cms_${Date.now()}.${fileExt}`;
        const filePath = `cms/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        finalValue = publicUrl;
      } else if (formData.type === 'json') {
        try {
          finalValue = typeof formData.value === 'string' ? JSON.parse(formData.value) : formData.value;
        } catch (err) {
          toast.error('Invalid JSON format');
          setIsSubmitting(false);
          return;
        }
      }

      // Use UPSERT for maximum reliability. If ID doesn't match for some reason,
      // the unique constraint on (page, section, key) will still target the right row.
      const { error } = await supabase
        .from(TABLES.SITE_CONTENT)
        .upsert({
          id: formData.id, // Try to use ID first
          page: formData.page,
          section: formData.section,
          key: formData.key,
          value: finalValue,
          type: formData.type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page,section,key', // FALLBACK: Use unique keys if ID is missing/wrong
          ignoreDuplicates: false
        });

      if (error) {
        throw new Error(error.message || 'Database update failed');
      }

      toast.success('Content updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating content:', err);
      toast.error('Error updating content');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-2xl mr-4">
              {formData.type === 'json' ? <CogIcon className="h-6 w-6 text-indigo-600" /> :
                formData.type === 'image_url' ? <PhotoIcon className="h-6 w-6 text-indigo-600" /> :
                  <PencilIcon className="h-6 w-6 text-indigo-600" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Modify Content</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider">{formData.page}</span>
                <span className="text-gray-300 text-xs">/</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider">{formData.section}</span>
                <span className="text-gray-300 text-xs">/</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase tracking-wider">{formData.key}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Data Format
              </label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none text-sm"
                >
                  <option value="text">Rich/Plain Text</option>
                  <option value="json">Structured Data (JSON)</option>
                  <option value="image_url">Image Link / URL</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
            </div>

            {formData.type === 'image_url' && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Image Preview</label>
                <div className="h-20 w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center p-1 relative group">
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => { e.target.src = 'https://placehold.co/100?text=Invalid+Link'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">Current Preview</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <PhotoIcon className="h-8 w-8 text-gray-300 mx-auto" />
                      <span className="text-[10px] text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 flex justify-between items-center">
              {formData.type === 'image_url' ? 'Image Upload' : 'Content Value'}
              {formData.type === 'json' && (
                <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Valid JSON Required</span>
              )}
            </label>

            {formData.type === 'image_url' ? (
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <input
                      type="file"
                      id="cms-image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="cms-image-upload"
                      className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all cursor-pointer text-sm font-bold w-full"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {selectedFile ? 'Change Selected File' : 'Upload New Image'}
                    </label>
                  </div>
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 mt-2 bg-indigo-50 border border-indigo-100 p-2 rounded-lg animate-in slide-in-from-top-1">
                    <div className="w-10 h-10 rounded-md bg-white border overflow-hidden">
                      {previewUrl && <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-900 font-bold truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-500">Ready to sync to cloud</p>
                    </div>
                  </div>
                )}
              </div>
            ) : formData.type === 'text' ? (
              <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <TextEditor
                  id="content-value-editor"
                  value={formData.value}
                  onChange={(val) => setFormData({ ...formData, value: val })}
                  placeholder="Type your content here..."
                />
              </div>
            ) : (
              <textarea
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                rows={10}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-sm leading-relaxed"
                placeholder={formData.type === 'json' ? 'Enter JSON data format (e.g. ["item1", "item2"])...' : 'Paste the image or resource link here...'}
              />
            )}
            {formData.type === 'json' && (
              <p className="text-[11px] text-gray-400 pl-1">
                Use JSON for lists (arrays `[]`) or complex objects (`{ }`).
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                  Applying...
                </div>
              ) : 'Update Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TeamMemberForm = ({ isOpen, onClose, editData, onSuccess }) => {
  const [members, setMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    certifications: []
  });
  const [newCert, setNewCert] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [memberPreviewUrl, setMemberPreviewUrl] = useState('');

  useEffect(() => {
    if (editData && editData.value) {
      try {
        const parsed = typeof editData.value === 'string' ? JSON.parse(editData.value) : editData.value;
        setMembers(parsed.members || []);
      } catch (e) {
        console.error('Error parsing members JSON:', e);
        setMembers([]);
      }
    }
  }, [editData]);

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = memberForm.image;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `team_${Date.now()}.${fileExt}`;
        const filePath = `about/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const updatedMember = { ...memberForm, image: imageUrl };
      const newMembers = [...members];

      if (editingMemberIndex !== null) {
        newMembers[editingMemberIndex] = updatedMember;
      } else {
        newMembers.push(updatedMember);
      }

      setMembers(newMembers);
      setShowMemberModal(false);
      resetMemberForm();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Error saving member image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      role: '',
      bio: '',
      image: '',
      certifications: []
    });
    setEditingMemberIndex(null);
    setSelectedFile(null);
    setMemberPreviewUrl('');
    setNewCert('');
  };

  const openAddMember = () => {
    resetMemberForm();
    setShowMemberModal(true);
  };

  const openEditMember = (index) => {
    setMemberForm(members[index]);
    setEditingMemberIndex(index);
    setMemberPreviewUrl(members[index].image || '');
    setShowMemberModal(true);
  };

  const deleteMember = (index) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
    }
  };

  const moveMember = (index, direction) => {
    const newMembers = [...members];
    if (direction === 'up' && index > 0) {
      [newMembers[index], newMembers[index - 1]] = [newMembers[index - 1], newMembers[index]];
    } else if (direction === 'down' && index < newMembers.length - 1) {
      [newMembers[index], newMembers[index + 1]] = [newMembers[index + 1], newMembers[index]];
    }
    setMembers(newMembers);
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalValue = { members };

      const { error } = await supabase
        .from(TABLES.SITE_CONTENT)
        .upsert({
          id: editData.id,
          page: editData.page,
          section: editData.section,
          key: editData.key,
          value: finalValue,
          type: 'json',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page,section,key'
        });

      if (error) throw error;
      toast.success('Team members updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving team list:', error);
      toast.error('Error saving team list');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="px-8 py-7 bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <UserGroupIcon className="h-8 w-8 text-indigo-200" />
              Team Management
            </h2>
            <p className="text-indigo-100 text-xs font-semibold uppercase tracking-widest mt-1 opacity-80">Refine the academy's faces</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {members.map((member, index) => (
              <div key={index} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex gap-5 items-center group hover:shadow-md hover:border-indigo-100 transition-all">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-4 border-gray-50 shadow-inner">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 truncate leading-tight">{member.name}</h4>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-3">{member.role}</p>

                  <div className="flex gap-2">
                    <button onClick={() => moveMember(index, 'up')} disabled={index === 0} className="p-2 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all disabled:opacity-20 shadow-sm border border-gray-100">
                      <ChevronDownIcon className="h-4 w-4 rotate-180" />
                    </button>
                    <button onClick={() => moveMember(index, 'down')} disabled={index === members.length - 1} className="p-2 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all disabled:opacity-20 shadow-sm border border-gray-100">
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    <div className="flex-1"></div>
                    <button onClick={() => openEditMember(index)} className="p-2 bg-indigo-50/50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-100/50">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteMember(index)} className="p-2 bg-red-50/50 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all shadow-sm border border-red-100/50">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={openAddMember}
              className="border-3 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center transition-colors">
                <PlusIcon className="h-6 w-6 text-gray-400 group-hover:text-indigo-600" />
              </div>
              <span className="font-black text-sm text-gray-400 group-hover:text-indigo-600 uppercase tracking-widest">Enlist New Face</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-7 bg-white border-t border-gray-100 flex justify-end items-center gap-6 shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">
            Cancel
          </button>
          <button
            onClick={handleSubmitAll}
            disabled={isSubmitting}
            className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black shadow-xl shadow-gray-200 transition-all disabled:opacity-50 ring-offset-2 hover:ring-2 ring-gray-900"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Publishing List...</span>
              </div>
            ) : 'Publish Team Changes'}
          </button>
        </div>
      </motion.div>

      {/* Member Secondary Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
          >
            <form onSubmit={handleSaveMember} className="flex flex-col h-full">
              <div className="p-8 pb-4">
                <h3 className="text-2xl font-black text-gray-900">
                  {editingMemberIndex !== null ? 'Fine-tune Profile' : 'New Profile Entry'}
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Personnel Details</p>
              </div>

              <div className="flex-1 overflow-y-auto px-8 space-y-6 pb-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Professional Portrait</label>
                  <div className="flex items-center gap-6">
                    <div className="w-28 h-28 rounded-3xl bg-gray-50 border-2 border-gray-100 overflow-hidden flex-shrink-0 shadow-inner">
                      {memberPreviewUrl ? (
                        <img src={memberPreviewUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <PhotoIcon className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <label className="flex-1 flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-100 rounded-3xl hover:bg-indigo-50/30 hover:border-indigo-200 cursor-pointer transition-all group">
                      <PlusIcon className="h-6 w-6 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Select File</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            setMemberPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                      value={memberForm.name}
                      placeholder="e.g. Elena Rodriguez"
                      onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Professional Role</label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                      value={memberForm.role}
                      placeholder="e.g. Master Breathwork Specialist"
                      onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Biography / Expertise</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none transition-all font-medium text-sm leading-relaxed"
                    value={memberForm.bio}
                    placeholder="Tell the story of their expertise..."
                    onChange={e => setMemberForm({ ...memberForm, bio: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Verified Certifications</label>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      className="flex-1 px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                      value={newCert}
                      onChange={e => setNewCert(e.target.value)}
                      placeholder="e.g. RYT-500 Advanced"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newCert.trim()) {
                            setMemberForm({ ...memberForm, certifications: [...memberForm.certifications, newCert.trim()] });
                            setNewCert('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCert.trim()) {
                          setMemberForm({ ...memberForm, certifications: [...memberForm.certifications, newCert.trim()] });
                          setNewCert('');
                        }
                      }}
                      className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {memberForm.certifications.map((cert, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-2 border border-indigo-100/50 group/cert">
                        {cert}
                        <button type="button" onClick={() => setMemberForm({ ...memberForm, certifications: memberForm.certifications.filter((_, idx) => idx !== i) })} className="hover:text-red-600 transition-colors">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-50 flex justify-end gap-4 shrink-0 bg-gray-50/20">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {isSubmitting ? 'Processing...' : 'Ready'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

