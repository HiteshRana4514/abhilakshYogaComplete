import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, TABLES } from '../utils/supabase';
import { XMarkIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
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

 