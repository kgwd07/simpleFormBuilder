import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-gray-600 text-4xl font-bold mb-4">Simple Form Builder</h1>
          <p className="text-gray-600 text-lg">
            Create, manage, and collect responses from custom forms
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link href="/dashboard" passHref>
            <Button size="lg" className='cursor-pointer'>
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}