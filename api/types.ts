export interface CloudinaryDeleteRequest {
  publicId: string;
}

export interface CloudinaryDeleteResponse {
  success: boolean;
  result?: any;
  error?: string;
}