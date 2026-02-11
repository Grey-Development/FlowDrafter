import React, { useState, useRef } from 'react';
import { ProjectInput } from '../types';

interface Props {
  onSubmit: (input: ProjectInput) => void;
  disabled: boolean;
}

// Compress image using canvas - keeps quality good for AI analysis while reducing size
async function compressImage(file: File, maxWidth = 2000, quality = 0.8): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG (better compression than PNG)
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve({ dataUrl, mimeType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

const ProjectForm: React.FC<Props> = ({ onSubmit, disabled }) => {
  const [projectName, setProjectName] = useState('');
  const [waterSupplySize, setWaterSupplySize] = useState<0.75 | 1 | 1.5 | 2>(1);
  const [staticPressurePSI, setStaticPressurePSI] = useState(60);
  const [soilType, setSoilType] = useState<'clay' | 'loam' | 'sand'>('clay');
  const [turfType, setTurfType] = useState<'bermudagrass' | 'fescue' | 'zoysia' | 'centipede' | 'st-augustine'>('bermudagrass');
  const [applicationType, setApplicationType] = useState<'commercial' | 'multifamily' | 'athletic-field' | 'hoa-common-area'>('commercial');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [compressedMimeType, setCompressedMimeType] = useState<string>('image/jpeg');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scale/dimension fields
  const [propertyWidthFt, setPropertyWidthFt] = useState<number | ''>('');
  const [propertyLengthFt, setPropertyLengthFt] = useState<number | ''>('');
  const [scaleReferenceFt, setScaleReferenceFt] = useState<number | ''>('');
  const [scaleReferenceDescription, setScaleReferenceDescription] = useState('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('File is too large. Maximum size is 20MB.');
      return;
    }

    setImageFile(file);
    setIsCompressing(true);

    try {
      // Compress image to reduce size for API upload
      const { dataUrl, mimeType } = await compressImage(file, 2000, 0.85);
      setImagePreview(dataUrl);
      setCompressedMimeType(mimeType);

      // Log compression results
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (dataUrl.length * 0.75 / 1024 / 1024).toFixed(2); // base64 is ~33% larger
      console.log(`Image compressed: ${originalSize}MB → ~${compressedSize}MB`);
    } catch (err) {
      console.error('Compression failed, using original:', err);
      // Fallback to original if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setCompressedMimeType(file.type);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !imagePreview || !projectName.trim() || isCompressing) return;

    // Require at least property dimensions OR a scale reference
    const hasPropertyDimensions = propertyWidthFt && propertyLengthFt;
    const hasScaleReference = scaleReferenceFt && scaleReferenceDescription.trim();
    if (!hasPropertyDimensions && !hasScaleReference) {
      alert('Please provide either property dimensions (width & length) or a scale reference.');
      return;
    }

    const base64 = imagePreview.split(',')[1];
    onSubmit({
      projectName: projectName.trim(),
      waterSupplySize,
      staticPressurePSI,
      soilType,
      turfType,
      applicationType,
      droneImageBase64: base64,
      droneImageMimeType: compressedMimeType,
      droneImagePreviewUrl: imagePreview,
      propertyWidthFt: propertyWidthFt || undefined,
      propertyLengthFt: propertyLengthFt || undefined,
      scaleReferenceFt: scaleReferenceFt || undefined,
      scaleReferenceDescription: scaleReferenceDescription.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Irrigation Plan Design
        </h2>
        <p className="mt-2 text-gray-500">
          Upload a drone photo and fill in project details to generate a professional irrigation plan set.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
        {/* Image Upload */}
        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-2">Drone Image</span>
          <label
            htmlFor="drone-image-upload"
            onClick={() => fileInputRef.current?.click()}
            className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              imagePreview ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
            }`}
          >
            {imagePreview ? (
              <div className="space-y-3">
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
                <p className="text-sm text-emerald-700 font-medium">{imageFile?.name}</p>
                <p className="text-xs text-gray-400">Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-500 font-medium">Click to upload drone image</p>
                <p className="text-xs text-gray-400">JPG or PNG, max 20MB</p>
              </div>
            )}
            <input
              id="drone-image-upload"
              ref={fileInputRef}
              type="file"
              className="absolute w-0 h-0 opacity-0 overflow-hidden"
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden' }}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="e.g., Patriots Square - Phase 2 Irrigation"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required
          />
        </div>

        {/* Property Scale/Dimensions - Required for accurate measurements */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-blue-900 mb-1">Property Scale (Required)</h3>
            <p className="text-xs text-blue-700">Provide property dimensions OR a known distance for accurate measurements.</p>
          </div>

          {/* Property Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Property Width (ft)</label>
              <input
                type="number"
                value={propertyWidthFt}
                onChange={e => setPropertyWidthFt(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="e.g., 150"
                min={10}
                max={2000}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Property Length (ft)</label>
              <input
                type="number"
                value={propertyLengthFt}
                onChange={e => setPropertyLengthFt(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="e.g., 200"
                min={10}
                max={2000}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">— OR use a known distance —</div>

          {/* Scale Reference */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Known Distance (ft)</label>
              <input
                type="number"
                value={scaleReferenceFt}
                onChange={e => setScaleReferenceFt(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="e.g., 20"
                min={1}
                max={500}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">What is it?</label>
              <input
                type="text"
                value={scaleReferenceDescription}
                onChange={e => setScaleReferenceDescription(e.target.value)}
                placeholder="e.g., driveway width"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Grid of dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Water Supply Size</label>
            <select
              value={waterSupplySize}
              onChange={e => setWaterSupplySize(parseFloat(e.target.value) as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value={0.75}>3/4 inch</option>
              <option value={1}>1 inch</option>
              <option value={1.5}>1.5 inch</option>
              <option value={2}>2 inch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Static Water Pressure (PSI)</label>
            <input
              type="number"
              value={staticPressurePSI}
              onChange={e => setStaticPressurePSI(parseInt(e.target.value) || 60)}
              min={20}
              max={120}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Soil Type</label>
            <select
              value={soilType}
              onChange={e => setSoilType(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="clay">Clay</option>
              <option value="loam">Loam</option>
              <option value="sand">Sand</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Turf Type</label>
            <select
              value={turfType}
              onChange={e => setTurfType(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="bermudagrass">Bermudagrass</option>
              <option value="fescue">Fescue</option>
              <option value="zoysia">Zoysia</option>
              <option value="centipede">Centipede</option>
              <option value="st-augustine">St. Augustine</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Application Type</label>
            <select
              value={applicationType}
              onChange={e => setApplicationType(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="commercial">Commercial</option>
              <option value="multifamily">Multifamily Residential</option>
              <option value="athletic-field">Athletic Field</option>
              <option value="hoa-common-area">HOA Common Area</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !imageFile || !projectName.trim() || isCompressing}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.01]"
        >
          {isCompressing ? 'Optimizing Image...' : 'Analyze Site and Generate Plan'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
