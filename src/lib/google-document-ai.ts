// Google Document AI Integration
// This provides much better document parsing than template-based OCR

export interface DocumentAIResult {
  text: string;
  entities: DocumentEntity[];
  confidence: number;
  documentType: string;
  pages: Page[];
}

export interface DocumentEntity {
  type: string;
  mentionText: string;
  confidence: number;
  pageAnchor?: {
    page: number;
    boundingPoly: BoundingPoly;
  };
}

export interface Page {
  pageNumber: number;
  text: string;
  blocks: TextBlock[];
}

export interface TextBlock {
  boundingBox: BoundingPoly;
  confidence: number;
  text: string;
}

export interface BoundingPoly {
  vertices: Vertex[];
}

export interface Vertex {
  x: number;
  y: number;
}

export class GoogleDocumentAI {
  private projectId: string;
  private location: string;
  private processorId: string;
  private accessToken: string;

  constructor(projectId: string, location: string, processorId: string, accessToken: string) {
    this.projectId = projectId;
    this.location = location;
    this.processorId = processorId;
    this.accessToken = accessToken;
  }

  async processDocument(imageBuffer: Buffer): Promise<DocumentAIResult> {
    const base64Image = imageBuffer.toString('base64');
    
    const response = await fetch(
      `https://${this.location}-documentai.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}:process`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawDocument: {
            content: base64Image,
            mimeType: 'image/jpeg'
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Document AI Error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    return this.parseDocumentAIResponse(result);
  }

  private parseDocumentAIResponse(response: any): DocumentAIResult {
    const document = response.document;
    
    return {
      text: document.text || '',
      entities: (document.entities || []).map((entity: any) => ({
        type: entity.type,
        mentionText: entity.mentionText,
        confidence: entity.confidence,
        pageAnchor: entity.pageAnchor
      })),
      confidence: document.textConfidence || 0,
      documentType: document.mimeType || '',
      pages: (document.pages || []).map((page: any) => ({
        pageNumber: page.pageNumber,
        text: page.text || '',
        blocks: (page.blocks || []).map((block: any) => ({
          boundingBox: block.layout?.boundingPoly || {},
          confidence: block.layout?.confidence || 0,
          text: block.layout?.text || ''
        }))
      }))
    };
  }

  // Extract specific fields from Document AI results
  extractFields(result: DocumentAIResult) {
    const fields: any = {};
    
    // Extract entities by type
    result.entities.forEach(entity => {
      switch (entity.type) {
        case 'first_name':
          fields.firstName = entity.mentionText;
          break;
        case 'last_name':
          fields.lastName = entity.mentionText;
          break;
        case 'date_of_birth':
          fields.birthDate = entity.mentionText;
          break;
        case 'place_of_birth':
          fields.birthPlace = entity.mentionText;
          break;
        case 'document_id':
          fields.documentId = entity.mentionText;
          break;
        case 'expiry_date':
          fields.expiryDate = entity.mentionText;
          break;
        case 'nationality':
          fields.nationality = entity.mentionText;
          break;
        case 'gender':
          fields.gender = entity.mentionText;
          break;
        case 'address':
          fields.address = entity.mentionText;
          break;
        default:
          // Store unknown entity types
          if (!fields.unknownEntities) fields.unknownEntities = [];
          fields.unknownEntities.push({
            type: entity.type,
            text: entity.mentionText,
            confidence: entity.confidence
          });
      }
    });

    return {
      ...fields,
      fullText: result.text,
      confidence: result.confidence,
      documentType: result.documentType,
      rawResult: result
    };
  }
}

// Factory function to create Document AI instance
export function createDocumentAI(config: {
  projectId: string;
  location: string;
  processorId: string;
  accessToken: string;
}) {
  return new GoogleDocumentAI(
    config.projectId,
    config.location,
    config.processorId,
    config.accessToken
  );
}












