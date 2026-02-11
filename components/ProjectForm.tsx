import React, { useState, useRef } from 'react';
import { ProjectInput, ImageMarkup } from '../types';
import ImageMarkupComponent from './ImageMarkup';

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

type FormStep = 'upload' | 'markup' | 'details';

const ProjectForm: React.FC<Props> = ({ onSubmit, disabled }) => {
  const [step, setStep] = useState<FormStep>('upload');
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
  const [imageMarkup, setImageMarkup] = useState<ImageMarkup>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('File is too large. Maximum size is 20MB.');
      return;
    }

    setImageFile(file);
    setIsCompressing(true);
    setImageMarkup({}); // Reset markup when new image is uploaded

    try {
      // Compress image to reduce size for API upload
      const { dataUrl, mimeType } = await compressImage(file, 2000, 0.85);
      setImagePreview(dataUrl);
      setCompressedMimeType(mimeType);

      // Log compression results
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (dataUrl.length * 0.75 / 1024 / 1024).toFixed(2);
      console.log(`Image compressed: ${originalSize}MB → ~${compressedSize}MB`);

      // Move to markup step
      setStep('markup');
    } catch (err) {
      console.error('Compression failed, using original:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setCompressedMimeType(file.type);
        setStep('markup');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !imagePreview || !projectName.trim() || isCompressing) return;

    // Validate markup - scale is required
    if (!imageMarkup.scaleReference) {
      alert('Please set the scale reference by marking two points and entering the distance.');
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
      imageMarkup,
    });
  };

  const canProceedToDetails = imageMarkup.scaleReference !== undefined;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Irrigation Plan Design
        </h2>
        <p className="mt-2 text-gray-500">
          Upload a drone photo, mark key locations, and fill in project details.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8 gap-2">
        {['upload', 'markup', 'details'].map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                step === s
                  ? 'bg-emerald-600 text-white'
                  : ['upload', 'markup', 'details'].indexOf(step) > i
                    ? 'bg-emerald-200 text-emerald-700'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="w-12 h-0.5 bg-gray-300"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Step 1: Upload Drone Image</h3>
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isCompressing ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {isCompressing ? (
              <div className="space-y-2">
                <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-emerald-700 font-medium">Optimizing image...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-700 font-medium text-lg">Click to upload drone image</p>
                <p className="text-sm text-gray-400">JPG or PNG, max 20MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
        </div>
      )}

      {/* Step 2: Markup */}
      {step === 'markup' && imagePreview && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Step 2: Mark Key Locations</h3>
            <button
              type="button"
              onClick={() => { setStep('upload'); setImagePreview(''); setImageFile(null); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Change Image
            </button>
          </div>

          <ImageMarkupComponent
            imageUrl={imagePreview}
            markup={imageMarkup}
            onMarkupChange={setImageMarkup}
          />

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep('details')}
              disabled={!canProceedToDetails}
              className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all"
            >
              {canProceedToDetails ? 'Continue to Project Details' : 'Set Scale Reference to Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Project Details */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Step 3: Project Details</h3>
            <button
              type="button"
              onClick={() => setStep('markup')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Markup
            </button>
          </div>

          {/* Image Preview (small) */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img src={imagePreview} alt="Site" className="w-24 h-24 object-cover rounded-lg" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">{imageFile?.name}</p>
              <p>Scale: {imageMarkup.scaleReference?.distanceFt} ft reference set</p>
              {imageMarkup.controllerLocation && <p>Controller location marked</p>}
              {imageMarkup.waterSourceLocation && <p>Water source marked</p>}
              {(imageMarkup.irrigationAreas?.length || 0) > 0 && (
                <p>{imageMarkup.irrigationAreas?.length} irrigation area(s) marked</p>
              )}
            </div>
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
            disabled={disabled || !projectName.trim()}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.01]"
          >
            Analyze Site and Generate Plan
          </button>
        </form>
      )}
    </div>
  );
};

export default ProjectForm;
