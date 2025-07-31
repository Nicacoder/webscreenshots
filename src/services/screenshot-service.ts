export interface ScreenshotService {
  capture: (url: string, outputPath: string) => Promise<void>;
}
