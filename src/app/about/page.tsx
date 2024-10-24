'use client';

import { Layout } from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <Layout>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                About IMMO-RAMA
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                IMMO-RAMA is your trusted partner in Swiss real estate. We connect property seekers 
                with their dream homes through innovative technology and personalized service.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Our Mission</h3>
                  <p className="mt-2 text-base text-gray-500">
                    To make the property search process efficient, transparent, and successful 
                    for everyone involved.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Our Values</h3>
                  <ul className="mt-2 text-base text-gray-500 list-disc pl-5 space-y-2">
                    <li>Transparency in all our dealings</li>
                    <li>Excellence in service delivery</li>
                    <li>Innovation in property search solutions</li>
                    <li>Customer satisfaction as our priority</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/contact" className="text-base font-medium text-blue-600 hover:text-blue-500">
                  Contact us to learn more
                </Link>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
              <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                <Image
                  className="max-h-12"
                  src="/images/trusted-partner-1.png"
                  alt="Trusted Partner"
                  width={48}
                  height={48}
                />
              </div>
              <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                <Image
                  className="max-h-12"
                  src="/images/trusted-partner-2.png"
                  alt="Trusted Partner"
                  width={48}
                  height={48}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}