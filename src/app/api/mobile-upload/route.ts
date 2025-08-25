import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTUtils } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;
    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    if (!token || !documentType || !file) {
      return NextResponse.json(
        { error: 'Token, document type, and file are required' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const decodedToken = JWTUtils.verifyQRToken(token);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('Processing upload for client ID:', decodedToken.clientId);

    const supabase = getSupabaseAdmin();

    // Check if QR token is still valid in database
    const { data: qrToken, error: qrTokenError } = await supabase
      .from('qr_tokens')
      .select('*')
      .eq('id', decodedToken.qrTokenId)
      .eq('client_id', decodedToken.clientId)
      .is('used_at', null)
      .single();

    if (qrTokenError || !qrToken) {
      console.error('QR token error:', qrTokenError);
      return NextResponse.json(
        { error: `QR token not found or already used: ${qrTokenError?.message || 'Token not found'}` },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (new Date(qrToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'QR token has expired' },
        { status: 401 }
      );
    }

    // Get or create client upload record
    const { data: existingUpload, error: uploadError } = await supabase
      .from('client_uploads')
      .select('*')
      .eq('client_id', decodedToken.clientId)
      .eq('qr_token_id', decodedToken.qrTokenId)
      .single();

    if (uploadError && uploadError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching client upload:', uploadError);
      return NextResponse.json(
        { error: 'Failed to fetch upload record' },
        { status: 500 }
      );
    }

    // Create upload record if it doesn't exist
    let clientUpload = existingUpload;
    if (!clientUpload) {
      const { data: newUpload, error: createError } = await supabase
        .from('client_uploads')
        .insert({
          client_id: decodedToken.clientId,
          qr_token_id: decodedToken.qrTokenId,
          upload_status: 'uploading'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating client upload:', createError);
        return NextResponse.json(
          { error: 'Failed to create upload record' },
          { status: 500 }
        );
      }

      clientUpload = newUpload;
    }

    // Upload file to Supabase Storage
    const fileName = `${clientUpload.id}/${documentType}_${Date.now()}.jpg`;
    const { data: uploadData, error: storageError } = await supabase.storage
      .from('client-documents')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600'
      });

    if (storageError) {
      console.error('Storage upload error:', storageError);
      return NextResponse.json(
        { error: `Failed to upload file: ${storageError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client-documents')
      .getPublicUrl(fileName);

    // Save a record for this uploaded document in client_qrscan
    try {
      await supabase
        .from('client_qrscan')
        .insert({
          client_id: decodedToken.clientId,
          qr_token_id: decodedToken.qrTokenId,
          document_type: documentType,
          storage_path: fileName,
          public_url: publicUrl,
          mime_type: file.type,
          size_bytes: (file as any).size || null
        });
    } catch (e) {
      console.error('client_qrscan insert failed:', e);
    }

    // Update client upload record with the uploaded file URL
    const updateData: any = {
      upload_status: 'uploading'
    };

    // Set the appropriate field based on document type
    switch (documentType) {
      case 'id_front':
        updateData.id_front_url = publicUrl;
        break;
      case 'id_back':
        updateData.id_back_url = publicUrl;
        break;
      case 'license_front':
        updateData.license_front_url = publicUrl;
        break;
      case 'license_back':
        updateData.license_back_url = publicUrl;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid document type' },
          { status: 400 }
        );
    }

    const { error: updateError } = await supabase
      .from('client_uploads')
      .update(updateData)
      .eq('id', clientUpload.id);

    if (updateError) {
      console.error('Error updating upload record:', updateError);
      return NextResponse.json(
        { error: 'Failed to update upload record' },
        { status: 500 }
      );
    }

    // NOTE: Do not auto-create or update clients here. We only save uploads (client_uploads, client_qrscan).

    // Check if all documents are uploaded
    const { data: updatedUpload } = await supabase
      .from('client_uploads')
      .select('*')
      .eq('id', clientUpload.id)
      .single();

    if (updatedUpload) {
      const hasIdPair = !!updatedUpload.id_front_url && !!updatedUpload.id_back_url;
      const hasLicensePair = !!updatedUpload.license_front_url && !!updatedUpload.license_back_url;

      console.log('Upload status check:', {
        id_front: !!updatedUpload.id_front_url,
        id_back: !!updatedUpload.id_back_url,
        license_front: !!updatedUpload.license_front_url,
        license_back: !!updatedUpload.license_back_url,
        hasIdPair,
        hasLicensePair
      });

      if (hasIdPair && hasLicensePair) {
        console.log('All required documents uploaded (ID + License). Starting processing...');
        // Start processing documents
        await processDocuments(updatedUpload.id, supabase);
      } else {
        console.log('Waiting for both ID and License (front and back) to start processing...');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      documentType,
      uploadId: clientUpload.id
    });

  } catch (error) {
    console.error('Mobile upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

async function processDocuments(uploadId: string, supabase: any) {
  try {
    console.log('Starting document processing for upload:', uploadId);
    
    // Update status to processing
    await supabase
      .from('client_uploads')
      .update({ 
        upload_status: 'processing',
        processing_status: 'processing'
      })
      .eq('id', uploadId);

    // Get the upload record with all document URLs
    const { data: upload, error } = await supabase
      .from('client_uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (error || !upload) {
      console.error('Failed to fetch upload record:', error);
      throw new Error('Failed to fetch upload record');
    }

    console.log('Processing upload with URLs:', {
      id_front: upload.id_front_url,
      id_back: upload.id_back_url,
      license_front: upload.license_front_url,
      license_back: upload.license_back_url
    });

    // Process documents using Google Document AI
    const parsedData: any = {};

    // Process ID documents
    if (upload.id_front_url) {
      try {
        console.log('Processing ID front document with Google Document AI...');
        // Extract file path from URL
        const filePath = upload.id_front_url.split('/client-documents/')[1];
        console.log('Extracted file path:', filePath);
        
        if (filePath) {
          const { data: idFrontData, error: downloadError } = await supabase.storage
            .from('client-documents')
            .download(filePath);

          if (downloadError) {
            console.error('Error downloading ID front:', downloadError);
          } else if (idFrontData) {
            console.log('Successfully downloaded ID front, size:', idFrontData.byteLength);
            const idFrontFile = new File([idFrontData], 'id_front.jpg', { type: 'image/jpeg' });
            
            // Use Google Document AI for processing
            const formData = new FormData();
            formData.append('file', idFrontFile);
            formData.append('documentType', 'auto');
            formData.append('side', 'auto');

            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ocr/process`, {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data && result.data.fields) {
                console.log('Document AI result for ID front:', result.data.fields);
                Object.assign(parsedData, result.data.fields);
              }
            } else {
              console.error('Document AI processing failed for ID front');
            }
          } else {
            console.error('No data received for ID front download');
          }
        } else {
          console.error('Could not extract file path from URL:', upload.id_front_url);
        }
      } catch (error) {
        console.error('Error processing ID front:', error);
      }
    }

    if (upload.id_back_url) {
      try {
        const filePath = upload.id_back_url.split('/client-documents/')[1];
        if (filePath) {
          const { data: idBackData } = await supabase.storage
            .from('client-documents')
            .download(filePath);

          if (idBackData) {
            const idBackFile = new File([idBackData], 'id_back.jpg', { type: 'image/jpeg' });
            
            // Use Google Document AI for processing
            const formData = new FormData();
            formData.append('file', idBackFile);
            formData.append('documentType', 'auto');
            formData.append('side', 'auto');

            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ocr/process`, {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data && result.data.fields) {
                // Merge data, prioritizing non-empty values from back
                Object.keys(result.data.fields).forEach(key => {
                  if (result.data.fields[key] && !parsedData[key]) {
                    parsedData[key] = result.data.fields[key];
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing ID back:', error);
      }
    }

    // Process license documents
    if (upload.license_front_url) {
      try {
        const filePath = upload.license_front_url.split('/client-documents/')[1];
        if (filePath) {
          const { data: licenseFrontData } = await supabase.storage
            .from('client-documents')
            .download(filePath);

          if (licenseFrontData) {
            const licenseFrontFile = new File([licenseFrontData], 'license_front.jpg', { type: 'image/jpeg' });
            
            // Use Google Document AI for processing
            const formData = new FormData();
            formData.append('file', licenseFrontFile);
            formData.append('documentType', 'auto');
            formData.append('side', 'auto');

            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ocr/process`, {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data && result.data.fields) {
                Object.assign(parsedData, result.data.fields);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing license front:', error);
      }
    }

    if (upload.license_back_url) {
      try {
        const filePath = upload.license_back_url.split('/client-documents/')[1];
        if (filePath) {
          const { data: licenseBackData } = await supabase.storage
            .from('client-documents')
            .download(filePath);

          if (licenseBackData) {
            const licenseBackFile = new File([licenseBackData], 'license_back.jpg', { type: 'image/jpeg' });
            
            // Use Google Document AI for processing
            const formData = new FormData();
            formData.append('file', licenseBackFile);
            formData.append('documentType', 'auto');
            formData.append('side', 'auto');

            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ocr/process`, {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data && result.data.fields) {
                // Merge data, prioritizing non-empty values from back
                Object.keys(result.data.fields).forEach(key => {
                  if (result.data.fields[key] && !parsedData[key]) {
                    parsedData[key] = result.data.fields[key];
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing license back:', error);
      }
    }

    console.log('Final parsed data:', parsedData);
    
    // Update upload record with parsed data
    const { error: updateError } = await supabase
      .from('client_uploads')
      .update({
        parsed_data: parsedData,
        upload_status: 'completed',
        processing_status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', uploadId);

    if (updateError) {
      console.error('Error updating upload record with parsed data:', updateError);
      throw updateError;
    } else {
      console.log('Successfully updated upload record with parsed data');
    }

    // Update client record with document URLs and parsed data
    const { data: clientUploadData } = await supabase
      .from('client_uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (clientUploadData) {
      const clientUpdateData: any = {
        // Update parsed data fields
        first_name: parsedData.firstName,
        last_name: parsedData.lastName,
        date_of_birth: parsedData.dateOfBirth,
        address: parsedData.address,
        license_number: parsedData.licenseNumber,
        // Update document URLs
        id_front_image_url: clientUploadData.id_front_url,
        id_back_image_url: clientUploadData.id_back_url,
        license_front_image_url: clientUploadData.license_front_url,
        license_back_image_url: clientUploadData.license_back_url,
        // Update additional parsed data
        nationality: parsedData.nationality,
        gender: parsedData.gender,
        id_number: parsedData.idNumber,
        status: 'active'
      };

      // Remove undefined values
      Object.keys(clientUpdateData).forEach(key => {
        if (clientUpdateData[key] === undefined || clientUpdateData[key] === null) {
          delete clientUpdateData[key];
        }
      });

      // Check if client exists, if not create it
      const { data: existingClient, error: clientCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientUploadData.client_id)
        .single();

      if (clientCheckError && clientCheckError.code === 'PGRST116') {
        // Client doesn't exist, create it
        const { error: clientCreateError } = await supabase
          .from('clients')
          .insert({
            id: clientUploadData.client_id,
            ...clientUpdateData
          });

        if (clientCreateError) {
          console.error('Error creating client record with parsed data:', clientCreateError);
        } else {
          console.log('Successfully created client record with parsed data');
        }
      } else if (clientCheckError) {
        console.error('Error checking client record:', clientCheckError);
      } else {
        // Client exists, update it
        const { error: clientUpdateError } = await supabase
          .from('clients')
          .update(clientUpdateData)
          .eq('id', clientUploadData.client_id);

        if (clientUpdateError) {
          console.error('Error updating client record:', clientUpdateError);
        } else {
          console.log('Successfully updated client record with document URLs and parsed data');
        }
      }
    }

  } catch (error) {
    console.error('Document processing error:', error);
    
    // Update status to failed
    await supabase
      .from('client_uploads')
      .update({
        upload_status: 'failed',
        processing_status: 'failed'
      })
      .eq('id', uploadId);
  }
} 