import React, { useState } from 'react';
import Header from './components/Header';
import ProjectForm from './components/ProjectForm';
import SiteAnalysisView from './components/SiteAnalysisView';
import PlanPreview from './components/PlanPreview';
import ExportControls from './components/ExportControls';
import { analyzeSite } from './services/geminiService';
import { generateIrrigationDesign } from './engine/designEngine';
import { renderAllSheets, renderIrrigationLayerFeet } from './renderer/svgRenderer';
import { generateSitePlanFromAnalysis } from './services/sitePlanGenerator';
import { composePlanSheets } from './services/planCompositor';
import { AppState, WorkflowStatus, ProjectInput } from './types';

type PreviewMode = 'combined' | 'sitePlan' | 'irrigation';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    projectInput: null,
    siteAnalysis: null,
    sitePlanSvg: null,
    irrigationSvg: null,
    design: null,
    planSheets: [],
    status: WorkflowStatus.IDLE,
    error: null,
    progress: '',
  });
  const [activeSheet, setActiveSheet] = useState(0);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('combined');

  const handleProjectSubmit = async (input: ProjectInput) => {
    setState(prev => ({
      ...prev,
      projectInput: input,
      status: WorkflowStatus.ANALYZING,
      error: null,
      progress: 'Analyzing drone image with AI...',
    }));

    try {
      const analysis = await analyzeSite(
        input.droneImageBase64,
        input.droneImageMimeType,
        input
      );

      setState(prev => ({
        ...prev,
        siteAnalysis: analysis,
        status: WorkflowStatus.ANALYSIS_COMPLETE,
        progress: '',
      }));
    } catch (err) {
      console.error('Site analysis failed:', err);
      setState(prev => ({
        ...prev,
        status: WorkflowStatus.ERROR,
        error: 'Site analysis failed. Please check your API key and try again.',
        progress: '',
      }));
    }
  };

  const handleGenerateSitePlan = async () => {
    if (!state.siteAnalysis || !state.projectInput) return;

    setState(prev => ({
      ...prev,
      status: WorkflowStatus.GENERATING_SITE_PLAN,
      progress: 'Generating architectural site plan...',
    }));

    try {
      // Step 1: Generate clean 2D architectural site plan
      const sitePlanSvg = generateSitePlanFromAnalysis(state.siteAnalysis);

      setState(prev => ({
        ...prev,
        sitePlanSvg,
        status: WorkflowStatus.SITE_PLAN_COMPLETE,
        progress: '',
      }));
    } catch (err) {
      console.error('Site plan generation failed:', err);
      setState(prev => ({
        ...prev,
        status: WorkflowStatus.ERROR,
        error: 'Site plan generation failed. ' + (err instanceof Error ? err.message : ''),
        progress: '',
      }));
    }
  };

  const handleGenerateDesign = async () => {
    if (!state.siteAnalysis || !state.projectInput || !state.sitePlanSvg) return;

    setState(prev => ({
      ...prev,
      status: WorkflowStatus.DESIGNING,
      progress: 'Running irrigation design engine...',
    }));

    try {
      // Step 2: Run the deterministic design engine
      const design = generateIrrigationDesign(state.siteAnalysis, state.projectInput);

      setState(prev => ({
        ...prev,
        progress: 'Generating irrigation layer...',
      }));

      // Generate standalone irrigation layer SVG for preview
      const irrigationSvg = renderIrrigationLayerFeet(
        design,
        state.siteAnalysis.propertyWidthFt,
        state.siteAnalysis.propertyLengthFt
      );

      setState(prev => ({
        ...prev,
        progress: 'Composing plan sheets...',
      }));

      // Step 3: Compose final plan sheets with both layers
      const compositorOutput = composePlanSheets({
        sitePlanSvg: state.sitePlanSvg,
        projectInput: state.projectInput,
        design,
        siteAnalysis: state.siteAnalysis,
      });
      const sheets = compositorOutput.sheets;

      setState(prev => ({
        ...prev,
        design,
        irrigationSvg,
        planSheets: sheets,
        status: WorkflowStatus.DESIGN_COMPLETE,
        progress: '',
      }));
    } catch (err) {
      console.error('Design generation failed:', err);
      setState(prev => ({
        ...prev,
        status: WorkflowStatus.ERROR,
        error: 'Design generation failed. ' + (err instanceof Error ? err.message : ''),
        progress: '',
      }));
    }
  };

  const handleReset = () => {
    setState({
      projectInput: null,
      siteAnalysis: null,
      sitePlanSvg: null,
      irrigationSvg: null,
      design: null,
      planSheets: [],
      status: WorkflowStatus.IDLE,
      error: null,
      progress: '',
    });
    setActiveSheet(0);
    setPreviewMode('combined');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Error Display */}
        {state.error && (
          <div className="max-w-lg mx-auto mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center space-x-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="flex-1">{state.error}</span>
            <button onClick={handleReset} className="underline font-bold">Start Over</button>
          </div>
        )}

        {/* Progress Indicator */}
        {(state.status === WorkflowStatus.ANALYZING ||
          state.status === WorkflowStatus.GENERATING_SITE_PLAN ||
          state.status === WorkflowStatus.DESIGNING ||
          state.status === WorkflowStatus.EXPORTING) && (
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
              <div className="inline-block">
                <svg className="animate-spin h-10 w-10 text-emerald-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">{state.progress}</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {['Analyze', 'Site Plan', 'Design', 'Compose', 'Export'].map((step, i) => {
                  const stepStatuses = [
                    WorkflowStatus.ANALYZING,
                    WorkflowStatus.GENERATING_SITE_PLAN,
                    WorkflowStatus.DESIGNING,
                    WorkflowStatus.DESIGNING,
                    WorkflowStatus.EXPORTING
                  ];
                  const isActive = state.status === stepStatuses[i];
                  const isPast = stepStatuses.indexOf(state.status) > i;
                  return (
                    <div key={step} className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isActive ? 'bg-emerald-100 text-emerald-700' :
                      isPast ? 'bg-gray-200 text-gray-500' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Project Form */}
        {state.status === WorkflowStatus.IDLE && (
          <ProjectForm onSubmit={handleProjectSubmit} disabled={false} />
        )}

        {/* Step 2: Site Analysis Review */}
        {state.status === WorkflowStatus.ANALYSIS_COMPLETE && state.siteAnalysis && (
          <SiteAnalysisView
            analysis={state.siteAnalysis}
            onContinue={handleGenerateSitePlan}
          />
        )}

        {/* Step 3: Site Plan Preview */}
        {state.status === WorkflowStatus.SITE_PLAN_COMPLETE && state.sitePlanSvg && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Architectural Site Plan</h2>
              <p className="text-gray-500">Clean 2D site plan generated from drone image analysis</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div
                className="w-full aspect-[3/2] border border-gray-100 rounded-lg overflow-hidden bg-white"
                dangerouslySetInnerHTML={{ __html: state.sitePlanSvg }}
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleGenerateDesign}
                className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
              >
                Generate Irrigation Design →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Design Complete - Plan Preview + Export */}
        {state.status === WorkflowStatus.DESIGN_COMPLETE && state.design && state.planSheets.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{state.projectInput?.projectName}</h2>
                <p className="text-gray-500">
                  {state.design.totalZones} zones | {state.design.totalSystemGPM} GPM | {state.design.heads.length} heads
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-white transition-colors"
              >
                New Project
              </button>
            </div>

            {/* Layer Preview Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">View Layer:</span>
                <div className="flex gap-2">
                  {[
                    { value: 'combined', label: 'Combined' },
                    { value: 'sitePlan', label: 'Site Plan' },
                    { value: 'irrigation', label: 'Irrigation' },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setPreviewMode(mode.value as PreviewMode)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        previewMode === mode.value
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Layer Previews */}
            {previewMode !== 'combined' && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-4">
                  {previewMode === 'sitePlan' ? 'Site Plan Layer' : 'Irrigation Layer'}
                </h3>
                <div
                  className="w-full aspect-[3/2] border border-gray-100 rounded-lg overflow-hidden bg-white"
                  dangerouslySetInnerHTML={{
                    __html: previewMode === 'sitePlan'
                      ? (state.sitePlanSvg || '')
                      : (state.irrigationSvg || '')
                  }}
                />
              </div>
            )}

            {/* Combined Plan Preview */}
            {previewMode === 'combined' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <PlanPreview
                    sheets={state.planSheets}
                    activeSheet={activeSheet}
                    onSheetChange={setActiveSheet}
                  />
                </div>
                <div>
                  <ExportControls
                    sheets={state.planSheets}
                    design={state.design}
                    projectName={state.projectInput?.projectName || 'Project'}
                    exporting={state.status === WorkflowStatus.EXPORTING}
                    onExportStart={() => setState(prev => ({ ...prev, status: WorkflowStatus.EXPORTING }))}
                    onExportEnd={() => setState(prev => ({ ...prev, status: WorkflowStatus.DESIGN_COMPLETE }))}
                  />
                </div>
              </div>
            )}

            {/* Material Schedule */}
            {state.design.materialSchedule.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Material Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-gray-600">Item</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-600">Manufacturer</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-600">Model</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-600">Qty</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-600">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.design.materialSchedule.map((item, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-3 text-gray-800">{item.item}</td>
                          <td className="py-2 px-3 text-gray-600">{item.manufacturer}</td>
                          <td className="py-2 px-3 text-gray-600">{item.model}</td>
                          <td className="py-2 px-3 text-right font-mono text-gray-800">{item.quantity}</td>
                          <td className="py-2 px-3 text-gray-600">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Zone Schedule */}
            {state.design.zones.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Zone Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-gray-600">Zone</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-600">Head Type</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-600">Heads</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-600">GPM</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-600">Precip Rate</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-600">Runtime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.design.zones.map((zone, i) => (
                        <tr key={zone.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-3">
                            <span className="inline-flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }}></span>
                              Zone {zone.number}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-600">{zone.headType}</td>
                          <td className="py-2 px-3 text-right font-mono">{zone.heads.length}</td>
                          <td className="py-2 px-3 text-right font-mono">{zone.totalGPM}</td>
                          <td className="py-2 px-3 text-right font-mono">{zone.precipRateInPerHr} in/hr</td>
                          <td className="py-2 px-3 text-right font-mono">{zone.runtimeMinutes} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2026 Grey Development | Lawn Capital Enhancement Division | FlowDrafter Irrigation Design Tool
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
