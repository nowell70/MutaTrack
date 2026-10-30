import React, { useEffect, useState } from 'react';
import { Analysis, Variant } from './types';
import {
  getAnalysisById,
  getStoredAnalyses,
  getVariantsForAnalysis,
  saveAnalysis,
} from './services/storage';
import { executePipeline } from './services/pipelineRunner';
import { Header } from './components/Header';
import { Sidebar, ViewTab } from './components/Sidebar';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { NewAnalysisView } from './components/NewAnalysisView';
import { HistoryView } from './components/HistoryView';
import { ExampleAnalysisView } from './components/ExampleAnalysisView';
import { ResultsDetailView } from './components/ResultsDetailView';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewTab>('landing');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [isExecuting, setIsExecuting] = useState(false);
  const [liveLog, setLiveLog] = useState('');

  // Initial load
  useEffect(() => {
    refreshAnalyses();
  }, []);

  const refreshAnalyses = (targetId?: string) => {
    const list = getStoredAnalyses();
    setAnalyses(list);

    let active = null;
    if (targetId) {
      active = list.find((a) => a.id === targetId) || null;
    } else if (selectedAnalysis) {
      active = list.find((a) => a.id === selectedAnalysis.id) || null;
    }
    if (!active && list.length > 0) {
      active = list[0];
    }

    setSelectedAnalysis(active);
    if (active) {
      setVariants(getVariantsForAnalysis(active.id));
    }
  };

  const handleSelectAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setVariants(getVariantsForAnalysis(analysis.id));
    setCurrentView('results');
  };

  const handleRunPipeline = async (target: Analysis) => {
    if (isExecuting) return;

    setIsExecuting(true);
    setLiveLog('');

    const runningAnalysis: Analysis = {
      ...target,
      status: 'berjalan',
      stage: 'qc',
      updated_at: new Date().toISOString(),
    };
    saveAnalysis(runningAnalysis);
    setSelectedAnalysis(runningAnalysis);
    refreshAnalyses(runningAnalysis.id);

    try {
      const completed = await executePipeline(runningAnalysis, {
        onStageChange: (stage) => {
          setSelectedAnalysis((prev) => (prev ? { ...prev, stage } : prev));
        },
        onLog: (line) => {
          setLiveLog((prev) => prev + line + '\n');
        },
      });

      setSelectedAnalysis(completed);
      refreshAnalyses(completed.id);
      setVariants(getVariantsForAnalysis(completed.id));
    } catch (err: any) {
      const failed = getAnalysisById(target.id);
      if (failed) {
        setSelectedAnalysis(failed);
        refreshAnalyses(failed.id);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStartNewAnalysis = (newAnalysis: Analysis) => {
    refreshAnalyses(newAnalysis.id);
    setSelectedAnalysis(newAnalysis);
    setCurrentView('results');
    handleRunPipeline(newAnalysis);
  };

  const handleLogout = () => {
    logout();
    setCurrentView('landing');
  };

  const benchmarkAnalysis =
    analyses.find((a) => a.id === 'string' || a.nama === 'string') || analyses[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      {/* 1. If in Landing mode */}
      {currentView === 'landing' && (
        <div className="min-h-screen flex flex-col bg-white">
          <Header
            isLanding={true}
            onGoHome={() => setCurrentView('landing')}
            onOpenLogin={() => setCurrentView('auth')}
            onNewAnalysis={() => setCurrentView('new-analysis')}
          />
          <main className="flex-1">
            <LandingView
              onNewAnalysis={() => setCurrentView('new-analysis')}
              onOpenExample={() => setCurrentView('example')}
              onSelectRun={(id) => {
                const found = analyses.find((a) => a.id === id);
                if (found) handleSelectAnalysis(found);
              }}
            />
          </main>
        </div>
      )}

      {/* 2. If in Auth mode */}
      {currentView === 'auth' && (
        <AuthView
          onGoHome={() => setCurrentView('landing')}
          onSuccess={() => setCurrentView('dashboard')}
        />
      )}

      {/* 3. In-App Views with Sidebar & Top Bar */}
      {currentView !== 'landing' && currentView !== 'auth' && (
        <div className="min-h-screen flex flex-col bg-white">
          <Header
            isLanding={false}
            onGoHome={() => setCurrentView('landing')}
            onNewAnalysis={() => setCurrentView('new-analysis')}
          />

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar
              currentView={currentView}
              onSelectView={(v) => setCurrentView(v)}
              onLogout={handleLogout}
              onGoHome={() => setCurrentView('landing')}
            />

            {/* Main Stage View */}
            <main className="flex-1 overflow-y-auto bg-white">
              {currentView === 'dashboard' && (
                <DashboardView
                  analyses={analyses}
                  onNewAnalysis={() => setCurrentView('new-analysis')}
                  onOpenExample={() => setCurrentView('example')}
                  onViewHistory={() => setCurrentView('history')}
                  onSelectAnalysis={handleSelectAnalysis}
                  runningAnalysis={isExecuting ? selectedAnalysis : null}
                />
              )}

              {currentView === 'new-analysis' && (
                <NewAnalysisView onStartAnalysis={handleStartNewAnalysis} />
              )}

              {currentView === 'history' && (
                <HistoryView
                  analyses={analyses}
                  onSelectAnalysis={handleSelectAnalysis}
                />
              )}

              {currentView === 'example' && benchmarkAnalysis && (
                <ExampleAnalysisView
                  analysis={benchmarkAnalysis}
                  onOpenResults={handleSelectAnalysis}
                />
              )}

              {currentView === 'results' && selectedAnalysis && (
                <ResultsDetailView
                  analysis={selectedAnalysis}
                  variants={variants}
                  onBack={() => setCurrentView('dashboard')}
                  onRerun={handleRunPipeline}
                  isExecuting={isExecuting}
                  liveLog={liveLog}
                />
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};
