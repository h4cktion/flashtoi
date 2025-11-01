/**
 * API Route : Génération dynamique de planches
 *
 * GET /api/generate-planche?studentId=xxx&planche=bonne-fetes
 *
 * Génère une planche à la volée depuis la thumbnail de l'étudiant
 * et la retourne directement en streaming (SANS sauvegarde S3)
 *
 * Raison : Les parents se connectent généralement une seule fois,
 * donc inutile de stocker les previews sur S3
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { getTemplateByPlanche } from '@/lib/actions/template';
import { PlancheGenerator } from '@/lib/image/planche-generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const planche = searchParams.get('planche');

    // Validation des paramètres
    if (!studentId || !planche) {
      return NextResponse.json(
        { success: false, error: 'studentId and planche are required' },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    await connectDB();

    // Récupérer l'étudiant
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Vérifier que l'étudiant a une thumbnail
    if (!student.thumbnail?.cloudFrontUrl) {
      return NextResponse.json(
        { success: false, error: 'Student thumbnail not found' },
        { status: 404 }
      );
    }

    // Récupérer le template
    const templateResult = await getTemplateByPlanche(planche);
    if (!templateResult.success || !templateResult.data) {
      return NextResponse.json(
        { success: false, error: `Template not found: ${planche}` },
        { status: 404 }
      );
    }

    const template = templateResult.data;

    // Vérifier que le template a un background S3
    if (!template.backgroundS3Url) {
      return NextResponse.json(
        {
          success: false,
          error: `Template ${planche} doesn't have a background uploaded to S3`,
        },
        { status: 500 }
      );
    }

    // Initialiser le générateur
    const generator = new PlancheGenerator();

    console.log(`Generating planche: ${planche} for student ${studentId}`);
    console.log(`Template has ${template.photos.length} photos`);
    console.log(`Thumbnail URL: ${student.thumbnail.cloudFrontUrl}`);
    console.log(`Background URL: ${template.backgroundS3Url}`);

    // Générer la planche directement (sans vérifier S3)
    const plancheBuffer = await generator.generatePlanche({
      thumbnailUrl: student.thumbnail.cloudFrontUrl,
      template,
      studentData: {
        firstName: student.firstName,
        lastName: student.lastName,
        qrCode: student.qrCode,
      },
      addWatermark: true, // Toujours avec watermark pour les previews
    });

    console.log(`Planche generated successfully, buffer size: ${plancheBuffer.length} bytes`);

    // Retourner l'image directement en streaming
    return new NextResponse(new Uint8Array(plancheBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600', // Cache navigateur 1h (session parent)
      },
    });
  } catch (error) {
    console.error('Error in generate-planche API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
