import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageProvider';
import Layout from './components/Layout';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTopWrapper from './components/ScrollToTopWrapper';
// ErrorPage is statically imported (not lazy) because ErrorBoundary uses it
// synchronously — lazy() here would conflict with the static import and produce a Vite warning.
import ErrorPage from './pages/ErrorPage';
import settings from './data/settings';
import Maintenance from './pages/Maintenance';
import Tracker from './components/Tracker';
import Splash from './components/Splash';
import Reveal from './components/Reveal';

// ─── Lazy-load all pages ───────────────────────────────────────────────────
// Each page only downloads when the user actually navigates to it.
// This cuts the initial JS bundle from ~1MB to only what Home needs.
const Home = lazy(() => import('./pages/Home'));
const Donate = lazy(() => import('./pages/Donate'));
const Volunteer = lazy(() => import('./pages/Volunteer'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const ReportProblem = lazy(() => import('./pages/ReportProblem'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const SadaqaJariya = lazy(() => import('./pages/SadaqaJariya'));
const Participate = lazy(() => import('./pages/Participate'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));

// Le Suspense (squelette de page) est dans Layout : en-tête et pied de page restent visibles.

function App() {
    if (settings.maintenance?.enabled) return <Router><Tracker /><Maintenance message={settings.maintenance.message} reopenAt={settings.maintenance.reopen_at} /></Router>;
    return (
        <LanguageProvider>
            <ThemeProvider>
                    <DataProvider>
                        <Splash />
                        <Reveal />
                        <Router>
                            <ScrollToTopWrapper />
                            <ErrorBoundary>
                                    <Routes>
                                        <Route path="/" element={<Layout />}>
                                            <Route index element={<Home />} />
                                            <Route path="donate" element={<Donate />} />
                                            <Route path="volunteer" element={<Volunteer />} />
                                            <Route path="news" element={<NewsPage />} />
                                            <Route path="programs" element={<ProgramsPage />} />

                                            <Route path="privacy-policy" element={<PrivacyPolicy />} />
                                            <Route path="terms-of-use" element={<TermsOfUse />} />
                                            <Route path="report-problem" element={<ReportProblem />} />
                                            <Route path="gallery" element={<GalleryPage />} />
                                            <Route path="sadaqa-jariya" element={<SadaqaJariya />} />
                                            <Route path="participate" element={<Participate />} />
                                            <Route path="feedback" element={<FeedbackPage />} />

                                            {/* Catch-all 404 */}
                                            <Route path="*" element={<ErrorPage is404={true} />} />
                                        </Route>
                                    </Routes>
                            </ErrorBoundary>
                        </Router>
                    </DataProvider>
            </ThemeProvider>
        </LanguageProvider >
    );
}

export default App;