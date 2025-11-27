'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Diff, Hash } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ToonInput } from '@/components/toon-input';
import { DiffViewer } from '@/components/diff-viewer';
import { TokenCounter } from '@/components/token-counter';
import { LayoutContainer } from '@/components/layout-container';
import { useToonValidator } from '@/hooks/use-toon-validator';
import { useToonDiff } from '@/hooks/use-toon-diff';
import { useTokenCount } from '@/hooks/use-token-count';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { Adsense } from '@/components/ad-sense';

// -------------------------------------------
// FIREBASE
// -------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyDwZY_r5-BnePGCdCtDcFe9yoyn9aVrQgg",
  authDomain: "teste-78498.firebaseapp.com",
  projectId: "teste-78498",
  storageBucket: "teste-78498.firebasestorage.app",
  messagingSenderId: "428839136538",
  appId: "1:428839136538:web:f07e5aa6a20153ecdf50a3",
  measurementId: "G-GTX5F8HEM9"
};

let analytics: any = null;

if (typeof window !== "undefined") {
  const app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
}

// -------------------------------------------
// COMPONENTE
// -------------------------------------------

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [contentA, setContentA] = useState('');
  const [contentB, setContentB] = useState('');
  const [activeTab, setActiveTab] = useState('diff');
  const diffRef = useRef<HTMLDivElement>(null);
  
  const { validate: validateA, errors: errorsA, isValid: isValidA } = useToonValidator();
  const { validate: validateB, errors: errorsB, isValid: isValidB } = useToonValidator();
  const { compare, diffResults } = useToonDiff();
  const { calculateCompactness, compactness } = useTokenCount();

  // -------------------------------------------
  // PAGE VIEW
  // -------------------------------------------
  useEffect(() => {
    setTheme('light');

    if (analytics) {
      logEvent(analytics, "page_view", {
        page: "home_toon_diff",
      });
    }
  }, []);

  // Execuções automáticas por aba
  useEffect(() => {
    if (activeTab === 'diff' && contentA && contentB && diffResults.length === 0) {
      compare(contentA, contentB);
    } else if (activeTab === 'validate' && (contentA || contentB) && isValidA === null && isValidB === null) {
      if (contentA) validateA(contentA);
      if (contentB) validateB(contentB);
    } else if (activeTab === 'tokens' && contentA && contentB && !compactness) {
      calculateCompactness(contentA, contentB);
    }
  }, [
    activeTab,
    contentA,
    contentB,
    compare,
    validateA,
    validateB,
    calculateCompactness,
    diffResults.length,
    isValidA,
    isValidB,
    compactness
  ]);

  // -------------------------------------------
  // BOTÃO COMPARE → CLICK EVENT
  // -------------------------------------------
  const handleCompare = () => {
    compare(contentA, contentB);
    setActiveTab('diff');

    if (analytics) {
      logEvent(analytics, "compare_click", {
        contentA_length: contentA.length,
        contentB_length: contentB.length
      });
    }

    setTimeout(() => {
      diffRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleValidate = () => {
    validateA(contentA);
    validateB(contentB);
    setActiveTab('validate');
  };

  const handleTokenCount = () => {
    calculateCompactness(contentA, contentB);
    setActiveTab('tokens');
  };

  // -------------------------------------------
  // ABA ALTERADA → TRACKING
  // -------------------------------------------
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (analytics) {
      logEvent(analytics, "tab_change", {
        tab: value
      });
    }

    if (value === 'diff' && contentA && contentB) {
      compare(contentA, contentB);
    } else if (value === 'validate' && (contentA || contentB)) {
      if (contentA) validateA(contentA);
      if (contentB) validateB(contentB);
    } else if (value === 'tokens' && contentA && contentB) {
      calculateCompactness(contentA, contentB);
    }
  };


  const [adblockDetected, setAdblockDetected] = useState(false);

  // Detecta AdBlock
  useEffect(() => {
    const bait = document.createElement("script");
    bait.src = "/ads.js"; // nome propositalmente bloqueado
    bait.onerror = () => setAdblockDetected(true);
    bait.onload = () => {}; 

    document.body.appendChild(bait);

    return () => {
      document.body.removeChild(bait);
    };
  }, []);

  if (adblockDetected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-white">
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          AdBlock Detectado
        </h1>
        <p className="text-gray-700 max-w-md mb-6">
          Para continuar usando o <strong>TOON Diff</strong>, por favor desative o AdBlock
          para este site. A ferramenta precisa carregar scripts essenciais que
          bloqueadores acabam impedindo.
        </p>
      </div>
    );
  }

  // -------------------------------------------
  // RENDER
  // -------------------------------------------
  return (
    <LayoutContainer>
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <FileText className="w-10 h-10 text-blue-600" />
              TOON Diff
            </h1>
            <p className="text-gray-600 mt-2">
              Compare, check, and analyze TOON documents with precision
            </p>
            <p className="text-gray-600 mt-2">
              Created by <a href="https://atirson.com" className="text-blue-600">Atirson Fabiano</a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ToonInput
            label="TOON A"
            value={contentA}
            onChange={setContentA}
            placeholder="context:\n  task: Example TOON\n  season: 2025"
          />
          <ToonInput
            label="TOON B"
            value={contentB}
            onChange={setContentB}
            placeholder="context:\n  task: Example TOON\n  version: v2"
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={handleCompare} disabled={!contentA || !contentB} className="flex items-center gap-2" > <svg width="20" height="20" viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"> <line x1="4" y1="7" x2="16" y2="7" /> <line x1="4" y1="13" x2="16" y2="13" /> <line x1="5" y1="5" x2="15" y2="15" /> </svg> Compare Documents </Button>
        </div>

        <div style={{ minHeight: "100px" }} className="my-8">
          <Adsense slot="4549931740" />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="diff" className="flex items-center gap-2">
              <Diff className="w-4 h-4" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Token Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diff">
            <div ref={diffRef}>
              <DiffViewer diffResults={diffResults} />
            </div>
          </TabsContent>

          <TabsContent value="tokens">
            <TokenCounter compactness={compactness} />
          </TabsContent>
        </Tabs>
      </div>
    </LayoutContainer>
  );
}
