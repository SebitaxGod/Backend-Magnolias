import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials not configured. Storage features will be disabled.');
      this.isConfigured = false;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.isConfigured = true;
    console.log('✅ Supabase Storage configured successfully');
  }

  async uploadCV(
    file: Express.Multer.File,
    candidatoId: number,
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new BadRequestException('Storage service not configured. Please add Supabase credentials.');
    }

    const fileName = `cv-${candidatoId}-${Date.now()}.pdf`;
    const { error } = await this.supabase.storage
      .from('cvs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(`Error subiendo archivo: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from('cvs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async deleteCV(cvUrl: string): Promise<void> {
    if (!this.isConfigured) {
      throw new BadRequestException('Storage service not configured. Please add Supabase credentials.');
    }

    const fileName = cvUrl.split('/').pop();

    if (!fileName) {
      throw new BadRequestException('URL de CV inválida');
    }

    const { error } = await this.supabase.storage
      .from('cvs')
      .remove([fileName]);

    if (error) {
      throw new BadRequestException(
        `Error eliminando archivo: ${error.message}`,
      );
    }
  }
}
