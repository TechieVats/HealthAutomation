export interface EsignClient {
  createEnvelope(args: {
    subject: string
    recipients: string[]
    htmlDoc: string
    callbackUrl: string
  }): Promise<{ envelopeId: string }>
  getStatus(envelopeId: string): Promise<'draft' | 'sent' | 'completed'>
  downloadPdf(envelopeId: string): Promise<Buffer>
}

export { MockDocumensoClient, mockDocumensoClient } from './mockDocumenso'

