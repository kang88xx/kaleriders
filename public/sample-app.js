import { initCaseStudies } from './case-studies.js?v=sample-20261029';

// Build the sample before the shared application scans text for localization.
initCaseStudies();
await import('./app.js?v=garden-bloom-20261026');
