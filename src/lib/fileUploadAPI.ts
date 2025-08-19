export class FileUploadAPI {
  private static uploadServerURL = 'http://localhost:3001';
  
  // Subir archivo al servidor
  static async uploadFile(file: File, folder: string = 'products'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
      const response = await fetch(`${this.uploadServerURL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return result.path;
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      throw error;
    }
  }
  
  // Eliminar archivo del servidor
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const response = await fetch(`${this.uploadServerURL}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: filePath }),
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw error;
    }
  }
}