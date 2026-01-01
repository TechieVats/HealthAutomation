export interface OcrClient {
  extractFields(filePath: string): Promise<Record<string, string>>
}

export { TesseractClient, tesseractClient } from './tesseractClient'

