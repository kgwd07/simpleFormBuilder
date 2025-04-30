import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET responses for a specific form
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const responses = await prisma.response.findMany({
      where: {
        formId: id,
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

// POST a new response
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    
    // Create the response with answers
    const newResponse = await prisma.$transaction(async (tx) => {
      // Create the response
      const response = await tx.response.create({
        data: {
          formId: id,
          createdAt: new Date(),
        },
      });
      
      // Create the answers
      await Promise.all(
        body.answers.map((answer: any) => 
          tx.answer.create({
            data: {
              responseId: response.id,
              questionId: answer.questionId,
              value: typeof answer.value === 'string' 
                ? answer.value 
                : JSON.stringify(answer.value),
            },
          })
        )
      );
      
      // Update the response count
      await tx.form.update({
        where: { id: id },
        data: {
          responseCount: {
            increment: 1,
          },
        },
      });
      
      return response;
    });
    
    // Fetch the created response with its answers
    const createdResponse = await prisma.response.findUnique({
      where: { id: newResponse.id },
      include: {
        answers: true,
      },
    });
    
    return NextResponse.json(createdResponse, { status: 201 });
  } catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
}

// DELETE all responses for a form
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    await prisma.$transaction(async (tx) => {
      // Delete all responses for this form
      await tx.response.deleteMany({
        where: {
          formId: id,
        },
      });
      
      // Reset the response count
      await tx.form.update({
        where: {
          id: id,
        },
        data: {
          responseCount: 0,
        },
      });
    });
    
    return NextResponse.json(
      { message: 'All responses deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting responses:', error);
    return NextResponse.json(
      { error: 'Failed to delete responses' },
      { status: 500 }
    );
  }
}