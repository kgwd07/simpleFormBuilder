import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all forms
export async function GET() {
  try {
    const forms = await prisma.form.findMany({
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

// POST a new form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create the form
    const newForm = await prisma.form.create({
      data: {
        title: body.title,
        description: body.description || '',
        status: body.status,
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
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    
    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
}