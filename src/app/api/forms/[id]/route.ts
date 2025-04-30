import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string | undefined }> }
) {
  // Await the params object before accessing id
  const params = await context.params;
  const formId = params?.id;
  
  if (!formId) {
    return NextResponse.json({ error: 'Missing form ID' }, { status: 400 });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string | undefined }> }
) {
  // Await the params object before accessing id
  const params = await context.params;
  const formId = params?.id;
  
  if (!formId) {
    return NextResponse.json({ error: 'Missing form ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    
    // MongoDB transaction to update the form
    await prisma.$transaction(async (tx) => {
      // Delete existing questions (this will cascade to options due to relations)
      await tx.question.deleteMany({
        where: { formId: formId },
      });
      
      // Update the form with new data
      await tx.form.update({
        where: { id: formId },
        data: {
          title: body.title,
          description: body.description || '',
          status: body.status,
          updatedAt: new Date(),
          questions: {
            create: body.questions.map((q: any) => ({
              type: q.type,
              title: q.title,
              description: q.description || '',
              isRequired: q.isRequired || false,
              order: q.order,
              placeholder: q.placeholder || '',
              options: q.type === 'DROPDOWN' ? {
                create: q.options.map((opt: any) => ({
                  value: opt.value,
                })),
              } : undefined,
            })),
          },
        },
      });
    });
    
    // Fetch the updated form
    const updatedForm = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    
    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string | undefined }> }
) {
  // Await the params object before accessing id
  const params = await context.params;
  const formId = params?.id;
  
  if (!formId) {
    return NextResponse.json({ error: 'Missing form ID' }, { status: 400 });
  }

  try {
    // The cascading delete will handle related records
    await prisma.form.delete({
      where: { id: formId },
    });
    
    return NextResponse.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
}