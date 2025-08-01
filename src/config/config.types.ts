export interface WebscreenshotsConfig {
  url: string;
  outputDir: string;
  routes: string[];
  browserOptions: BrowserOptions;
  captureOptions: CaptureOptions;
  viewports: Viewport[];
}

export interface BrowserOptions {
  headless: boolean;
}

export interface CaptureOptions {
  fullPage: boolean;
  imageType: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

export interface Viewport {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor?: number;
}
